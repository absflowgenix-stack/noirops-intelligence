import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Video,
  Link2,
  Upload,
  FileText,
  Sparkles,
  Scissors,
  Loader2,
  Check,
  X,
  Copy,
  Clock,
  Wand2,
  ArrowRightLeft,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  detectPlatform,
  formatDuration,
  scoreTone,
  momentTypeStyle,
  momentTypeLabel,
  EDIT_TYPES,
  TRANSITIONS,
} from "@/lib/video-platforms";
import { parseTranscript, transcriptFormat } from "@/lib/transcript";

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

type ClipDoc = Doc<"videoClips">;
type SourceDoc = Doc<"videoSources">;

type Phase = "input" | "analyzing" | "results";

const ANALYZE_STEPS = [
  "Parsing transcript…",
  "Scanning for hooks and payoffs…",
  "Scoring short-form potential…",
  "Designing edits and transitions…",
  "Finalizing clip suggestions…",
];

function editLabel(id: string): string {
  return EDIT_TYPES.find((e) => e.id === id)?.label ?? id;
}
function editIcon(id: string): React.ElementType {
  return (
    {
      scissors: Scissors,
      zoom: Wand2,
      zap: Zap,
      sparkles: Sparkles,
      text: FileText,
      volume: Wand2,
      filter: Wand2,
      arrow: ArrowRightLeft,
    }[id] ?? Scissors
  );
}
function transitionLabel(id: string): string {
  return TRANSITIONS.find((t) => t.id === id)?.label ?? id;
}

