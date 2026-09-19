import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Loader2, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/video-platforms";
import { ClipCard } from "@/components/clips/ClipCard";
import { SOURCE_STATUS_STYLES } from "@/components/clips/use-clip-workspace";
import type { ClipWorkspace } from "@/components/clips/use-clip-workspace";

/** Results view: the clips suggested for one analyzed video source. */
export function ClipResults({ workspace }: { workspace: ClipWorkspace }) {
  const {
    activeSource,
    clips,
    sourceMediaUrl,
    renderingClipId,
    renderPct,
    acceptClip,
    dismissClip,
    copyTimecodes,
    copyCaption,
    sendToDrafts,
    renderClipAsset,
    shareClip,
    getShareLink,
    reset,
  } = workspace;

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
            {sourceMediaUrl?.origin === "noirops"
              ? " — video stored in NoirOps"
              : sourceMediaUrl?.origin === "platform"
                ? " — streaming from platform"
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
              mediaUrl={sourceMediaUrl?.url ?? null}
              mediaOrigin={sourceMediaUrl?.origin ?? null}
              renderingClipId={renderingClipId ?? null}
              renderPct={renderPct}
              shareLink={getShareLink(clip._id)}
              onAccept={() => void acceptClip(clip)}
              onSendToDrafts={() => void sendToDrafts(clip)}
              onCopyTimecodes={() => copyTimecodes(clip)}
              onDismiss={() => void dismissClip(clip)}
              onCopyCaption={() => copyCaption(clip)}
              onRender={() => void renderClipAsset(clip)}
              onShare={() => void shareClip(clip)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
