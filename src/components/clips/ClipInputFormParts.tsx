import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, Upload } from "lucide-react";
import type { ClipWorkspace } from "@/components/clips/use-clip-workspace";

/** SRT/VTT/TXT transcript file dropzone (used in "SRT file" mode). */
export function UploadDropzone({ workspace }: { workspace: ClipWorkspace }) {
  const { uploadedName, fileInputRef, handleFile } = workspace;

  return (
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
  );
}

/** Transcript textarea with format badge + word count (link / paste / upload modes). */
export function PasteArea({ workspace }: { workspace: ClipWorkspace }) {
  const { mode, uploadedName, transcriptText, setTranscriptText, tFormat } = workspace;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">
          Transcript{" "}
          {mode === "upload" && uploadedName
            ? "(loaded from file)"
            : mode === "link"
              ? "(optional — auto-pulled for YouTube)"
              : ""}
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
          workspace.setUploadedName(null);
        }}
        className="min-h-[160px] font-mono text-xs leading-relaxed"
      />
      {transcriptText.trim() && (
        <p className="text-[11px] text-muted-foreground">
          {transcriptText.trim().split(/\s+/).length.toLocaleString()} words
          {tFormat === "plain" ? " — paste timecoded SRT/VTT for timed clips" : ""}
        </p>
      )}
    </div>
  );
}
