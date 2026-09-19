"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { parseTranscript } from "../lib/transcript";
import { buildSrtFromSegments, type TimedSegment } from "../lib/timed-text";
import { OPENROUTER_BASE, aiGatewayKey } from "./gateway";

/**
 * Audio transcription via OpenRouter (deployment-provisioned AI_API_KEY).
 *
 * Why not Whisper: the platform's integration gateway exposes no audio route
 * (verified: `Route POST:/v1/llm/audio/transcriptions not found`), so
 * transcription runs on an audio-capable multimodal model (Gemini Flash)
 * through OpenRouter's OpenAI-compatible chat completions — validated
 * working end-to-end from this runtime. Audio goes up as a base64
 * `input_audio` content part; the model replies with SRT-formatted cues with
 * chunk-local timestamps, which are rebased onto the global timeline below.
 */

/** Gemini handles audio input + SRT output well and is cheap per request. */
const TRANSCRIBE_MODEL = "google/gemini-2.5-flash";
/** Sanity cap per chunk (~1.4 MB base64 in JSON). Chunks are ~0.8 MB raw. */
const MAX_CHUNK_BYTES = 12 * 1024 * 1024;
/** Per-attempt ceiling for one chunk's transcription request. */
const TRANSCRIBE_TIMEOUT_MS = 3 * 60 * 1000;
/** One retry for transient network blips (DNS/TLS/connection resets). */
const TRANSCRIBE_ATTEMPTS = 2;
/**
 * Parallel transcription requests. Kept at 1: bodies are serialized JSON and
 * the runtime's outbound bridge has been the historical failure point.
 */
const TRANSCRIBE_CONCURRENCY = 1;

const SRT_PROMPT =
  "Transcribe this audio as SRT subtitles. Output ONLY SRT: numbered cues, " +
  "timestamps in the exact format 00:00:01,000 --> 00:00:03,500 measured " +
  "from the start of THIS audio clip, then the spoken words. No markdown, " +
  "no commentary, no blank cues.";

/**
 * Undici wraps the real reason (ENOTFOUND, ECONNREFUSED, TLS, …) in
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
 * Transcribe the stored WAV chunks of a locally-uploaded video. Each chunk's
 * transcript is rebased from chunk-local time to the global video timeline
 * via `chunkStarts`, merged into one SRT, then handed off to the existing
 * analyzeSource clipping action.
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
    if (!aiGatewayKey()) {
      await ctx.runMutation(internal.videoClips.markSourceFailedInternal, {
        sourceId: args.sourceId,
        errorMessage:
          "AI service not configured. Please add AI_API_KEY to your environment.",
      });
      throw new Error("AI service not configured (missing AI_API_KEY).");
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
          // Materialize a fresh in-memory copy before encoding.
          const bytes: Uint8Array<ArrayBuffer> = new Uint8Array(await blob.arrayBuffer());
          rawResults[i] = await callTranscribe(bytes, args.language);
        }
      };

      await Promise.all(
        Array.from(
          { length: Math.min(TRANSCRIBE_CONCURRENCY, args.audioStorageIds.length) },
          () => worker(),
        ),
      );

      const allSegments: TimedSegment[] = [];
      let sawUntimedOutput = false;

      for (let i = 0; i < rawResults.length; i++) {
        const chunkOffset = args.chunkStarts?.[i] ?? 0;
        const localSegments = normalizeTranscriptOutput(rawResults[i] ?? "");
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

      // De-duplicate cues duplicated by the chunk overlaps.
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

/** Error that must not be retried (auth/credits/validation failures). */
class DeterministicError extends Error {}

/**
 * POST one in-memory WAV chunk to OpenRouter as a multimodal chat completion
 * and return the model's SRT-formatted reply. The body is plain JSON (base64
 * audio inline) — no multipart, no Blob, nothing for the runtime bridge to
 * mishandle.
 */
async function callTranscribe(
  bytes: Uint8Array<ArrayBuffer>,
  language?: string,
): Promise<string> {
  const key = aiGatewayKey();
  if (!key) {
    throw new Error("AI service not configured (missing AI_API_KEY).");
  }
  const endpoint = `${OPENROUTER_BASE}/chat/completions`;
  let lastError: unknown;

  for (let attempt = 0; attempt < TRANSCRIBE_ATTEMPTS; attempt++) {
    try {
      const prompt = language && language.trim()
        ? `${SRT_PROMPT} The audio is in ${language.trim()}.`
        : SRT_PROMPT;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: TRANSCRIBE_MODEL,
          temperature: 0,
          max_tokens: 8000,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "input_audio",
                  input_audio: {
                    data: Buffer.from(bytes).toString("base64"),
                    format: "wav",
                  },
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(TRANSCRIBE_TIMEOUT_MS),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "Unknown error");
        const message = `Transcription service error (${res.status}): ${errText.slice(0, 300)}`;
        // 4xx responses are deterministic (auth/credits/validation) — don't retry.
        if (res.status >= 400 && res.status < 500) {
          throw new DeterministicError(message);
        }
        throw new Error(message);
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content ?? "";
      if (!content.trim()) {
        throw new Error("Transcription model returned an empty response.");
      }
      return content;
    } catch (err) {
      lastError = err;
      if (err instanceof DeterministicError) throw err;
      if (attempt < TRANSCRIBE_ATTEMPTS - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        continue;
      }
    }
  }

  throw new Error(
    `Could not reach the transcription service (${new URL(endpoint).host}): ${describeError(lastError)}`,
  );
}

/**
 * Normalize a transcription model's reply into chunk-local timed segments.
 * Handles: raw SRT text (optionally wrapped in markdown code fences), JSON
 * with `segments`, and JSON with only `text` (untimed — returned as empty so
 * the caller can report it).
 */
function normalizeTranscriptOutput(raw: string): TimedSegment[] {
  let trimmed = (raw || "").trim();
  if (!trimmed) return [];

  // Strip markdown code fences the model may add around the SRT.
  if (trimmed.startsWith("```")) {
    trimmed = trimmed
      .replace(/^```[a-zA-Z]*\s*/, "")
      .replace(/```\s*$/, "")
      .trim();
  }

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
      if (data.text) return srtToSegments(data.text);
      return [];
    } catch {
      return [];
    }
  }

  // Plain SRT (the requested format).
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
