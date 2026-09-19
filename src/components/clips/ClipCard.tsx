import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Clock,
  Copy,
  Check,
  X,
  Send,
  Zap,
  Scissors,
  Clapperboard,
  Loader2,
  Share2,
  Download,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { clipFilename, downloadBlob, extFor } from "@/lib/clip-renderer";
import {
  formatDuration,
  formatTimecode,
  EDIT_TYPES,
  TRANSITIONS,
  momentTypeStyle,
  momentTypeLabel,
  scoreTone,
} from "@/lib/video-platforms";
import type { Doc } from "@/convex/_generated/dataModel";

const CLIP_STATUS_STYLES: Record<string, string> = {
  suggested: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  accepted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  exported: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  dismissed: "bg-muted text-muted-foreground border-border",
};

const ASSET_STATUS_STYLES: Record<string, string> = {
  ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rendering: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  none: "bg-muted text-muted-foreground border-border",
};

interface ClipEdit {
  type: string;
  atSec: number;
  note: string;
}
interface ClipTransition {
  type: string;
  atSec: number;
  note: string;
}

function editMeta(id: string) {
  return EDIT_TYPES.find((e) => e.id === id);
}
function transitionMeta(id: string) {
  return TRANSITIONS.find((t) => t.id === id);
}

/** In-app player for one clip: bounds playback to the clip's timecodes. */
function ClipPlayer({
  src,
  startSec,
  endSec,
  aspectRatio,
}: {
  src: string;
  startSec: number;
  endSec: number;
  aspectRatio?: string | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  // Start at the clip start; clamp playback to the clip window.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = startSec;
    const onTime = () => {
      if (v.currentTime >= endSec) {
        v.pause();
        setPlaying(false);
        v.currentTime = startSec;
      }
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [src, startSec, endSec]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime < startSec || v.currentTime >= endSec) v.currentTime = startSec;
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-border/60 bg-black/90",
        aspectRatio === "9:16" ? "max-w-[220px]" : "w-full"
      )}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-auto max-h-[320px]"
        muted={muted}
        playsInline
        preload="metadata"
        onClick={togglePlay}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/60 px-2 py-1.5">
        <button
          type="button"
          onClick={togglePlay}
          className="text-white/90 hover:text-white text-xs cursor-pointer"
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <span className="text-[10px] text-white/60 tabular-nums">
          {formatDuration(startSec)} – {formatDuration(endSec)}
        </span>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="ml-auto text-[10px] text-white/60 hover:text-white cursor-pointer"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
}

