"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { detectPlatform } from "../lib/video-platforms";
import { youtubeJson3ToSegments, buildSrtFromSegments, type TimedSegment } from "../lib/timed-text";

/**
 * Enrich a link-based video source with real platform metadata (title,
 * thumbnail, author) via each platform's public oEmbed endpoint, and — when
 * the platform exposes captions publicly (YouTube) — pull the transcript and
 * kick off the existing AI clipping analysis automatically.
 */
export const enrichLinkSource = action({
  args: {
    sourceId: v.id("videoSources"),
    url: v.string(),
    language: v.optional(v.string()),
    focusTopic: v.optional(v.string()),
    autoAnalyze: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const detected = detectPlatform(args.url);
    const platformId = detected?.id ?? "link";

    // ── 1. oEmbed metadata (best-effort; never fatal) ──────
    const meta = await fetchOEmbedMeta(platformId, args.url);
    if (meta) {
      await ctx.runMutation(internal.videoClips.patchSourceMetaInternal, {
        sourceId: args.sourceId,
        ...(meta.title ? { title: meta.title } : {}),
        ...(meta.thumbnailUrl ? { thumbnailUrl: meta.thumbnailUrl } : {}),
        ...(meta.authorName ? { authorName: meta.authorName } : {}),
      });
    }

    // ── 2. Public captions (YouTube only, for now) ─────────
    if (platformId === "youtube" && detected?.videoId && args.autoAnalyze !== false) {
      const transcript = await fetchYouTubeCaptions(detected.videoId, args.language);
      if (transcript.segments.length > 0) {
        const durationSec = transcript.segments.reduce((acc, s) => Math.max(acc, s.end), 0);
        const mergedSrt = buildSrtFromSegments(transcript.segments);

        await ctx.runAction(api.videoClipping.analyzeSource, {
          sourceId: args.sourceId,
          transcriptText: mergedSrt,
          ...(durationSec > 0 ? { durationSec } : {}),
          ...(args.focusTopic ? { focusTopic: args.focusTopic } : {}),
        });
        return {
          enriched: true,
          transcriptFound: true,
          durationSec,
          message: `Pulled YouTube captions (${transcript.segments.length} cues) and started AI clipping.`,
        };
      }
    }

    // ── 3. No public transcript — tell the user exactly why ──
    const guidance =
      platformId === "youtube"
        ? "No public captions found on this YouTube video. Paste its transcript (the transcript panel under the video) to continue."
        : platformId === "tiktok" || platformId === "instagram" || platformId === "facebook"
          ? `${detected?.name ?? "This platform"} does not expose captions publicly. Export the video, drop the file in the Upload tab (we transcribe it with Whisper), or paste its SRT/VTT transcript.`
          : "No public transcript available for this link. Use Upload (audio transcription) or paste an SRT/VTT transcript.";

    return { enriched: !!meta, transcriptFound: false, durationSec: undefined, message: guidance };
  },
});

// ── oEmbed metadata ──────────────────────────────────────────

interface OEmbedMeta {
  title?: string;
  thumbnailUrl?: string;
  authorName?: string;
}

function oEmbedEndpoint(platformId: string, url: string): string | null {
  const enc = encodeURIComponent(url);
  switch (platformId) {
    case "youtube":
      return `https://www.youtube.com/oembed?url=${enc}&format=json`;
    case "tiktok":
      return `https://www.tiktok.com/oembed?url=${enc}`;
    case "instagram":
      // Requires an app token in many cases; still attempted gracefully.
      return `https://graph.facebook.com/v18.0/instagram_oembed?url=${enc}`;
    case "vimeo":
      return `https://vimeo.com/api/oembed.json?url=${enc}`;
    case "dailymotion":
      return `https://www.dailymotion.com/services/oembed?url=${enc}&format=json`;
    case "twitch":
      // Twitch oEmbed needs a client id; skipped to keep this keyless.
      return null;
    case "reddit":
      return `${url.replace(/\/$/, "")}.json`;
    case "facebook":
      return null;
    default:
      return null;
  }
}

async function fetchOEmbedMeta(platformId: string, url: string): Promise<OEmbedMeta | null> {
  const endpoint = oEmbedEndpoint(platformId, url);
  if (!endpoint) return null;
  try {
    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const title = typeof data.title === "string" ? data.title : undefined;
    const thumbnailUrl = typeof data.thumbnail_url === "string" ? data.thumbnail_url : undefined;
    const authorName = typeof data.author_name === "string" ? data.author_name : undefined;
    if (!title && !thumbnailUrl && !authorName) return null;
    return { title, thumbnailUrl, authorName };
  } catch {
    return null;
  }
}

// ── YouTube captions ─────────────────────────────────────────

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function fetchYouTubeCaptions(
  videoId: string,
  language?: string,
): Promise<{ segments: TimedSegment[] }> {
  try {
    const page = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
      headers: { "User-Agent": UA, "Accept-Language": "en" },
      signal: AbortSignal.timeout(10000),
    });
    if (!page.ok) return { segments: [] };
    const html = await page.text();

    const m = html.match(/"captionTracks":(\[.*?\])/);
    if (!m) return { segments: [] };

    let tracks: { baseUrl?: string; languageCode?: string; kind?: string }[] = [];
    try {
      tracks = JSON.parse(m[1].replace(/\\u0026/g, "&"));
    } catch {
      return { segments: [] };
    }
    if (tracks.length === 0) return { segments: [] };

    const lang = (language || "en").toLowerCase();
    const pick =
      tracks.find((t) => (t.languageCode ?? "").toLowerCase() === lang && t.kind !== "asr") ??
      tracks.find((t) => (t.languageCode ?? "").toLowerCase() === lang) ??
      tracks.find((t) => (t.languageCode ?? "").toLowerCase().startsWith("en")) ??
      tracks[0];
    if (!pick?.baseUrl) return { segments: [] };

    // json3 keeps the cue timing (xml3 would need different parsing).
    const capUrl = `${pick.baseUrl.replace(/\\u0026/g, "&")}&fmt=json3`;
    const cap = await fetch(capUrl, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(10000),
    });
    if (!cap.ok) return { segments: [] };

    return { segments: youtubeJson3ToSegments(await cap.text()) };
  } catch {
    return { segments: [] };
  }
}
