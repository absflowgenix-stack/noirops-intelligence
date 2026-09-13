"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import {
  parseTranscript,
  transcriptForPrompt,
  transcriptToPlain,
  excerptForRange,
  transcriptFormat,
} from "../lib/transcript";

// ── AI plumbing (same convention as ai.ts) ────────────────────

const VLY_KEY = process.env.VLY_INTEGRATION_KEY;
const VLY_BASE =
  process.env.VLY_INTEGRATION_BASE_URL || "https://integrations.freebuff.com";

async function callAI(
  messages: { role: string; content: string }[],
  temperature = 0.6,
  maxTokens = 2500,
) {
  if (!VLY_KEY) {
    throw new Error(
      "AI service not configured. Please add VLY_INTEGRATION_KEY to your environment.",
    );
  }

  const res = await fetch(`${VLY_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VLY_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`AI service error (${res.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ── Public transcript ingestion (social links) ────────────────

interface VideoIntelTranscript {
  transcript?: Array<{ text?: string; start?: number; duration?: number }>;
  [key: string]: unknown;
}

interface VideoIntelResponse {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

/**
 * Fetch a machine transcript for a supported social link via the platform's
 * video-intel service. Returns null when the service can't provide one —
 * callers then fall back to a user-supplied transcript file/paste.
 */
async function fetchPublicTranscript(
  url: string,
): Promise<{ text: string; format: string; durationSec: number | null } | null> {
  const endpoint = `https://video-intel.freebuff.com/api/transcript?url=${encodeURIComponent(url)}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = (await res.json().catch(() => null)) as
      | (VideoIntelResponse & Partial<VideoIntelTranscript>)
      | null;
    if (!data || data.success === false) return null;

    const segments = data.transcript;
    if (!Array.isArray(segments) || segments.length === 0) return null;

    // Rebuild an SRT so the same parser handles both fetched and pasted input.
    const pad = (n: number, len = 2) => String(n).padStart(len, "0");
    const toSrtTime = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      const ms = Math.round((sec - Math.floor(sec)) * 1000);
      return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
    };

    const durationSec =
      typeof data.duration === "number" && data.duration > 0
        ? data.duration
        : null;

    let srt = "";
    segments.forEach((seg, i) => {
      const start = typeof seg.start === "number" ? seg.start : i * 3;
      const dur = typeof seg.duration === "number" && seg.duration > 0 ? seg.duration : 3;
      const text = (seg.text ?? "").trim();
      if (!text) return;
      srt += `${i + 1}\n${toSrtTime(start)} --> ${toSrtTime(start + dur)}\n${text}\n\n`;
    });

    if (!srt.trim()) return null;
    return { text: srt, format: "srt", durationSec };
  } catch {
    // Network/timeout/unavailable — fall back to manual transcript.
    return null;
  }
}

// ── Actions ───────────────────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `You are NoirOps AI Clipper, an expert short-form video editor who finds the most engaging moments in long-form videos and plans their edits.

You will receive a timestamped transcript of a video. Identify the 3-6 strongest moments to cut into standalone short-form clips (15-90 seconds).

A strong clip moment is one of: a hook (bold claim, surprising statement), a story (anecdote with payoff), an insight (useful teaching), humor (a joke or funny exchange), an emotional beat, data/proof (numbers, results, receipts), a demo (showing how something works), or a call to action.

Rules:
- startSec/endSec must be within the video duration and endSec > startSec.
- Prefer moments whose transcript text is self-contained (understandable without the rest of the video).
- Only use momentType values: hook, story, insight, humor, emotional, data, demo, call_to_action.
- For each clip, suggest 1-4 edits drawn from this vocabulary (kind must be one of): cut, zoom, caption, broll, speed, audio, filter, cta.
- Suggest a transition from this vocabulary (id must be one of): jump_cut, whip_pan, zoom_transition, glitch, fade, flash, match_cut.
- caption: a short caption for the clip's target platform (no hashtags inside caption).
- hashtags: 3-5 relevant hashtags WITHOUT the # symbol.
- score: integer 0-100 confidence/engagement estimate for the moment.
- NEVER fabricate quotes that are not in the transcript. Ground every moment in the provided text.

Respond with ONLY a JSON object in this exact shape (no markdown fences, no commentary):
{"clips":[{"title":"...","startSec":12.5,"endSec":48,"score":86,"momentType":"hook","hook":"one-line hook text","reason":"why this moment works","transcriptExcerpt":"exact short quote from the transcript","caption":"platform caption","hashtags":["word","word"],"targetPlatform":"tiktok","aspectRatio":"9:16","edits":[{"kind":"cut","label":"Trim intro","timeSec":4,"reason":"Remove filler pause"}],"transitions":[{"id":"jump_cut","label":"Jump cut","reason":"Keeps energy"}]}]}`;

interface AiEdit {
  kind?: string;
  label?: string;
  timeSec?: number;
  reason?: string;
}
interface AiTransition {
  id?: string;
  label?: string;
  reason?: string;
}
interface AiClip {
  title?: string;
  startSec?: number;
  endSec?: number;
  score?: number;
  momentType?: string;
  hook?: string;
  reason?: string;
  transcriptExcerpt?: string;
  caption?: string;
  hashtags?: string[];
  targetPlatform?: string;
  aspectRatio?: string;
  edits?: AiEdit[];
  transitions?: AiTransition[];
}

const EDIT_KINDS = new Set([
  "cut",
  "zoom",
  "caption",
  "broll",
  "speed",
  "audio",
  "filter",
  "cta",
]);
const TRANSITION_IDS = new Set([
  "jump_cut",
  "whip_pan",
  "zoom_transition",
  "glitch",
  "fade",
  "flash",
  "match_cut",
]);
const MOMENT_IDS = new Set([
  "hook",
  "story",
  "insight",
  "humor",
  "emotional",
  "data",
  "demo",
  "call_to_action",
]);

/** Pull the first JSON object out of a model response (tolerates fences/prose). */
export function extractJsonObject(raw: string): Record<string, unknown> | null {
  if (!raw) return null;
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const candidate = text.slice(start, i + 1);
        try {
          return JSON.parse(candidate) as Record<string, unknown>;
        } catch {
          // Try the next outermost object after this one.
          const next = text.indexOf("{", i + 1);
          if (next === -1) return null;
          // Reset scanning from the next candidate start.
          let d = 0;
          let str = false;
          let esc = false;
          for (let j = next; j < text.length; j++) {
            const c2 = text[j];
            if (str) {
              if (esc) esc = false;
              else if (c2 === "\\") esc = true;
              else if (c2 === '"') str = false;
              continue;
            }
            if (c2 === '"') str = true;
            else if (c2 === "{") d++;
            else if (c2 === "}") {
              d--;
              if (d === 0) {
                try {
                  return JSON.parse(text.slice(next, j + 1)) as Record<string, unknown>;
                } catch {
                  break;
                }
              }
            }
          }
          return null;
        }
      }
    }
  }
  return null;
}

const TARGET_PLATFORMS = new Set([
  "tiktok",
  "instagram",
  "youtube",
  "twitter",
  "linkedin",
  "facebook",
]);
const ASPECT_RATIOS = new Set(["9:16", "1:1", "16:9", "4:5"]);

function clampNumber(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === "number" && Number.isFinite(n) ? n : fallback;
  return Math.min(max, Math.max(min, v));
}

function normalizeClips(
  parsed: Record<string, unknown>,
  durationSec: number | null,
  cues: ReturnType<typeof parseTranscript>["cues"],
  hasTiming: boolean,
) {
  const rawClips = Array.isArray(parsed.clips) ? (parsed.clips as AiClip[]) : [];
  const maxEnd = durationSec ?? Number.MAX_SAFE_INTEGER;

  return rawClips
    .map((c) => {
      let startSec = clampNumber(c.startSec, 0, maxEnd, 0);
      let endSec = clampNumber(c.endSec, 0, maxEnd, 0);
      if (!hasTiming) {
        // Untimed transcripts: lay clips out sequentially as proportional cuts.
        return null;
      }
      if (endSec - startSec < 3) endSec = Math.min(maxEnd, startSec + 3);
      if (endSec <= startSec) return null;

      const score = Math.round(clampNumber(c.score, 0, 100, 50));

      const edits = Array.isArray(c.edits)
        ? c.edits
            .filter((e) => e && typeof e === "object" && EDIT_KINDS.has(String(e.kind)))
            .slice(0, 4)
            .map((e) => ({
              kind: String(e.kind),
              label: String(e.label ?? "Edit"),
              timeSec:
                typeof e.timeSec === "number" && Number.isFinite(e.timeSec)
                  ? clampNumber(e.timeSec, 0, maxEnd, 0)
                  : undefined,
              reason: String(e.reason ?? "").slice(0, 300),
            }))
        : [];

      const transitions = Array.isArray(c.transitions)
        ? c.transitions
            .filter(
              (t) => t && typeof t === "object" && TRANSITION_IDS.has(String(t.id)),
            )
            .slice(0, 3)
            .map((t) => ({
              id: String(t.id),
              label: String(t.label ?? t.id),
              reason: String(t.reason ?? "").slice(0, 300),
            }))
        : [];

      const aspectRatio = ASPECT_RATIOS.has(String(c.aspectRatio))
        ? String(c.aspectRatio)
        : "9:16";
      const targetPlatform = TARGET_PLATFORMS.has(String(c.targetPlatform))
        ? String(c.targetPlatform)
        : "tiktok";

      const excerpt =
        typeof c.transcriptExcerpt === "string" && c.transcriptExcerpt.trim()
          ? c.transcriptExcerpt.trim().slice(0, 400)
          : excerptForRange(cues, startSec, endSec);

      return {
        title: String(c.title ?? "Untitled clip").slice(0, 120),
        startSec: Math.round(startSec * 10) / 10,
        endSec: Math.round(endSec * 10) / 10,
        score,
        momentType: MOMENT_IDS.has(String(c.momentType)) ? String(c.momentType) : "insight",
        hook: typeof c.hook === "string" ? c.hook.slice(0, 300) : undefined,
        reason: typeof c.reason === "string" ? c.reason.slice(0, 500) : undefined,
        transcriptExcerpt: excerpt,
        caption: typeof c.caption === "string" ? c.caption.slice(0, 2000) : undefined,
        hashtags: Array.isArray(c.hashtags)
          ? c.hashtags
              .filter((h) => typeof h === "string" && h.trim())
              .slice(0, 6)
              .map((h) => h.replace(/^#/, "").trim())
              .filter(Boolean)
          : [],
        targetPlatform,
        aspectRatio,
        edits,
        transitions,
      };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

export const analyzeTranscript = action({
  args: {
    transcript: v.string(),
    videoTitle: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    platform: v.optional(v.string()),
    targetPlatform: v.optional(v.string()),
    focus: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const parsed = parseTranscript(args.transcript);
    if (parsed.cues.length === 0) {
      throw new Error(
        "The transcript appears to be empty. Paste an SRT/VTT file, transcript text, or a supported video link.",
      );
    }

    const promptTranscript = transcriptForPrompt(parsed.cues, 60000);
    const userPrompt = [
      `Video title: ${args.videoTitle || "Untitled"}`,
      args.videoUrl ? `Video URL: ${args.videoUrl}` : null,
      args.platform ? `Source platform: ${args.platform}` : null,
      `Detected transcript format: ${transcriptFormat(args.transcript)}`,
      `Video duration: ${parsed.durationSec ? `${Math.round(parsed.durationSec)} seconds` : "unknown"}`,
      `Transcript timing: ${parsed.hasTiming ? "timestamped" : "plain text (no timestamps)"}`,
      args.targetPlatform ? `Preferred clip target: ${args.targetPlatform}` : null,
      args.focus ? `User focus: ${args.focus}` : null,
      "",
      "Transcript:",
      promptTranscript,
    ]
      .filter((l) => l !== null)
      .join("\n");

    const result = await callAI(
      [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      0.5,
      3000,
    );

    const jsonObj = extractJsonObject(result);
    if (!jsonObj) {
      throw new Error(
        "The AI response could not be parsed. Please try again — this is usually temporary.",
      );
    }

    const clips = normalizeClips(
      jsonObj,
      parsed.durationSec,
      parsed.cues,
      parsed.hasTiming,
    );
    if (clips.length === 0) {
      throw new Error(
        "No strong clip moments were found in this transcript. Try a livelier section of the video.",
      );
    }

    return {
      clips,
      durationSec: parsed.durationSec,
      wordCount: parsed.wordCount,
      hasTiming: parsed.hasTiming,
      format: transcriptFormat(args.transcript),
      plainExcerpt: transcriptToPlain(parsed.cues, 300),
    };
  },
});

export const getTranscriptForLink = action({
  args: { url: v.string() },
  handler: async (_ctx, args) => {
    const result = await fetchPublicTranscript(args.url);
    if (!result) {
      throw new Error(
        "Could not auto-fetch captions for this link. Paste the transcript (SRT/VTT or text) instead.",
      );
    }
    return result;
  },
});

export const analyzeVideo = action({
  args: {
    transcript: v.string(),
    videoTitle: v.string(),
    videoUrl: v.optional(v.string()),
    platform: v.optional(v.string()),
    targetPlatform: v.optional(v.string()),
    focus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Thin wrapper kept for API clarity in the UI; same pipeline as analyzeTranscript.
    return await ctx.runAction("videoClipping:analyzeTranscript", {
      transcript: args.transcript,
      videoTitle: args.videoTitle,
      videoUrl: args.videoUrl,
      platform: args.platform,
      targetPlatform: args.targetPlatform,
      focus: args.focus,
    } as never);
  },
});