export function ClipCard({
  clip,
  index,
  totalDuration,
  mediaUrl,
  mediaOrigin,
  renderingClipId,
  renderPct,
  shareLink,
  onAccept,
  onDismiss,
  onSendToDrafts,
  onCopyTimecodes,
  onCopyCaption,
  onRender,
  onShare,
}: {
  clip: Doc<"videoClips">;
  index: number;
  totalDuration?: number;
  mediaUrl?: string | null;
  mediaOrigin?: "noirops" | "platform" | null;
  renderingClipId?: string | null;
  renderPct?: number;
  shareLink?: string | null;
  onAccept: () => Promise<void> | void;
  onDismiss: () => Promise<void> | void;
  onSendToDrafts: () => void;
  onCopyTimecodes: () => void;
  onCopyCaption: () => void;
  onRender: () => void;
  onShare: () => void;
}) {
  const tone = scoreTone(clip.score);
  const duration = clip.endSec - clip.startSec;
  const edits = (clip.edits ?? []) as ClipEdit[];
  const transitions = (clip.transitions ?? []) as ClipTransition[];
  const isRendering = renderingClipId === clip._id;
  const assetStatus = clip.assetStatus ?? "none";

  const downloadRendered = () => {
    if (!clip.assetStorageId) return;
    // Convex storage URLs are stable per storage id; resolve via query hook.
    const url = `/api/storage/${clip.assetStorageId}`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((b) => downloadBlob(b, clipFilename(clip.title, clip.assetContentType)))
      .catch(() => toast.error("Could not download the rendered clip."));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.04, 0.25) }}
    >
      <Card className="border-border/50">
        <CardContent className="p-5 space-y-4">
          {/* Top row */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "inline-flex items-center justify-center h-6 px-2 rounded text-xs font-bold border",
                    tone.bg,
                    tone.text
                  )}
                >
                  {clip.score}
                </span>
                <h3 className="text-sm font-semibold tracking-tight truncate">{clip.title}</h3>
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", momentTypeStyle(clip.momentType))}
                >
                  {momentTypeLabel(clip.momentType)}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] capitalize", CLIP_STATUS_STYLES[clip.status] ?? "")}
                >
                  {clip.status}
                </Badge>
                {assetStatus !== "none" && (
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] capitalize", ASSET_STATUS_STYLES[assetStatus] ?? "")}
                  >
                    {assetStatus === "ready" ? "rendered" : assetStatus}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(clip.startSec)} – {formatDuration(clip.endSec)}
                  <span className="text-muted-foreground/60">({formatDuration(duration)})</span>
                </span>
                {clip.targetPlatform && <span className="capitalize">{clip.targetPlatform}</span>}
                {clip.aspectRatio && <span>{clip.aspectRatio}</span>}
              </div>
            </div>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 cursor-pointer shrink-0"
                    onClick={onCopyTimecodes}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy EDL timecodes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Timeline position */}
          {totalDuration && totalDuration > 0 && (
            <div className="h-1.5 rounded-full bg-muted relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-primary/70 rounded-full"
                style={{
                  left: `${Math.min(100, (clip.startSec / totalDuration) * 100)}%`,
                  width: `${Math.min(100, (duration / totalDuration) * 100)}%`,
                }}
              />
            </div>
          )}

          {/* In-app preview */}
          {isRendering ? (
            <div className="rounded-md border border-border/50 bg-muted/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                Rendering clip in your browser ({renderPct ?? 0}%) — real-time capture, hang tight.
              </div>
              <Progress value={renderPct ?? 0} className="h-1.5" aria-label="Clip render progress" />
            </div>
          ) : clip.assetStorageId ? (
            <ClipPlayer
              src={`/api/storage/${clip.assetStorageId}`}
              startSec={clip.startSec}
              endSec={clip.endSec}
              aspectRatio={clip.aspectRatio}
            />
          ) : mediaUrl ? (
            <ClipPlayer
              src={mediaUrl}
              startSec={clip.startSec}
              endSec={clip.endSec}
              aspectRatio={clip.aspectRatio}
            />
          ) : (
            <div className="rounded-md border border-dashed border-border/50 bg-muted/30 p-3 flex items-start gap-2 text-[11px] text-muted-foreground">
              <TriangleAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                No playable media for this source yet. Clips still carry exact timecodes —
                upload the video or paste a platform link whose video can be fetched to render
                them in-app.
              </span>
            </div>
          )}

          {/* Hook + reason */}
          {clip.hook && (
            <div className="text-sm">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                Hook
              </span>
              <p className="mt-0.5 italic text-foreground/90">&ldquo;{clip.hook}&rdquo;</p>
            </div>
          )}
          {clip.reason && <p className="text-xs text-muted-foreground">{clip.reason}</p>}

          {/* Excerpt */}
          {clip.transcriptExcerpt && (
            <div className="rounded-md border border-border/50 bg-muted/40 p-3">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                Transcript
              </span>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                {clip.transcriptExcerpt}
              </p>
            </div>
          )}

          {/* Edits + transitions */}
          {(edits.length > 0 || transitions.length > 0) && (
            <div className="grid gap-3 sm:grid-cols-2">
              {edits.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Suggested edits
                  </span>
                  {edits.map((e, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium">{editMeta(e.type)?.label ?? e.type}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        @ {formatDuration(e.atSec)} — {e.note}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {transitions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
                    <Scissors className="h-3 w-3" /> Transitions
                  </span>
                  {transitions.map((t, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-medium">
                        {transitionMeta(t.type)?.label ?? t.type}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        @ {formatDuration(t.atSec)} — {t.note}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Caption + hashtags */}
          {(clip.caption || (clip.hashtags ?? []).length > 0) && (
            <div className="rounded-md border border-border/50 bg-muted/40 p-3 space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                Ready-to-post caption
              </span>
              {clip.caption && <p className="text-xs">{clip.caption}</p>}
              {(clip.hashtags ?? []).length > 0 && (
                <p className="text-xs text-primary/80">{(clip.hashtags ?? []).join(" ")}</p>
              )}
            </div>
          )}

          {/* Share link (after sharing) */}
          {shareLink && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5 flex items-center gap-2">
              <Share2 className="h-3.5 w-3.5 text-primary shrink-0" />
              <code className="text-[11px] truncate flex-1 text-foreground/80">{shareLink}</code>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-[11px] cursor-pointer"
                onClick={() => {
                  void navigator.clipboard.writeText(shareLink);
                  toast.success("Link copied");
                }}
              >
                Copy
              </Button>
            </div>
          )}

          {/* Render error */}
          {clip.assetError && (
            <p className="text-[11px] text-red-500/90 flex items-center gap-1.5">
              <TriangleAlert className="h-3 w-3" /> {clip.assetError}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {clip.status === "suggested" && (
              <Button size="sm" className="h-8 gap-1.5 cursor-pointer" onClick={onAccept}>
                <Check className="h-3.5 w-3.5" /> Accept clip
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 cursor-pointer"
              onClick={onRender}
              disabled={isRendering}
            >
              <Clapperboard className="h-3.5 w-3.5" />
              {clip.assetStorageId ? "Re-render" : "Render clip"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 cursor-pointer"
              onClick={onShare}
            >
              <Share2 className="h-3.5 w-3.5" /> Share
            </Button>
            {clip.assetStorageId && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-muted-foreground cursor-pointer"
                onClick={downloadRendered}
              >
                <Download className="h-3.5 w-3.5" /> Download (.
                {extFor(clip.assetContentType)})
              </Button>
            )}
            {clip.caption && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-muted-foreground cursor-pointer"
                onClick={onSendToDrafts}
              >
                <Send className="h-3.5 w-3.5" /> Send to drafts
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-muted-foreground cursor-pointer"
              onClick={onCopyCaption}
            >
              <Copy className="h-3.5 w-3.5" /> Copy caption
            </Button>
            {clip.status !== "dismissed" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-muted-foreground hover:text-destructive cursor-pointer ml-auto"
                onClick={onDismiss}
              >
                <X className="h-3.5 w-3.5" /> Dismiss
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
