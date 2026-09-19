"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { EDIT_TYPES, TRANSITIONS, MOMENT_TYPES } from "../lib/video-platforms";
import { parseTranscript, transcriptForPrompt, excerptForRange } from "../lib/transcript";

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

/** Cap the transcript fed to the model — long-form safe. */
const MAX_TRANSCRIPT_CHARS = 120_000;
const MAX_CLIPS = 8;

async function callAI(
  messages: { role: string; content: string }[],
  temperature = 0.4,
  maxTokens = 3000,
): Promise<string> {
  const key = vlyKey();
  if (!key) {
    throw new Error(
      "AI service not configured. Please add VLY_INTEGRATION_KEY to your environment.",
    );
  }

  const res = await fetch(`${vlyBase()}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`AI service error (${res.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

interface AiEdit {
  type: string;
  atSec: number;
  note: string;
}
interface AiTransition {
  type: string;
  atSec: number;
  note: string;
}
interface AiClip {
  title: string;
  startSec: number;
  endSec: number;
  score: number;
  momentType: string;
  hook: string;
  reason: string;
  transcriptExcerpt?: string;
  caption: string;
  hashtags: string[];
  targetPlatform: string;
  aspectRatio: string;
  edits: AiEdit[];
  transitions: AiTransition[];
}

const SYSTEM_PROMPT = `You are NoirOps Clip Director, an expert short-form video editor and content strategist.

You receive the timestamped transcript of a long-form video and identify the strongest short-form clip moments.

You must respond with ONLY a JSON object (no markdown fences) shaped exactly like:
{
  "clips": [
    {
      "title": "short punchy clip title",
      "startSec": 125,
      "endSec": 173,
      "score": 87,
      "momentType": "one of: ${MOMENT_TYPES.map((m) => m.id).join(", ")}",
      "hook": "the first-line hook text for this clip",
      "reason": "why this moment works as a standalone short",
      "caption": "ready-to-post caption for the target platform",
      "hashtags": ["#relevant", "#tags"],
      "targetPlatform": "tiktok|instagram|youtube|twitter|linkedin|facebook",
      "aspectRatio": "9:16",
      "edits": [ { "type": "one of: ${EDIT_TYPES.map((e) => e.id).join(", ")}", "atSec": 130, "note": "what to do and why" } ],
      "transitions": [ { "type": "one of: ${TRANSITIONS.map((t) => t.id).join(", ")}", "atSec": 140, "note": "which transition and why" } ]
    }
  ]
}

Rules:
- Clips must be 15-90 seconds long and must not overlap each other.
- Score 0-100; only return clips you would actually publish (score >= 55). Return at most ${MAX_CLIPS}.
- startSec/endSec must be numbers in seconds within the video duration.
- Prioritize: strong hooks, contrarian takes, emotional peaks, concrete numbers, demonstrations, punchlines.
- Suggest 1-4 edits per clip and 0-3 transitions. Only use the listed ids.
- Captions must fit the targetPlatform's style (short and punchy for tiktok, professional for linkedin, etc.).
- Never invent content that is not in the transcript.`;

export const analyzeSource = action({
  args: {
    sourceId: v.id("videoSources"),
    transcriptText: v.string(),
    durationSec: v.optional(v.number()),
    focusTopic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const source = await ctx.runQuery(api.videoClips.getSource, {
      sourceId: args.sourceId,
    });
    if (!source) throw new Error("Video source not found");

    try {
      const parsed = parseTranscript(args.transcriptText);
      if (parsed.cues.length === 0) {
        throw new Error("Transcript is empty — nothing to analyze.");
      }
      if (!parsed.hasTiming) {
        throw new Error(
          "Transcript has no timestamps. Provide an SRT/VTT transcript (or a video file) so clips can be located in time.",
        );
      }

      const duration =
        args.durationSec && args.durationSec > 0
          ? args.durationSec
          : (parsed.duration ?? 0);
      if (!duration) {
        throw new Error("Could not determine the video duration from the transcript.");
      }

      const promptTranscript = transcriptForPrompt(
        parsed.cues,
        MAX_TRANSCRIPT_CHARS,
      );

      const userPrompt = [
        `Video title: ${source.title}`,
        source.platform ? `Source platform: ${source.platform}` : null,
        `Video duration: ${Math.round(duration)} seconds`,
        args.focusTopic ? `Creator focus: ${args.focusTopic}` : null,
        "",
        "Transcript:",
        promptTranscript,
      ]
        .filter((l) => l !== null)
        .join("\n");

      const raw = await callAI(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        0.4,
        3000,
      );

      const clips = normalizeClips(raw, duration);
      if (clips.length === 0) {
        throw new Error(
          "The AI did not find any strong short-form moments in this transcript. Try a more content-dense video.",
        );
      }

      // Attach real transcript excerpts for context in the UI.
      for (const clip of clips) {
        clip.transcriptExcerpt = excerptForRange(
          parsed.cues,
          clip.startSec,
          clip.endSec,
        );
      }

      await ctx.runMutation(internal.videoClips.saveClipsInternal, {
        sourceId: args.sourceId,
        clips,
      });

      await ctx.runMutation(internal.videoClips.markSourceReadyInternal, {
        sourceId: args.sourceId,
        durationSec: duration,
        transcriptText: args.transcriptText.slice(0, MAX_TRANSCRIPT_CHARS),
        transcriptFormat: parsed.hasTiming ? detectFormat(args.transcriptText) : "plain",
        transcriptWordCount: parsed.wordCount,
      });

      return { clipCount: clips.length, durationSec: duration };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown analysis error";
      await ctx.runMutation(internal.videoClips.markSourceFailedInternal, {
        sourceId: args.sourceId,
        errorMessage: message,
      });
      throw err;
    }
  },
});

function detectFormat(text: string): string {
  if (/^WEBVTT/i.test(text.trim())) return "vtt";
  return "srt";
}

/** Validate/repair the model's JSON into safe clip records. */
function normalizeClips(raw: string, durationSec: number): AiClip[] {
  let data: { clips?: unknown };
  try {
    data = JSON.parse(raw);
  } catch {
    // Some gateways wrap JSON in fences despite response_format.
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return [];
    try {
      data = JSON.parse(match[0]);
    } catch {
      return [];
    }
  }

  const list = Array.isArray(data.clips) ? data.clips : [];
  const validEditTypes = new Set<string>(EDIT_TYPES.map((e) => e.id));
  const validTransitionTypes = new Set<string>(TRANSITIONS.map((t) => t.id));
  const validMomentTypes = new Set<string>(MOMENT_TYPES.map((m) => m.id));

  const clips: AiClip[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const c = item as Record<string, unknown>;

    const start = clamp(Number(c.startSec), 0, durationSec);
    const end = clamp(Number(c.endSec), 0, durationSec);
    const len = end - start;
    if (!Number.isFinite(start) || !Number.isFinite(end) || len < 5) continue;

    const momentType = validMomentTypes.has(String(c.momentType))
      ? String(c.momentType)
      : "insight";

    const edits = (Array.isArray(c.edits) ? c.edits : [])
      .map((e) => e as Record<string, unknown>)
      .filter((e) => e && validEditTypes.has(String(e.type)))
      .slice(0, 5)
      .map((e) => ({
        type: String(e.type),
        atSec: clamp(Number(e.atSec) || start, start, end),
        note: String(e.note ?? "").slice(0, 300),
      }));

    const transitions = (Array.isArray(c.transitions) ? c.transitions : [])
      .map((t) => t as Record<string, unknown>)
      .filter((t) => t && validTransitionTypes.has(String(t.type)))
      .slice(0, 4)
      .map((t) => ({
        type: String(t.type),
        atSec: clamp(Number(t.atSec) || start, start, end),
        note: String(t.note ?? "").slice(0, 300),
      }));

    clips.push({
      title: String(c.title ?? "Untitled clip").slice(0, 120),
      startSec: Math.round(start * 10) / 10,
      endSec: Math.round(end * 10) / 10,
      score: Math.round(clamp(Number(c.score) || 60, 0, 100)),
      momentType,
      hook: String(c.hook ?? "").slice(0, 300),
      reason: String(c.reason ?? "").slice(0, 500),
      caption: String(c.caption ?? "").slice(0, 600),
      hashtags: (Array.isArray(c.hashtags) ? c.hashtags : [])
        .map((h) => String(h).slice(0, 40))
        .slice(0, 8),
      targetPlatform: String(c.targetPlatform ?? "tiktok").slice(0, 30),
      aspectRatio: String(c.aspectRatio ?? "9:16").slice(0, 10),
      edits,
      transitions,
    });
    if (clips.length >= MAX_CLIPS) break;
  }

  // Enforce non-overlap, keeping the highest-scored clip of any conflict.
  clips.sort((a, b) => b.score - a.score);
  const kept: AiClip[] = [];
  for (const clip of clips) {
    const overlaps = kept.some(
      (k) => clip.startSec < k.endSec && clip.endSec > k.startSec,
    );
    if (!overlaps) kept.push(clip);
  }
  return kept.sort((a, b) => a.startSec - b.startSec);
}

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
