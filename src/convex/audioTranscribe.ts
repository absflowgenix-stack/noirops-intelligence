"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { parseTranscript } from "../lib/transcript";
import { buildSrtFromSegments, type TimedSegment } from "../lib/timed-text";

/**
 * Read the integration key/base at call time (not module load) so actions
 * always see the freshest deployment environment — e.g. after the key is
 * registered via the CLI or the Keys tab without needing a code push.
 */
function vlyKey(): string | undefined {
  return process.env.VLY_INTEGRATION_KEY;
}

function vlyBase(): string {
  return process.env.VLY_INTEGRATION_BASE_URL || "https://integrations.freebuff.com";
}

const WHISPER_MODEL = "whisper-1";
/** 25 MB Whisper limit — chunks are ~25s ≈ 0.8 MB, far below it. */
const MAX_CHUNK_BYTES = 24 * 1024 * 1024;
/** Per-attempt ceiling for one chunk's transcription request. */
const WHISPER_TIMEOUT_MS = 3 * 60 * 1000;
/** One retry for transient network blips (DNS/TLS/connection resets). */
const WHISPER_ATTEMPTS = 2;
/**
 * Parallel Whisper requests. Kept at 1: the runtime's outbound network bridge
 * has failed with EBUSY even on small bodies, so all evidence points at the
 * FormData/Blob serialization path itself — requests are serialized to keep
 * exactly one body crossing the bridge at a time.
 */
const WHISPER_CONCURRENCY = 1;

/**
 * Undici wraps the real reason (ENOTFOUND, ECONNREFUSED, EBUSY, TLS, …) in
 * `error.cause` and surfaces only "fetch failed" — dig the cause out so the
 * message is actionable in the UI and logs.
 */
function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err).slice(0, 300);
  const cause = (err as { cause?: unknown }).cause;
  let causeText = "";
  if (cause !== undefined && cause !== null) {
    if (cause instanceof Error) {
      const code = (cause as { code?: string }).code;
      causeText = code ? `${code}: ${cause.message}` : cause.message;
    } else {
      causeText = String(cause);
    }
  }
  return causeText ? `${err.message} (${causeText})` : err.message;
}

/**
 * Transcribe the stored WAV chunks of a locally-uploaded video with Whisper
 * (via the VLY gateway). Each chunk's transcript is rebased from chunk-local
 * time to the global video timeline via `chunkStarts`, merged into one SRT,
 * then handed off to the existing analyzeSource clipping action.
 */
