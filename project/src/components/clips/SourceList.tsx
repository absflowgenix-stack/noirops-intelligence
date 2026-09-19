import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Loader2, Scissors, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video-platforms";
import { SOURCE_STATUS_STYLES } from "@/components/clips/use-clip-workspace";
import type { ClipWorkspace } from "@/components/clips/use-clip-workspace";

/** Recent analyses list shown on the main clipping view. */
export function SourceList({ workspace }: { workspace: ClipWorkspace }) {
  const { sources, openSource, removeSource } = workspace;

  if (!sources) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed border-border/60 rounded-md">
        <Scissors className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          No analyses yet. Your first video&apos;s clips will appear here.
        </p>
      </div>
    );
  }

  return (
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
                  onClick={() => openSource(s._id)}
                  disabled={s.status !== "ready"}
                >
                  View clips
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive cursor-pointer"
                  onClick={() => void removeSource(s._id)}
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
  );
}