export default function VideoClips() {
  const { user } = useAuth();
  const userId = user?._id ?? "";

  const sources = useQuery(
    api.videoClips.listSources,
    userId ? { userId, limit: 12 } : "skip",
  ) as SourceDoc[] | undefined;
  const createSource = useMutation(api.videoClips.createSource);
  const deleteSource = useMutation(api.videoClips.deleteSource);
  const updateClipStatus = useMutation(api.videoClips.updateClipStatus);
  const analyze = useAction(api.videoClipping.analyzeSource);

  const [tab, setTab] = useState<"link" | "upload" | "transcript">("link");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [transcriptText, setTranscriptText] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [focusTopic, setFocusTopic] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [progress, setProgress] = useState(0);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const detected = useMemo(() => detectPlatform(url), [url]);
  const parsedPreview = useMemo(
    () => (transcriptText.trim() ? parseTranscript(transcriptText) : null),
    [transcriptText],
  );
  const fmt = useMemo(() => transcriptFormat(transcriptText), [transcriptText]);
  const durationSec = useMemo(() => {
    if (!durationInput) return undefined;
    const parts = durationInput.split(":").map(Number);
    if (parts.some((n) => Number.isNaN(n))) return undefined;
    return parts.reverse().reduce((acc, n, i) => acc + n * Math.pow(60, i), 0);
  }, [durationInput]);

  const clips = useQuery(
    api.videoClips.listClipsForSource,
    activeSourceId ? { sourceId: activeSourceId as Id<"videoSources"> } : "skip",
  ) as ClipDoc[] | undefined;
  const activeSource = useMemo(
    () => sources?.find((s) => s._id === activeSourceId) ?? null,
    [sources, activeSourceId],
  );

  async function handleAnalyze() {
    if (!userId) return;

    const transcript = transcriptText;

    const parsed = parseTranscript(transcript);
    if (parsed.cues.length === 0) {
      toast.error("Add a transcript", {
        description:
          "Paste an SRT/VTT transcript (or download it from the platform) so NoirOps can locate the best moments.",
      });
      return;
    }

    setPhase("analyzing");
    setProgress(8);

    // Deterministic progress animation while the AI works.
    const timer = setInterval(() => {
      setProgress((p) => Math.min(90, p + Math.random() * 9 + 3));
    }, 900);

    try {
      let sourceId: Id<"videoSources">;
      if (activeSourceId && activeSource && activeSource.status !== "ready") {
        sourceId = activeSourceId as Id<"videoSources">;
      } else {
        const derivedTitle =
          title.trim() ||
          (tab === "link" && detected
            ? `${detected.name} video`
            : tab === "upload" && file
              ? file.name.replace(/\.[^.]+$/, "")
              : "Transcript session");
        sourceId = await createSource({
          userId,
          title: derivedTitle,
          sourceKind: tab,
          url: tab === "link" ? url.trim() || undefined : undefined,
          platform: tab === "link" ? detected?.id : undefined,
          videoId: tab === "link" ? detected?.videoId : undefined,
        });
        setActiveSourceId(sourceId);
      }

      const result = await analyze({
        sourceId,
        transcriptText: transcript,
        durationSec,
        focusTopic: focusTopic.trim() || undefined,
      });

      setProgress(100);
      toast.success(`${result.clipCount} clips found`, {
        description: "Review, accept, or export each suggestion below.",
      });
      setPhase("results");
    } catch (err) {
      setPhase("input");
      toast.error("Analysis failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      clearInterval(timer);
    }
  }

  async function handleCopyCaption(clip: ClipDoc) {
    if (!clip.caption) return;
    try {
      await navigator.clipboard.writeText(clip.caption);
      toast.success("Caption copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  async function handleExportEdl(clip: ClipDoc, source: SourceDoc | null) {
    const edl = [
      `TITLE: ${clip.title}`,
      `SOURCE: ${source?.url ?? source?.title ?? "local"}`,
      `TARGET: ${clip.targetPlatform ?? "tiktok"} (${clip.aspectRatio ?? "9:16"})`,
      "",
      `IN:  ${formatDuration(clip.startSec)}`,
      `OUT: ${formatDuration(clip.endSec)}`,
      `DURATION: ${formatDuration(clip.endSec - clip.startSec)}`,
      "",
      "EDITS:",
      ...((clip.edits as ClipEdit[] | undefined) ?? []).map(
        (e) => `  ${formatDuration(e.atSec)}  ${editLabel(e.type)} — ${e.note}`,
      ),
      "",
      "TRANSITIONS:",
      ...((clip.transitions as ClipTransition[] | undefined) ?? []).map(
        (t) => `  ${formatDuration(t.atSec)}  ${transitionLabel(t.type)} — ${t.note}`,
      ),
      "",
      clip.caption ? `CAPTION:\n${clip.caption}` : "",
    ]
      .join("\n")
      .trim();
    try {
      await navigator.clipboard.writeText(edl);
      await updateClipStatus({ clipId: clip._id, status: "exported" });
      toast.success("Edit decision list copied");
    } catch {
      toast.error("Copy failed");
    }
  }

  const busy = phase === "analyzing";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            AI Video Clipping
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Turn long-form video into scroll-stopping shorts — AI finds the
            moments, scores them, and designs the edits.
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] w-fit shrink-0">
          Beta
        </Badge>
      </div>

      {/* Input */}
      {phase !== "results" && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" />
              New clip session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="link" className="gap-1.5">
                  <Link2 className="h-3.5 w-3.5" /> Link
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Upload
                </TabsTrigger>
                <TabsTrigger value="transcript" className="gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Transcript
                </TabsTrigger>
              </TabsList>

              <TabsContent value="link" className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="Paste a YouTube, TikTok, Instagram, X, Vimeo, Twitch… link"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  {detected && (
                    <Badge
                      variant="outline"
                      className={`shrink-0 self-center gap-1 ${detected.color}`}
                    >
                      <Link2 className="h-3 w-3" />
                      {detected.name}
                      {detected.videoId ? ` · ${detected.videoId}` : ""}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Transcript (SRT / VTT)
                  </label>
                  <Textarea
                    placeholder="Paste the video's transcript here — the AI needs the words to find the moments. Platforms like YouTube expose it via “Show transcript”."
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    className="min-h-[120px] font-mono text-xs"
                  />
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-3 pt-2">
                <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 p-6 cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm">
                    {file ? file.name : "Choose a video or transcript file"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    .mp4, .mov, .srt, .vtt, .txt
                  </span>
                  <input
                    type="file"
                    accept="video/*,.srt,.vtt,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                      if (f && /\.(srt|vtt|txt)$/i.test(f.name)) {
                        f.text().then(setTranscriptText);
                      }
                    }}
                  />
                </label>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Transcript (auto-filled for .srt/.vtt/.txt, or paste here)
                  </label>
                  <Textarea
                    placeholder="Transcript text…"
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    className="min-h-[100px] font-mono text-xs"
                  />
                </div>
              </TabsContent>

              <TabsContent value="transcript" className="pt-2">
                <Textarea
                  placeholder={
                    "Paste an SRT / VTT transcript, e.g.\n\n00:01:12,400 --> 00:01:15,900\nThe one thing nobody tells you about growing an audience…"
                  }
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  className="min-h-[140px] font-mono text-xs"
                />
              </TabsContent>
            </Tabs>

            {/* Transcript metadata row */}
            {parsedPreview && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="uppercase">
                  {fmt}
                </Badge>
                <span>{parsedPreview.wordCount} words</span>
                {parsedPreview.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(parsedPreview.duration)}
                  </span>
                )}
                {!parsedPreview.hasTiming && (
                  <span className="text-amber-500">
                    No timestamps detected — timed clips require SRT/VTT.
                  </span>
                )}
              </div>
            )}

            {/* Options */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Title (optional)
                </label>
                <Input
                  placeholder="Podcast ep. 42"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Duration (optional)
                </label>
                <Input
                  placeholder="MM:SS or HH:MM:SS"
                  value={durationInput}
                  onChange={(e) => setDurationInput(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Focus topic (optional)
                </label>
                <Input
                  placeholder="e.g. pricing your offer"
                  value={focusTopic}
                  onChange={(e) => setFocusTopic(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleAnalyze} disabled={busy} className="gap-2">
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {busy ? "Analyzing…" : "Find the best moments"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyzing */}
      {phase === "analyzing" && (
        <Card className="border-primary/30">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium text-sm">Clip Director is working…</p>
                <p className="text-xs text-muted-foreground">
                  {ANALYZE_STEPS[Math.min(Math.floor(progress / 20), ANALYZE_STEPS.length - 1)]}
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {phase === "results" && activeSource && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Check className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{activeSource.title}</p>
                <p className="text-xs text-muted-foreground">
                  {clips?.length ?? 0} clip suggestions ·{" "}
                  {activeSource.durationSec
                    ? formatDuration(activeSource.durationSec)
                    : "duration n/a"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPhase("input");
                setActiveSourceId(null);
              }}
              className="shrink-0"
            >
              New session
            </Button>
          </div>

          {clips?.map((clip) => (
            <ClipCard
              key={clip._id}
              clip={clip}
              source={activeSource}
              onAccept={() =>
                updateClipStatus({ clipId: clip._id, status: "accepted" })
              }
              onDismiss={() =>
                updateClipStatus({ clipId: clip._id, status: "dismissed" })
              }
              onCopyCaption={() => handleCopyCaption(clip)}
              onExport={() => handleExportEdl(clip, activeSource)}
            />
          ))}
        </div>
      )}

      {/* History */}
      {sources && sources.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recent sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sources.map((s) => (
              <div
                key={s._id}
                className="flex items-center gap-3 rounded-md border border-border/50 p-2.5 cursor-pointer hover:border-primary/40 transition-colors"
                onClick={() => {
                  setActiveSourceId(s._id);
                  setPhase("results");
                }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted shrink-0">
                  <Video className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{s.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {s.sourceKind}
                    {s.platform ? ` · ${s.platform}` : ""}
                    {s.transcriptWordCount ? ` · ${s.transcriptWordCount} words` : ""}
                  </p>
                </div>
                <SourceStatusBadge status={s.status} error={s.errorMessage} />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSource({ sourceId: s._id });
                    if (activeSourceId === s._id) {
                      setActiveSourceId(null);
                      setPhase("input");
                    }
                  }}
                  title="Delete session"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Useful empty state */}
      {sources && sources.length === 0 && phase === "input" && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Video className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium">No clip sessions yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Paste a long-form video link, upload a file, or drop in an SRT
              transcript. NoirOps transcribes, finds hooks, stories, insights and
              payoffs, then proposes cuts, punch-ins and transitions for every
              short.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SourceStatusBadge({ status, error }: { status: string; error?: string }) {
  if (status === "ready")
    return (
      <Badge variant="outline" className="text-[10px] text-emerald-500 shrink-0">
        ready
      </Badge>
    );
  if (status === "failed")
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="text-[10px] text-destructive shrink-0"
            >
              failed
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs text-xs">
            {error || "Analysis failed"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  return (
    <Badge variant="outline" className="text-[10px] text-muted-foreground shrink-0">
      pending
    </Badge>
  );
}

function ClipCard({
  clip,
  source,
  onAccept,
  onDismiss,
  onCopyCaption,
  onExport,
}: {
  clip: ClipDoc;
  source: SourceDoc | null;
  onAccept: () => void;
  onDismiss: () => void;
  onCopyCaption: () => void;
  onExport: () => void;
}) {
  const tone = scoreTone(clip.score);
  const edits = (clip.edits as ClipEdit[] | undefined) ?? [];
  const transitions = (clip.transitions as ClipTransition[] | undefined) ?? [];
  const duration = clip.endSec - clip.startSec;

  return (
    <Card className="border-border/50">
      <CardContent className="p-4 space-y-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold truncate">{clip.title}</h3>
              <Badge
                variant="outline"
                className={`text-[10px] shrink-0 ${momentTypeStyle(clip.momentType)}`}
              >
                {momentTypeLabel(clip.momentType)}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
              <span className="font-mono">
                {formatDuration(clip.startSec)} → {formatDuration(clip.endSec)}
              </span>
              <span>{formatDuration(duration)} long</span>
              <span>{clip.aspectRatio ?? "9:16"}</span>
              <span className="capitalize">
                for {clip.targetPlatform ?? "tiktok"}
              </span>
            </div>
          </div>
          <div
            className={`shrink-0 flex flex-col items-center justify-center rounded-lg border px-3 py-1.5 ${tone.bg} ${tone.text}`}
          >
            <span className="text-lg font-bold leading-none">{clip.score}</span>
            <span className="text-[9px] uppercase tracking-wide">{tone.label}</span>
          </div>
        </div>

        {/* Hook + reason */}
        {clip.hook && (
          <p className="text-sm border-l-2 border-primary/50 pl-3 italic">
            “{clip.hook}”
          </p>
        )}
        {clip.reason && (
          <p className="text-xs text-muted-foreground">{clip.reason}</p>
        )}
        {clip.transcriptExcerpt && (
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer select-none hover:text-foreground">
              Transcript excerpt
            </summary>
            <p className="mt-1.5 leading-relaxed">{clip.transcriptExcerpt}</p>
          </details>
        )}

        {/* Timeline bar */}
        {source?.durationSec ? (
          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="absolute inset-y-0 bg-primary/70 rounded-full"
              style={{
                left: `${(clip.startSec / source.durationSec) * 100}%`,
                width: `${Math.max(2, ((clip.endSec - clip.startSec) / source.durationSec) * 100)}%`,
              }}
            />
          </div>
        ) : null}

        {/* Edits */}
        {edits.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Suggested edits
            </p>
            {edits.map((e, i) => {
              const Icon = editIcon(e.type);
              return (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <Icon className="h-3.5 w-3.5 mt-0.5 text-primary shrink-0" />
                  <span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {formatDuration(e.atSec)}
                    </span>{" "}
                    <span className="font-medium">{editLabel(e.type)}</span>
                    {e.note && <span className="text-muted-foreground"> — {e.note}</span>}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Transitions */}
        {transitions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Transitions
            </p>
            {transitions.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <ArrowRightLeft className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {formatDuration(t.atSec)}
                  </span>{" "}
                  <span className="font-medium">{transitionLabel(t.type)}</span>
                  {t.note && (
                    <span className="text-muted-foreground"> — {t.note}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Caption + hashtags */}
        {clip.caption && (
          <div className="rounded-md bg-muted/50 p-3 text-xs space-y-2">
            <p className="whitespace-pre-wrap leading-relaxed">{clip.caption}</p>
            {clip.hashtags && clip.hashtags.length > 0 && (
              <p className="text-primary/80">{clip.hashtags.join(" ")}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onAccept}>
            <Check className="h-3.5 w-3.5" /> Accept
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onExport}>
            <Copy className="h-3.5 w-3.5" /> Copy EDL + caption
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={onCopyCaption}>
            <FileText className="h-3.5 w-3.5" /> Caption only
          </Button>
          <Badge variant="secondary" className="text-[10px] capitalize">
            {clip.targetPlatform ?? "tiktok"}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-muted-foreground ml-auto"
            onClick={onDismiss}
          >
            <X className="h-3.5 w-3.5" /> Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