export const transcribeFromStorage = action({
  args: {
    sourceId: v.id("videoSources"),
    audioStorageIds: v.array(v.id("_storage")),
    /** Global start second of each chunk (same order as audioStorageIds). */
    chunkStarts: v.optional(v.array(v.number())),
    language: v.optional(v.string()),
    focusTopic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!vlyKey()) {
      await ctx.runMutation(internal.videoClips.markSourceFailedInternal, {
        sourceId: args.sourceId,
        errorMessage:
          "AI service not configured. Please add VLY_INTEGRATION_KEY to your environment.",
      });
      throw new Error("AI service not configured (missing VLY_INTEGRATION_KEY).");
    }

    try {
      // Transcribe chunks with bounded parallelism; results stay ordered by
      // index so the timeline rebasing below is unaffected.
      const rawResults: (string | null)[] = new Array(args.audioStorageIds.length).fill(null);
      let nextIndex = 0;

      const worker = async () => {
        while (true) {
          const i = nextIndex++;
          if (i >= args.audioStorageIds.length) return;

          // Read the chunk bytes directly from storage — no HTTP round-trip
          // through the deployment's public URL from inside the action.
          const blob = await ctx.storage.get(args.audioStorageIds[i]);
          if (!blob) throw new Error("Stored audio chunk could not be read from storage.");
          if (blob.size > MAX_CHUNK_BYTES) {
            throw new Error("Audio chunk exceeds the transcription size limit.");
          }
          // Materialize a fresh in-memory copy: file-backed Blobs must not
          // cross the runtime's network bridge inside a request body.
          const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(await blob.arrayBuffer());
          rawResults[i] = await callWhisper(bytes, args.language);
        }
      };

      await Promise.all(
        Array.from(
          { length: Math.min(WHISPER_CONCURRENCY, args.audioStorageIds.length) },
          () => worker(),
        ),
      );

      const allSegments: TimedSegment[] = [];
      let sawUntimedOutput = false;

      for (let i = 0; i < rawResults.length; i++) {
        const chunkOffset = args.chunkStarts?.[i] ?? 0;
        const localSegments = normalizeWhisperOutput(rawResults[i] ?? "");
        if (localSegments.length === 0) sawUntimedOutput = true;
        for (const seg of localSegments) {
          allSegments.push({
            start: seg.start + chunkOffset,
            end: seg.end + chunkOffset,
            text: seg.text,
          });
        }
      }

      if (allSegments.length === 0) {
        throw new Error(
          sawUntimedOutput
            ? "Transcription returned text without timestamps. Try again — if this persists, paste an SRT transcript instead."
            : "No speech was detected in the uploaded video's audio.",
        );
      }

      // De-duplicate cues duplicated by the 1.5s chunk overlaps.
      const deduped = dedupeOverlappingSegments(allSegments);

      const mergedSrt = buildSrtFromSegments(deduped);
      const durationSec = deduped.reduce((acc, s) => Math.max(acc, s.end), 0);

      await ctx.runMutation(internal.videoClips.patchSourceMetaInternal, {
        sourceId: args.sourceId,
        durationSec,
      });

      // Reuse the entire existing clipping pipeline (AI moments, edits,
      // transitions, captions, saving + status updates).
      await ctx.runAction(api.videoClipping.analyzeSource, {
        sourceId: args.sourceId,
        transcriptText: mergedSrt,
        durationSec,
        focusTopic: args.focusTopic,
      });

      return { durationSec };
    } catch (err) {
      const message = describeError(err);
      await ctx.runMutation(internal.videoClips.markSourceFailedInternal, {
        sourceId: args.sourceId,
        errorMessage: message.slice(0, 500),
      });
      throw err;
    }
  },
});

/**
 * POST one in-memory WAV chunk to the Whisper-compatible endpoint. The
 * multipart body is hand-built as ONE flat, freshly-allocated ArrayBuffer —
 * no FormData, no Blob, no file-backed or browser-bridge objects anywhere in
 * the request path. (The runtime bridge fails with EBUSY when serializing
 * FormData/Blob bodies, even small in-memory ones.)
 */
async function callWhisper(
  bytes: Uint8Array<ArrayBuffer>,
  language?: string,
): Promise<string> {
  const key = vlyKey();
  if (!key) {
    throw new Error("AI service not configured (missing VLY_INTEGRATION_KEY).");
  }
  const endpoint = `${vlyBase()}/v1/audio/transcriptions`;
  let lastError: unknown;

  for (let attempt = 0; attempt < WHISPER_ATTEMPTS; attempt++) {
    try {
      const body = buildMultipartBody(bytes, language);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": `multipart/form-data; boundary=${MULTIPART_BOUNDARY}`,
          "Content-Length": String(body.byteLength),
        },
        body,
        signal: AbortSignal.timeout(WHISPER_TIMEOUT_MS),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        const message = `Transcription service error (${res.status}): ${errText.slice(0, 200)}`;
        // 4xx responses are deterministic (auth/validation) — don't retry them.
        if (res.status >= 400 && res.status < 500) {
          throw new DeterministicError(message);
        }
        throw new Error(message);
      }
      return await res.text();
    } catch (err) {
      lastError = err;
      if (err instanceof DeterministicError) throw err;
      if (attempt < WHISPER_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }
    }
  }

  throw new Error(
    `Could not reach the transcription service (${new URL(endpoint).host}): ${describeError(lastError)}`,
  );
}

