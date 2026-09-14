import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Clock, Copy, Check, X, Send, Zap, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
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

export function ClipCard({
  clip,
  index,
  totalDuration,
  onAccept,
  onDismiss,
  onSendToDrafts,
  onCopyTimecodes,
  onCopyCaption,
}: {
  clip: Doc<"videoClips">;
  index: number;
  totalDuration?: number;
  onAccept: () => Promise<void> | void;
  onDismiss: () => Promise<void> | void;
  onSendToDrafts: () => void;
  onCopyTimecodes: () => void;
  onCopyCaption: () => void;
}) {
  const tone = scoreTone(clip.score);
  const duration = clip.endSec - clip.startSec;
  const edits = (clip.edits ?? []) as ClipEdit[];
  const transitions = (clip.transitions ?? []) as ClipTransition[];

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
                  className={cn(
                    "text-[10px] capitalize",
                    CLIP_STATUS_STYLES[clip.status] ?? ""
                  )}
                >
                  {clip.status}
                </Badge>
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

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {clip.status === "suggested" && (
              <Button size="sm" className="h-8 gap-1.5 cursor-pointer" onClick={onAccept}>
                <Check className="h-3.5 w-3.5" /> Accept clip
              </Button>
            )}
            {clip.caption && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 cursor-pointer"
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
