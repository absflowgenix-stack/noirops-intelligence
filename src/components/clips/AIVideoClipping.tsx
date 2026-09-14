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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  detectPlatform,
  formatDuration,
  formatTimecode,
} from "@/lib/video-platforms";
import { transcriptFormat } from "@/lib/transcript";
import { ClipCard } from "@/components/clips/ClipCard";

type InputMode = "link" | "upload" | "transcript";

const SOURCE_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  analyzing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function AIVideoClipping() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const createSource = useMutation(api.videoClips.createSource);
  const deleteSource = useMutation(api.videoClips.deleteSource);
  const updateClipStatus = useMutation(api.videoClips.updateClipStatus);
  const createDraft = useMutation(api.content.create);
  const analyze = useAction(api.videoClipping.analyzeSource);

  // ── Input state ──────────────────────────────────────────
  const [mode, setMode] = useState<InputMode>("link");
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [focusTopic, setFocusTopic] = useState("");
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const busy = stage !== "idle";

  const canAnalyze =
    !!userId &&
    !busy &&
    transcriptText.trim().length > 40 &&
    (mode !== "link" || !!linkUrl.trim());

  // ── Handlers ─────────────────────────────────────────────
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
  };

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
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
        : detected?.name
          ? `${detected.name} video`
          : "Untitled video");
    const durationSec = Number(durationInput) > 0 ? Number(durationInput) : undefined;

    try {
      setStage("creating");
      const sourceId = await createSource({
        userId,
        title: finalTitle,
        sourceKind: mode === "upload" ? "upload" : mode === "link" ? "link" : "transcript",
        url: mode === "link" && linkUrl.trim() ? linkUrl.trim() : undefined,
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
          Turn long-form video into publish-ready shorts. Paste a link, upload a transcript file,
          or drop in a transcript — the AI finds the strongest moments and suggests edits and
          transitions.
        </p>
      </div>

      {/* Input card */}
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-4">
          {/* Mode tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as InputMode)}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="link" className="gap-1.5 cursor-pointer text-xs">
                <Link2 className="h-3.5 w-3.5" /> Video link
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-1.5 cursor-pointer text-xs">
                <Upload className="h-3.5 w-3.5" /> Transcript file
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Duration in seconds <span className="text-muted-foreground/60">(optional)</span>
              </label>
              <Input
                type="number"
                min={0}
                placeholder="Auto-detected from transcript"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                className="text-sm"
              />
            </div>
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
              <p className="text-[11px] text-muted-foreground">
                The platform can&apos;t download video directly — paste the transcript below
                (YouTube auto-captions can be copied from the transcript panel).
              </p>
            </div>
          )}

          {/* Upload input */}
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

          {/* Transcript */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Transcript {mode === "upload" && uploadedName ? "(loaded from file)" : ""}
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
              className="min-h-[180px] font-mono text-xs leading-relaxed"
            />
            {transcriptText.trim() && (
              <p className="text-[11px] text-muted-foreground">
                {transcriptText.trim().split(/\s+/).length.toLocaleString()} words
                {tFormat === "plain" ? " — paste timecoded SRT/VTT for timed clips" : ""}
              </p>
            )}
          </div>

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
              {tFormat === "plain"
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
                  {stage === "creating" ? "Preparing..." : "Analyzing transcript..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Find best moments
                </>
              )}
            </Button>
          </div>
          {busy && (
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
