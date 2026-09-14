import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Scissors,
  Link2,
  Upload,
  FileText,
  Loader2,
  Sparkles,
  ArrowLeft,
  Clock,
  Check,
  Trash2,
  Film,
  AlertCircle,
  Video,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  detectPlatform,
  formatDuration,
  formatTimecode,
} from "@/lib/video-platforms";
import { transcriptFormat } from "@/lib/transcript";
import { prepareAudioChunks } from "@/lib/audio";
import { ClipCard } from "@/components/clips/ClipCard";

type InputMode = "link" | "video" | "upload" | "transcript";

type VideoStage =
  | "idle"
  | "decoding"
  | "uploading"
  | "transcribing"
  | "analyzing";

const SOURCE_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  analyzing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

/** Hard safety cap: decoding multi-GB files in the browser can exhaust memory. */
const MAX_VIDEO_BYTES = 1024 * 1024 * 1024; // 1 GB

export default function AIVideoClipping() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const createSource = useMutation(api.videoClips.createSource);
  const deleteSource = useMutation(api.videoClips.deleteSource);
  const updateClipStatus = useMutation(api.videoClips.updateClipStatus);
  const createDraft = useMutation(api.content.create);
  const generateUploadUrl = useMutation(api.videoClips.generateUploadUrl);
  const attachSourceAudio = useMutation(api.videoClips.attachSourceAudio);
  const analyze = useAction(api.videoClipping.analyzeSource);
  const transcribe = useAction(api.audioTranscribe.transcribeFromStorage);
  const enrichLink = useAction(api.platformIngest.enrichLinkSource);

  // ── Input state ──────────────────────────────────────────
  const [mode, setMode] = useState<InputMode>("link");
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [focusTopic, setFocusTopic] = useState("");
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoStage, setVideoStage] = useState<VideoStage>("idle");
  const [videoProgress, setVideoProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // ── Flow state ───────────────────────────────────────────
  const [activeSourceId, setActiveSourceId] = useState<Id<"videoSources"> | null>(null);
  const [stage, setStage] = useState<"idle" | "creating" | "analyzing">("idle");

  // ── Data ─────────────────────────────────────────────────
  const sources = useQuery(
    api.videoClips.listSources,
    userId && !activeSourceId ? { userId, limit: 12 } : "skip"
  ) as Doc<"videoSources">[] | undefined;

  const activeSource = useQuery(
    api.videoClips.getSource,
    activeSourceId ? { sourceId: activeSourceId } : "skip"
  ) as Doc<"videoSources"> | undefined;

  const clips = useQuery(
    api.videoClips.listClipsForSource,
    activeSourceId ? { sourceId: activeSourceId } : "skip"
  ) as Doc<"videoClips">[] | undefined;

  // ── Derived ──────────────────────────────────────────────
  const detected = useMemo(() => detectPlatform(linkUrl), [linkUrl]);
  const tFormat = useMemo(
    () => (transcriptText.trim() ? transcriptFormat(transcriptText) : null),
    [transcriptText]
  );
  const busy = stage !== "idle" || videoStage !== "idle";

  const canAnalyze =
    !!userId &&
    !busy &&
    (mode === "video"
      ? !!videoFile
      : mode === "link"
        ? !!linkUrl.trim()
        : transcriptText.trim().length > 40 &&
          (mode !== "upload" || !!uploadedName));

  // ── Handlers: transcript file ────────────────────────────
  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Transcript file is too large (max 5 MB).");
      return;
    }
    const text = await file.text();
    setTranscriptText(text);
    setUploadedName(file.name);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.(srt|vtt|txt)$/i, "").replace(/[_-]+/g, " "));
    }
    toast.success(`Loaded ${file.name}`);
  };

  // ── Handlers: video file ─────────────────────────────────
  const handleVideoFile = (file: File) => {
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error("Video is too large for in-browser transcription (max 1 GB). Trim it or use a link.");
      return;
    }
    setVideoFile(file);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
    }
  };

  /**
   * Local video flow: create source → extract + chunk audio in the browser →
   * upload WAV parts → server-side Whisper transcription → AI clipping.
   */
  const handleVideoAnalyze = async () => {
    if (!userId || !videoFile) return;
    try {
      setVideoStage("decoding");
      setVideoProgress(8);
      const { chunks, durationSec } = await prepareAudioChunks(videoFile);

      setVideoStage("uploading");
      setVideoProgress(20);
      const storageIds: Id<"_storage">[] = [];
      const chunkStarts: number[] = [];
      for (let i = 0; i < chunks.length; i++) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "audio/wav" },
          body: chunks[i].blob,
        });
        if (!res.ok) throw new Error(`Audio upload failed (${res.status}).`);
        const { storageId } = (await res.json()) as { storageId: string };
        storageIds.push(storageId as Id<"_storage">);
        chunkStarts.push(chunks[i].startSec);
        setVideoProgress(20 + Math.round(((i + 1) / chunks.length) * 40));
      }

      const sourceId = await createSource({
        userId,
        title: title.trim() || videoFile.name.replace(/\.[^.]+$/, ""),
        sourceKind: "upload",
        fileSizeBytes: videoFile.size,
        mimeType: videoFile.type || "video/*",
      });
      await attachSourceAudio({
        sourceId,
        audioStorageIds: storageIds,
        durationSec,
        fileSizeBytes: videoFile.size,
        mimeType: videoFile.type || undefined,
      });

      setVideoStage("transcribing");
      setVideoProgress(65);
      await transcribe({
        sourceId,
        audioStorageIds: storageIds,
        chunkStarts,
        focusTopic: focusTopic.trim() || undefined,
      });

      setVideoProgress(100);
      toast.success("Transcription + analysis complete — clips are ready.");
      setActiveSourceId(sourceId);
      setVideoStage("idle");
      setVideoProgress(0);
    } catch (err) {
      setVideoStage("idle");
      setVideoProgress(0);
      const message = err instanceof Error ? err.message : "Video analysis failed";
      toast.error(message.slice(0, 200), {
        description: "Try a smaller file, or paste an SRT transcript instead.",
      });
    }
  };

  // ── Handlers: transcript / link ──────────────────────────
  const reset = () => {
    setActiveSourceId(null);
    setStage("idle");
    setMode("link");
    setTitle("");
    setLinkUrl("");
    setDurationInput("");
    setTranscriptText("");
    setFocusTopic("");
    setUploadedName(null);
    setVideoFile(null);
    setVideoStage("idle");
    setVideoProgress(0);
  };

  const handleAnalyze = async () => {
    if (!canAnalyze || busy) return;

    // ── Video file flow (separate progress pipeline) ───────
    if (mode === "video") {
      await handleVideoAnalyze();
      return;
    }

    // ── Link flow ───────────────────────────────────────────
    if (mode === "link") {
      const url = linkUrl.trim();
      const finalTitle =
        title.trim() || (detected?.name && detected.id !== "link" ? `${detected.name} video` : "Untitled video");
      try {
        setStage("creating");
        const sourceId = await createSource({
          userId,
          title: finalTitle,
          sourceKind: "link",
          url,
          platform: detected && detected.id !== "link" ? detected.id : undefined,
          videoId: detected?.videoId,
        });

        // A pasted transcript (if any) takes priority; otherwise try to pull
        // captions automatically and enrich with platform metadata.
        if (tFormat && tFormat !== "plain" && transcriptText.trim().length > 40) {
          setStage("analyzing");
          await analyze({
            sourceId,
            transcriptText: transcriptText.trim(),
            durationSec: Number(durationInput) > 0 ? Number(durationInput) : undefined,
            focusTopic: focusTopic.trim() || undefined,
          });
          toast.success("Analysis complete — clips are ready below.");
        } else {
          setStage("analyzing");
          const result = await enrichLink({
            sourceId,
            url,
            focusTopic: focusTopic.trim() || undefined,
            autoAnalyze: true,
          });
          if (result.transcriptFound) {
            toast.success(result.message);
          } else {
            toast(result.message, { description: "The link was enriched with platform metadata." });
          }
        }
        setActiveSourceId(sourceId);
        setStage("idle");
      } catch (err) {
        setStage("idle");
        const message = err instanceof Error ? err.message : "Analysis failed";
        toast.error(message.slice(0, 200));
      }
      return;
    }

    // ── Transcript paste / transcript-file flow (unchanged) ──
    if (tFormat === "plain") {
      toast.error(
        "This transcript has no timestamps. Paste an SRT or VTT transcript (with timecodes) so clips can be located in the video."
      );
      return;
    }

    const trimmed = transcriptText.trim();
    const finalTitle =
      title.trim() ||
      (mode === "upload" && uploadedName
        ? uploadedName.replace(/\.(srt|vtt|txt)$/i, "")
        : "Untitled video");
    const durationSec = Number(durationInput) > 0 ? Number(durationInput) : undefined;

    try {
      setStage("creating");
      const sourceId = await createSource({
        userId,
        title: finalTitle,
        sourceKind: mode === "upload" ? "upload" : "transcript",
        platform: detected && detected.id !== "link" ? detected.id : undefined,
      });

      setStage("analyzing");
      await analyze({
        sourceId,
        transcriptText: trimmed,
        durationSec,
        focusTopic: focusTopic.trim() || undefined,
      });

      toast.success("Analysis complete — clips are ready below.");
      setActiveSourceId(sourceId);
      setStage("idle");
    } catch (err) {
      setStage("idle");
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast.error(message.slice(0, 200), {
        description: "Adjust the transcript and try again.",
      });
    }
  };

  const handleSendToDrafts = async (clip: Doc<"videoClips">) => {
    if (!userId) return;
    try {
      const hashtags = (clip.hashtags ?? []).join(" ");
      await createDraft({
        userId,
        title: clip.title,
        body: [clip.caption, hashtags].filter(Boolean).join("\n\n"),
        platform: clip.targetPlatform ?? undefined,
        contentType: "clip",
        status: "draft",
        generationParams: {
          origin: "video-clipping",
          clipId: clip._id,
          sourceId: clip.sourceId,
          startSec: clip.startSec,
          endSec: clip.endSec,
        },
      });
      await updateClipStatus({ clipId: clip._id, status: "exported" });
      toast.success("Sent to Content History as a draft.");
    } catch {
      toast.error("Could not create the draft.");
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    try {
      await deleteSource({ sourceId: sourceId as Id<"videoSources"> });
      toast.success("Source and its clips deleted.");
    } catch {
      toast.error("Could not delete the source.");
    }
  };

  const VIDEO_STAGE_LABELS: Record<VideoStage, string> = {
    idle: "",
    decoding: "Extracting & chunking audio in your browser...",
    uploading: "Uploading audio chunks...",
    transcribing: "Transcribing with AI (Whisper)...",
    analyzing: "Finding the best moments...",
  };

  // ── Results view ─────────────────────────────────────────
  if (activeSourceId) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={reset}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight truncate">
              {activeSource?.title ?? "Analysis"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {clips
                ? `${clips.length} clip${clips.length === 1 ? "" : "s"} suggested`
                : "Loading clips..."}
              {activeSource?.durationSec
                ? ` from ${formatDuration(activeSource.durationSec)} of video`
                : ""}
            </p>
          </div>
          {activeSource && (
            <Badge
              variant="outline"
              className={cn("text-[10px]", SOURCE_STATUS_STYLES[activeSource.status])}
            >
              {activeSource.status}
            </Badge>
          )}
        </div>

        {activeSource?.errorMessage && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-red-500">Analysis issue</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {activeSource.errorMessage}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!clips ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading clips...
          </div>
        ) : clips.length === 0 ? (
          <div className="text-center py-16">
            <Scissors className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No clips yet for this source. Run the analysis again with a richer transcript.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {clips.map((clip, index) => (
              <ClipCard
                key={clip._id}
                clip={clip}
                index={index}
                totalDuration={activeSource?.durationSec ?? undefined}
                onAccept={async () => {
                  try {
                    await updateClipStatus({ clipId: clip._id, status: "accepted" });
                    toast.success("Clip accepted — ready for editing.");
                  } catch {
                    toast.error("Could not update the clip.");
                  }
                }}
                onSendToDrafts={() => handleSendToDrafts(clip)}
                onCopyTimecodes={() => {
                  const edl = `${formatTimecode(clip.startSec)} --> ${formatTimecode(clip.endSec)}`;
                  navigator.clipboard.writeText(edl);
                  toast.success("Timecodes copied (EDL format).");
                }}
                onDismiss={async () => {
                  await updateClipStatus({ clipId: clip._id, status: "dismissed" });
                }}
                onCopyCaption={() => {
                  navigator.clipboard.writeText(clip.caption ?? "");
                  toast.success("Caption copied");
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── New analysis view ────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">AI Video Clipping</h1>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
            Beta
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm mt-1">
          Turn long-form video into publish-ready shorts. Upload a video from your device, paste a
          link from any major platform, or bring a transcript — the AI finds the strongest moments
          and suggests edits and transitions.
        </p>
      </div>

      {/* Input card */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-4">
          {/* Mode tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as InputMode)}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="link" className="gap-1.5 cursor-pointer text-xs">
                <Link2 className="h-3.5 w-3.5" /> Link
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-1.5 cursor-pointer text-xs">
                <Video className="h-3.5 w-3.5" /> Video
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-1.5 cursor-pointer text-xs">
                <Upload className="h-3.5 w-3.5" /> SRT file
              </TabsTrigger>
              <TabsTrigger value="transcript" className="gap-1.5 cursor-pointer text-xs">
                <FileText className="h-3.5 w-3.5" /> Paste
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Title + duration */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Video title</label>
              <Input
                placeholder="e.g. Podcast ep. 42 — Scaling to 100k"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm"
              />
            </div>
            {mode !== "video" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Duration in seconds <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  placeholder="Auto-detected when possible"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* Link input with live detection */}
          {mode === "link" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Video URL (YouTube, TikTok, Instagram, X, Facebook, Vimeo, Twitch, LinkedIn,
                Reddit, Dailymotion, Rumble)
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://youtube.com/watch?v=..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
                {linkUrl.trim() && detected && (
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", detected.color)}>
                    {detected.name}
                    {detected.confidence === "unknown" ? " (generic link)" : ""}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                <Wand2 className="h-3 w-3 mt-0.5 shrink-0 text-primary/70" />
                YouTube links are transcribed automatically from public captions. Other platforms
                are enriched with metadata — add their transcript below or use the Video tab.
              </p>
            </div>
          )}

          {/* Video file input */}
          {mode === "video" && (
            <div className="space-y-1.5">
              <div
                className="border border-dashed border-border/70 rounded-md p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
                onClick={() => videoInputRef.current?.click()}
              >
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*,audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleVideoFile(f);
                  }}
                />
                {videoFile ? (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium truncate max-w-[320px]">{videoFile.name}</span>
                    <span className="text-muted-foreground text-xs shrink-0">
                      ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB) — click to replace
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Video className="h-5 w-5 text-muted-foreground mx-auto" />
                    <p className="text-sm font-medium">Upload a video or audio file</p>
                    <p className="text-xs text-muted-foreground">
                      MP4, MOV, WebM, MP3, WAV... Audio is extracted in your browser and
                      transcribed with AI. Max 1 GB.
                    </p>
                  </div>
                )}
              </div>
              {videoStage !== "idle" && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {VIDEO_STAGE_LABELS[videoStage]}
                  </div>
                  <Progress value={videoProgress} className="h-1.5" aria-label="Video processing" />
                </div>
              )}
            </div>
          )}

          {/* Transcript file (SRT/VTT/TXT) upload */}
          {mode === "upload" && (
            <div
              className="border border-dashed border-border/70 rounded-md p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".srt,.vtt,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleFile(f);
                }}
              />
              {uploadedName ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">{uploadedName}</span>
                  <span className="text-muted-foreground text-xs">— click to replace</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="h-5 w-5 text-muted-foreground mx-auto" />
                  <p className="text-sm font-medium">Upload an SRT, VTT or TXT transcript</p>
                  <p className="text-xs text-muted-foreground">
                    Timed transcripts (SRT/VTT) give frame-accurate clips. Max 5 MB.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transcript paste (link / upload / transcript modes) */}
          {mode !== "video" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Transcript{" "}
                  {mode === "upload" && uploadedName
                    ? "(loaded from file)"
                    : mode === "link"
                      ? " (optional — auto-pulled for YouTube)"
                      : ""}
                </label>
                {tFormat && (
                  <Badge variant="outline" className="text-[10px]">
                    {tFormat === "srt"
                      ? "SRT detected"
                      : tFormat === "vtt"
                        ? "WebVTT detected"
                        : "Plain text — needs timecodes"}
                  </Badge>
                )}
              </div>
              <Textarea
                placeholder={
                  "1\n00:00:00,000 --> 00:00:12,000\nWelcome back to the show...\n\n2\n00:00:12,000 --> 00:00:30,000\nToday we're talking about..."
                }
                value={transcriptText}
                onChange={(e) => {
                  setTranscriptText(e.target.value);
                  setUploadedName(null);
                }}
                className="min-h-[160px] font-mono text-xs leading-relaxed"
              />
              {transcriptText.trim() && (
                <p className="text-[11px] text-muted-foreground">
                  {transcriptText.trim().split(/\s+/).length.toLocaleString()} words
                  {tFormat === "plain" ? " — paste timecoded SRT/VTT for timed clips" : ""}
                </p>
              )}
            </div>
          )}

          {/* Focus topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Topic focus <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <Input
              placeholder="e.g. pricing strategy, hiring lessons, product demos"
              value={focusTopic}
              onChange={(e) => setFocusTopic(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Action */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-muted-foreground">
              {mode === "video"
                ? "Transcription runs on chunked audio; long videos are fully supported."
                : mode === "link"
                  ? "YouTube captions are fetched automatically; other platforms need a transcript or upload."
                  : tFormat === "plain"
                    ? "Add timecoded SRT/VTT text to enable clipping."
                    : "The AI returns up to 8 ranked, non-overlapping clips."}
            </p>
            <Button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="gap-2 cursor-pointer"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "video"
                    ? "Processing..."
                    : stage === "creating"
                      ? "Preparing..."
                      : "Analyzing..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Find best moments
                </>
              )}
            </Button>
          </div>
          {mode !== "video" && stage !== "idle" && (
            <Progress
              value={stage === "creating" ? 30 : 70}
              className="h-1"
              aria-label="Analysis progress"
            />
          )}
        </CardContent>
      </Card>

      {/* Recent analyses */}
      <div>
        <h2 className="text-sm font-semibold tracking-tight mb-2 flex items-center gap-2">
          <Film className="h-4 w-4 text-muted-foreground" /> Recent analyses
        </h2>
        {!sources ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : sources.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/60 rounded-md">
            <Scissors className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No analyses yet. Your first video&apos;s clips will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sources.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: Math.min(i * 0.03, 0.2) }}
              >
                <Card className="border-border/50 hover:border-border transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium truncate max-w-[320px]">{s.title}</h3>
                        {s.platform && (
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {s.platform}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", SOURCE_STATUS_STYLES[s.status] ?? "")}
                        >
                          {s.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        {s.durationSec ? (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDuration(s.durationSec)}
                          </span>
                        ) : null}
                        <span>{s.sourceKind}</span>
                        {s.fileSizeBytes ? (
                          <span>{(s.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                        ) : null}
                        {s.authorName ? <span>by {s.authorName}</span> : null}
                      </div>
                      {s.status === "failed" && s.errorMessage && (
                        <p className="text-[10px] text-red-500/80 mt-1 line-clamp-1">
                          {s.errorMessage}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 cursor-pointer"
                        onClick={() => setActiveSourceId(s._id)}
                        disabled={s.status !== "ready"}
                      >
                        View clips
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive cursor-pointer"
                        onClick={() => handleDeleteSource(s._id)}
                        title="Delete source and clips"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

