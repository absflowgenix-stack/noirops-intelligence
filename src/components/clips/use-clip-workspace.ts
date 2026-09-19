import { useMemo, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { detectPlatform, formatTimecode } from "@/lib/video-platforms";
import { transcriptFormat } from "@/lib/transcript";
import { prepareAudioChunks } from "@/lib/audio";
import { renderClip as renderClipLib } from "@/lib/clip-renderer";

export type InputMode = "link" | "video" | "upload" | "transcript";

export type VideoStage =
  | "idle"
  | "decoding"
  | "uploading"
  | "transcribing"
  | "analyzing";

export const SOURCE_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  analyzing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
};

/** Hard safety cap: decoding multi-GB files in the browser can exhaust memory. */
export const MAX_VIDEO_BYTES = 1024 * 1024 * 1024; // 1 GB

/** Transcript files share the same 1 GB cap (raised from 5 MB). */
export const MAX_TRANSCRIPT_FILE_BYTES = 1024 * 1024 * 1024; // 1 GB

/**
 * All state, data queries and flows for the AI Video Clipping page,
 * extracted from the page component so views stay small and focused.
 */
export function useClipWorkspace() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const createSource = useMutation(api.videoClips.createSource);
  const deleteSource = useMutation(api.videoClips.deleteSource);
  const updateClipStatus = useMutation(api.videoClips.updateClipStatus);
  const createDraft = useMutation(api.content.create);
  const generateUploadUrl = useMutation(api.videoClips.generateUploadUrl);
  const attachSourceAudio = useMutation(api.videoClips.attachSourceAudio);
  const attachClipAsset = useMutation(api.videoClips.attachClipAsset);
  const markClipAssetFailed = useMutation(api.videoClips.markClipAssetFailed);
  const ensureShareToken = useMutation(api.videoClips.ensureShareToken);
  const analyze = useAction(api.videoClipping.analyzeSource);
  const transcribe = useAction(api.audioTranscribe.transcribeFromStorage);
  // Enriches metadata/captions AND pulls the source video into NoirOps storage
  // when the platform exposes it, so clips can be previewed and rendered here.
  const enrichLink = useAction(api.mediaIngest.enrichAndIngestLink);

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

  // ── Render + share state ─────────────────────────────────
  const [renderingClipId, setRenderingClipId] = useState<Id<"videoClips"> | null>(null);
  const [renderPct, setRenderPct] = useState(0);
  const [shareLinks, setShareLinks] = useState<Record<string, string>>({});

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

  // All clips of a source share one media file; subscribe once for playback.
  const firstClipId = clips && clips.length > 0 ? clips[0]!._id : undefined;
  const sourceMediaUrl = useQuery(
    api.videoClips.getClipMediaUrl,
    firstClipId ? { clipId: firstClipId } : "skip"
  ) as { url: string; origin: "noirops" | "platform"; contentType?: string } | null | undefined;

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
    if (file.size > MAX_TRANSCRIPT_FILE_BYTES) {
      toast.error("Transcript file is too large (max 1 GB).");
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
      toast.error(
        "Video is too large for in-browser transcription (max 1 GB). Trim it or use a link."
      );
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
        title.trim() ||
        (detected?.name && detected.id !== "link" ? `${detected.name} video` : "Untitled video");
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

        // A pasted transcript (if any) takes priority; otherwise enrich the
        // link: pull captions/metadata AND fetch the video into NoirOps
        // storage when the platform allows it.
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
          } else if (result.mediaStored) {
            toast.success(result.message);
          } else {
            toast(result.message, {
              description:
                "The link was enriched with platform metadata — add its transcript below for timed clips.",
            });
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

    // ── Transcript paste / transcript-file flow ─────────────
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

  // ── Clip + source actions (shared by views) ──────────────
  const acceptClip = async (clip: Doc<"videoClips">) => {
    try {
      await updateClipStatus({ clipId: clip._id, status: "accepted" });
      toast.success("Clip accepted — ready for editing.");
    } catch {
      toast.error("Could not update the clip.");
    }
  };

  const dismissClip = async (clip: Doc<"videoClips">) => {
    await updateClipStatus({ clipId: clip._id, status: "dismissed" });
  };

  const copyTimecodes = (clip: Doc<"videoClips">) => {
    const edl = `${formatTimecode(clip.startSec)} --> ${formatTimecode(clip.endSec)}`;
    navigator.clipboard.writeText(edl);
    toast.success("Timecodes copied (EDL format).");
  };

  const copyCaption = (clip: Doc<"videoClips">) => {
    navigator.clipboard.writeText(clip.caption ?? "");
    toast.success("Caption copied");
  };

  // ── Clip preview / render / share (client delivery) ──────

  /**
   * Render a clip in the browser from the source media, upload the result
   * to Convex storage, and attach it to the clip for in-app + share playback.
   */
  const renderClipAsset = async (clip: Doc<"videoClips">) => {
    if (!userId || !activeSourceId || clip.sourceId !== activeSourceId) return;
    try {
      setRenderingClipId(clip._id);
      setRenderPct(1);

      if (!sourceMediaUrl?.url) {
        toast.error(
          "No playable media for this source yet — upload the video file or use a link whose video can be fetched.",
          { description: "Timecodes, captions and edits still work without media." }
        );
        setRenderingClipId(null);
        return;
      }

      const rendered = await renderClipLib({
        sourceUrl: sourceMediaUrl.url,
        startSec: clip.startSec,
        endSec: clip.endSec,
        aspectRatio: clip.aspectRatio,
        overlayText: clip.hook ?? null,
        onProgress: setRenderPct,
      });

      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": rendered.contentType },
        body: rendered.blob,
      });
      if (!res.ok) throw new Error(`Clip upload failed (${res.status}).`);
      const { storageId } = (await res.json()) as { storageId: string };

      await attachClipAsset({
        clipId: clip._id,
        assetStorageId: storageId as Id<"_storage">,
        assetBytes: rendered.blob.size,
        assetContentType: rendered.contentType,
      });
      toast.success("Clip rendered and saved — it now plays right here.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Clip render failed";
      try {
        await markClipAssetFailed({ clipId: clip._id, errorMessage: message });
      } catch {
        // Best-effort bookkeeping.
      }
      toast.error(message.slice(0, 200));
    } finally {
      setRenderingClipId(null);
      setRenderPct(0);
    }
  };

  /** Create (or reuse) the public share link for a clip. */
  const shareClip = async (clip: Doc<"videoClips">) => {
    try {
      const token = await ensureShareToken({ clipId: clip._id });
      const url = `${window.location.origin}/share/clip/${token}`;
      setShareLinks((prev) => ({ ...prev, [clip._id]: url }));
      await navigator.clipboard.writeText(url).catch(() => undefined);
      toast.success("Share link copied — anyone with it can view this clip.");
      return url;
    } catch {
      toast.error("Could not create the share link.");
      return null;
    }
  };

  const getShareLink = (clipId: string) => shareLinks[clipId] ?? null;

  const sendToDrafts = async (clip: Doc<"videoClips">) => {
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

  const removeSource = async (sourceId: string) => {
    try {
      await deleteSource({ sourceId: sourceId as Id<"videoSources"> });
      toast.success("Source and its clips deleted.");
    } catch {
      toast.error("Could not delete the source.");
    }
  };

  const openSource = (sourceId: Id<"videoSources">) => setActiveSourceId(sourceId);

  return {
    // input state
    mode, setMode,
    title, setTitle,
    linkUrl, setLinkUrl,
    durationInput, setDurationInput,
    transcriptText, setTranscriptText,
    focusTopic, setFocusTopic,
    uploadedName, setUploadedName,
    videoFile,
    videoStage, videoProgress,
    fileInputRef, videoInputRef,
    // derived
    detected, tFormat, busy, canAnalyze, stage,
    // data
    sources, activeSource, clips, activeSourceId, sourceMediaUrl,
    // actions
    handleFile, handleVideoFile, handleAnalyze, reset,
    acceptClip, dismissClip, copyTimecodes, copyCaption, sendToDrafts,
    removeSource, openSource,
    // render + share
    renderingClipId, renderPct,
    renderClipAsset, shareClip, getShareLink,
  };
}

export type ClipWorkspace = ReturnType<typeof useClipWorkspace>;
