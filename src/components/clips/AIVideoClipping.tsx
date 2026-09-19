// AI Video Clipping — page shell. State/flows live in use-clip-workspace.ts,
// the input form in ClipInputForm.tsx, results in ClipResults.tsx,
// recent analyses in SourceList.tsx, cards in ClipCard.tsx.
import { useClipWorkspace } from "@/components/clips/use-clip-workspace";
import { ClipInputForm } from "@/components/clips/ClipInputForm";
import { ClipResults } from "@/components/clips/ClipResults";
import { SourceList } from "@/components/clips/SourceList";
import { Badge } from "@/components/ui/badge";
import { Scissors, Film } from "lucide-react";

export default function AIVideoClipping() {
  const workspace = useClipWorkspace();

  // ── Results view ─────────────────────────────────────────
  if (workspace.activeSourceId) {
    return <ClipResults workspace={workspace} />;
  }

  // ── New analysis view ────────────────────────────────────
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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

      <ClipInputForm workspace={workspace} />

      <div>
        <h2 className="text-sm font-semibold tracking-tight mb-2 flex items-center gap-2">
          <Film className="h-4 w-4 text-muted-foreground" /> Recent analyses
        </h2>
        <SourceList workspace={workspace} />
      </div>
    </div>
  );
}
