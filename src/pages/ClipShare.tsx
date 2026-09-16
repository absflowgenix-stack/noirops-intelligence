import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scissors, Clock, Loader2, TriangleAlert, Download, Sparkles } from "lucide-react";
import { clipFilename, downloadBlob, extFor } from "@/lib/clip-renderer";
import { formatDuration } from "@/lib/video-platforms";
import { cn } from "@/lib/utils";

/**
 * Public clip share page (/share/clip/:token).
 * Resolves everything through the token-gated getClipByShareToken query —
 * no user data, no clip-id probing; the 128-bit token is the capability.
 */
export default function ClipShare() {
  const { token = "" } = useParams();
  const clip = useQuery(api.videoClips.getClipByShareToken, token ? { token } : "skip") as
    | {
        title: string;
        caption?: string;
        hashtags?: string[];
        targetPlatform?: string;
        aspectRatio?: string;
        startSec: number;
        endSec: number;
        assetStatus: string;
        assetContentType?: string;
        mediaUrl: string | null;
        mediaOrigin: "noirops" | "platform" | null;
        assetUrl: string | null;
      }
    | null
    | undefined;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Bounded playback for the source media fallback (no rendered asset yet).
  useEffect(() => {
    if (clip?.assetUrl) return; // rendered asset is already the exact cut
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = clip?.startSec ?? 0;
    const onTime = () => {
      if (clip && v.currentTime >= clip.endSec) {
        v.pause();
        setPlaying(false);
        v.currentTime = clip.startSec;
      }
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [clip?.assetUrl, clip?.startSec, clip?.endSec]);

  if (clip === undefined) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading clip...
        </div>
      </div>
    );
  }

  if (clip === null) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <TriangleAlert className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
          <h1 className="text-lg font-semibold">Clip not found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            This share link is invalid or has been revoked.
          </p>
          <Button asChild variant="outline" className="mt-4 cursor-pointer">
            <Link to="/">Go to NoirOps</Link>
          </Button>
        </div>
      </div>
    );
  }

  const duration = clip.endSec - clip.startSec;
  const src = clip.assetUrl ?? clip.mediaUrl;

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v || !src) return;
    if (v.paused) {
      if (v.currentTime < clip.startSec || v.currentTime >= clip.endSec) {
        v.currentTime = clip.startSec;
      }
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const download = () => {
    if (!clip.assetUrl) return;
    fetch(clip.assetUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.blob();
      })
      .then((b) => downloadBlob(b, clipFilename(clip.title, clip.assetContentType)))
      .catch(() => undefined);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <Scissors className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">NoirOps</span>
          </Link>
          <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
            Shared clip
          </Badge>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{clip.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(clip.startSec)} – {formatDuration(clip.endSec)}
              <span className="text-muted-foreground/60">({formatDuration(duration)})</span>
            </span>
            {clip.targetPlatform && <span className="capitalize">{clip.targetPlatform}</span>}
            {clip.aspectRatio && <span>{clip.aspectRatio}</span>}
          </div>
        </div>

        {src ? (
          <div
            className={cn(
              "relative overflow-hidden rounded-lg border border-border/60 bg-black/90",
              clip.aspectRatio === "9:16" ? "max-w-[280px]" : "w-full"
            )}
          >
            <video
              ref={videoRef}
              src={src}
              className="w-full h-auto max-h-[480px]"
              muted={muted}
              playsInline
              controls
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            The creator hasn&apos;t rendered this clip yet — check back soon.
          </div>
        )}

        {(clip.caption || (clip.hashtags ?? []).length > 0) && (
          <div className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-1.5">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Caption
            </span>
            {clip.caption && <p className="text-sm whitespace-pre-wrap">{clip.caption}</p>}
            {(clip.hashtags ?? []).length > 0 && (
              <p className="text-sm text-primary/80">{(clip.hashtags ?? []).join(" ")}</p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {clip.assetUrl && (
            <Button className="gap-2 cursor-pointer" onClick={download}>
              <Download className="h-4 w-4" /> Download clip (.
              {extFor(clip.assetContentType)})
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2 cursor-pointer">
            <Link to="/auth?returnTo=/dashboard/clips">
              <Sparkles className="h-4 w-4" /> Make clips like this
            </Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-border/60 mt-10">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center text-[11px] text-muted-foreground">
          Powered by NoirOps — AI video clipping in beta.
        </div>
      </footer>
    </div>
  );
}
