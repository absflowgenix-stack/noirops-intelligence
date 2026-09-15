import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Scissors,
  Link2,
  Upload,
  FileText,
  Loader2,
  Sparkles,
  Check,
  Video,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UploadDropzone, PasteArea } from "@/components/clips/ClipInputFormParts";
import type { ClipWorkspace } from "@/components/clips/use-clip-workspace";

const VIDEO_STAGE_LABELS: Record<string, string> = {
  idle: "",
  decoding: "Extracting & chunking audio in your browser...",
  uploading: "Uploading audio chunks...",
  transcribing: "Transcribing with AI (Whisper)...",
  analyzing: "Finding the best moments...",
};

export function ClipInputForm({ workspace }: { workspace: ClipWorkspace }) {
  const {
    mode, setMode,
    title, setTitle,
    linkUrl, setLinkUrl,
    durationInput, setDurationInput,
    transcriptText, setTranscriptText,
    focusTopic, setFocusTopic,
    uploadedName,
    videoFile,
    videoStage, videoProgress,
    fileInputRef, videoInputRef,
    detected, tFormat, busy, canAnalyze, stage,
    handleFile, handleVideoFile, handleAnalyze,
  } = workspace;

  return (
    <Card className="border-border/50">
      <CardContent className="p-5 space-y-4">
        {/* Mode tabs */}
        <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
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
                  {VIDEO_STAGE_LABELS[videoStage] ?? ""}
                </div>
                <Progress value={videoProgress} className="h-1.5" aria-label="Video processing" />
              </div>
            )}
          </div>
        )}

        {/* Transcript paste (link / upload / transcript modes) */}
        {mode !== "video" && (
          <TranscriptSection workspace={workspace} />
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

        {/* Action row */}
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
  );
}

function TranscriptSection({ workspace }: { workspace: ClipWorkspace }) {
  return (
    <>
      {workspace.mode === "upload" && <UploadDropzone workspace={workspace} />}
      <PasteArea workspace={workspace} />
    </>
  );
}