/** Error that must not be retried (auth/validation failures from the service). */
class DeterministicError extends Error {}

/** Field values sent with every transcription request. */
const MULTIPART_FIELDS: [string, string][] = [
  ["model", WHISPER_MODEL],
  ["response_format", "srt"],
];

const MULTIPART_BOUNDARY = "----noirops-ebusy-safe-boundary";

/**
 * Serialize the whole multipart/form-data request into one flat
 * ArrayBuffer: ASCII pre/postamble + raw PCM bytes spliced in the middle.
 * The body is a BufferSource (allowed by fetch types), so no FormData/Blob
 * object ever exists for the bridge to mishandle.
 */
function buildMultipartBody(
  bytes: Uint8Array<ArrayBuffer>,
  language?: string,
): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder();
  const fields: [string, string][] = [...MULTIPART_FIELDS];
  if (language && language.trim()) fields.push(["language", language.trim()]);

  const parts: Uint8Array<ArrayBuffer>[] = [];
  for (const [name, value] of fields) {
    parts.push(
      enc.encode(
        `--${MULTIPART_BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
      ) as Uint8Array<ArrayBuffer>,
    );
  }
  parts.push(
    enc.encode(
      `--${MULTIPART_BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="audio.wav"\r\nContent-Type: audio/wav\r\n\r\n`,
    ) as Uint8Array<ArrayBuffer>,
  );
  parts.push(bytes);
  parts.push(enc.encode(`\r\n--${MULTIPART_BOUNDARY}--\r\n`) as Uint8Array<ArrayBuffer>);

  const total = parts.reduce((acc, p) => acc + p.byteLength, 0);
  const out = new Uint8Array(new ArrayBuffer(total));
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.byteLength;
  }
  return out;
}

/**
 * Normalize a Whisper response into chunk-local timed segments.
 * Handles: raw SRT text, JSON with `segments` (start/end/text), and JSON with
 * only `text` (untimed — returned as empty so the caller can report it).
 */
function normalizeWhisperOutput(raw: string): TimedSegment[] {
  const trimmed = (raw || "").trim();
  if (!trimmed) return [];

  if (trimmed.startsWith("{")) {
    try {
      const data = JSON.parse(trimmed) as {
        text?: string;
        segments?: { start?: number; end?: number; text?: string }[];
        srt?: string;
      };
      if (Array.isArray(data.segments) && data.segments.length > 0) {
        return data.segments
          .map((s) => ({
            start: Number(s.start) || 0,
            end: Number(s.end) || 0,
            text: String(s.text ?? "").trim(),
          }))
          .filter((s) => s.text && s.end > s.start);
      }
      if (data.srt) return srtToSegments(data.srt);
      return [];
    } catch {
      return [];
    }
  }

  // Plain SRT (the requested response_format).
  return srtToSegments(trimmed);
}

/** Parse SRT text into segments using the shared parser. */
function srtToSegments(srt: string): TimedSegment[] {
  const parsed = parseTranscript(srt);
  if (!parsed.hasTiming) return [];
  return parsed.cues
    .filter((c) => c.hasTiming)
    .map((c) => ({ start: c.start, end: c.end, text: c.text }));
}

/**
 * Remove duplicate cues produced by chunk overlaps: drop a later cue when an
 * earlier cue with the same text overlaps it by more than half its length.
 */
function dedupeOverlappingSegments(segments: TimedSegment[]): TimedSegment[] {
  const sorted = [...segments].sort((a, b) => a.start - b.start);
  const kept: TimedSegment[] = [];
  for (const seg of sorted) {
    const dup = kept.some((k) => {
      const overlap = Math.min(k.end, seg.end) - Math.max(k.start, seg.start);
      return (
        seg.text === k.text &&
        overlap > Math.min(k.end - k.start, seg.end - seg.start) * 0.5
      );
    });
    if (!dup) kept.push(seg);
  }
  return kept;
}
