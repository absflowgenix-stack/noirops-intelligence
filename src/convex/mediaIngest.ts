"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { detectPlatform } from "../lib/video-platforms";

/**
 * Media ingestion for link-based sources.
 *
 * Tier 1 (always available, keyless): direct-file resolvers for platforms
 * that expose progressive MP4s publicly (Vimeo, Reddit, Rumble, direct
 * links). If a resolver returns a direct media URL, the video is copied
 * into Convex storage and attached to the source, so clips play inside
 * NoirOps and can be rendered client-side.
 *
 * Tier 2 (optional, zero code when configured): an external extractor
 * service (Apify actor, RapidAPI, self-hosted yt-dlp API, etc.). Set
 * MEDIA_EXTRACTOR_URL to an endpoint that returns { url } for a social
 * link and YouTube/TikTok/Instagram/X/Facebook videos are fetched into
 * storage the same way. Without it, those platforms still clip via
 * captions/transcript exactly as before (nothing is removed).
 */

// Node actions have a 512 MiB memory ceiling, so server-side fetches are
// capped below it. The 1 GB client-upload path is unaffected: the browser
// POSTs those straight to Convex storage without passing through an action.
const MAX_SERVER_FETCH_BYTES = 400 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8 * 60 * 1000;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface ResolvedMedia {
  url: string;
  contentType?: string;
}

interface IngestResult {
  stored: boolean;
  bytes?: number;
  reason?: string;
}

interface EnrichResult {
  enriched: boolean;
  transcriptFound: boolean;
  durationSec?: number;
  message: string;
}

export const ingestLinkMedia = action({
  args: {
    sourceId: v.id("videoSources"),
    url: v.string(),
  },
  handler: async (ctx, args): Promise<IngestResult> => {
    const detected = detectPlatform(args.url);
    const platformId = detected?.id ?? "link";

    try {
      // ── Resolve a direct media URL ──────────────────────
      let resolved: ResolvedMedia | null = null;

      // Tier 2: external extractor service first (all platforms, most reliable).
      const extractorBase = process.env.MEDIA_EXTRACTOR_URL;
      if (extractorBase) {
        resolved = await resolveViaExtractor(extractorBase, args.url);
      }

      // Tier 1: keyless public resolvers.
      if (!resolved) {
        resolved = await resolvePublicMedia(platformId, args.url);
      }

      if (!resolved) {
        await ctx.runMutation(internal.videoClips.markSourceMediaFailedInternal, {
          sourceId: args.sourceId,
          errorMessage:
            "This platform does not expose a downloadable video publicly. Upload the file or add a transcript instead.",
        });
        return { stored: false, reason: "no-direct-media" };
      }

      // ── Fetch the media file (streamed through a bounded buffer) ──
      const res = await fetch(resolved.url, {
        headers: { "User-Agent": UA, Accept: "video/*,audio/*,*/*" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        redirect: "follow",
      });
      if (!res.ok || !res.body) {
        throw new Error(`Media download failed (HTTP ${res.status}).`);
      }

      const declared = Number(res.headers.get("content-length") ?? 0);
      if (declared > MAX_SERVER_FETCH_BYTES) {
        await ctx.runMutation(internal.videoClips.markSourceMediaFailedInternal, {
          sourceId: args.sourceId,
          errorMessage:
            "The source video exceeds the 400 MB server-side fetch limit. Upload the file directly (up to 1 GB) instead.",
        });
        return { stored: false, reason: "too-large" };
      }

      const reader = res.body.getReader();
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        chunks.push(value);
        total += value.byteLength;
        if (total > MAX_SERVER_FETCH_BYTES) {
          await reader.cancel();
          throw new Error(
            "The source video exceeds the 400 MB server-side fetch limit. Upload the file directly (up to 1 GB) instead.",
          );
        }
      }
      if (total === 0) {
        throw new Error("The media response was empty.");
      }

      const merged = mergeChunks(chunks, total);
      const contentType =
        res.headers.get("content-type") ?? resolved.contentType ?? "video/mp4";
      const storageId = await uploadToStorage(ctx, merged, contentType);

      // ── Attach to the source ────────────────────────────
      await ctx.runMutation(api.videoClips.attachSourceMedia, {
        sourceId: args.sourceId,
        mediaUrl: resolved.url,
        mediaStorageId: storageId as never,
        mediaBytes: total,
        mediaContentType: contentType,
      });

      return { stored: true, bytes: total };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Media ingestion failed";
      await ctx.runMutation(internal.videoClips.markSourceMediaFailedInternal, {
        sourceId: args.sourceId,
        errorMessage: message,
      });
      return { stored: false, reason: message.slice(0, 200) };
    }
  },
});

/** Combined flow for links: enrich metadata + captions, then pull media. */
export const enrichAndIngestLink = action({
  args: {
    sourceId: v.id("videoSources"),
    url: v.string(),
    language: v.optional(v.string()),
    focusTopic: v.optional(v.string()),
    autoAnalyze: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<EnrichResult & { mediaStored: boolean }> => {
    // 1. Existing enrichment + caption-based clipping (behavior unchanged).
    const enrichResult = (await ctx.runAction(api.platformIngest.enrichLinkSource, {
      sourceId: args.sourceId,
      url: args.url,
      ...(args.language ? { language: args.language } : {}),
      ...(args.focusTopic ? { focusTopic: args.focusTopic } : {}),
      autoAnalyze: args.autoAnalyze,
    })) as EnrichResult;

    // 2. Media ingestion (new; best-effort, never blocks analysis).
    const mediaResult = (await ctx.runAction(api.mediaIngest.ingestLinkMedia, {
      sourceId: args.sourceId,
      url: args.url,
    })) as IngestResult;

    const transcriptFound = enrichResult?.transcriptFound === true;
    let message = enrichResult?.message ?? "";
    if (mediaResult.stored) {
      const mb = Math.round((mediaResult.bytes ?? 0) / (1024 * 1024));
      message += ` Video downloaded into NoirOps (${mb} MB) — clips can be previewed and rendered in-app.`;
    } else if (!transcriptFound) {
      message +=
        " Could not download the video from this platform; you can still upload the file in the Video tab.";
    }
    return {
      enriched: enrichResult?.enriched === true,
      transcriptFound,
      durationSec: enrichResult?.durationSec,
      mediaStored: mediaResult.stored,
      message,
    };
  },
});

// ── Tier 2: external extractor service ──────────────────────

async function resolveViaExtractor(base: string, url: string): Promise<ResolvedMedia | null> {
  try {
    const endpoint = base.includes("{url}")
      ? base.replace("{url}", encodeURIComponent(url))
      : `${base.replace(/\/$/, "")}/extract?url=${encodeURIComponent(url)}`;
    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { url?: string; contentType?: string };
    if (typeof data.url === "string" && data.url.startsWith("http")) {
      return { url: data.url, contentType: data.contentType };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Tier 1: keyless public resolvers ────────────────────────

async function resolvePublicMedia(platformId: string, url: string): Promise<ResolvedMedia | null> {
  try {
    if (platformId === "vimeo") return await resolveVimeo(url);
    if (platformId === "reddit") return await resolveReddit(url);
    if (platformId === "rumble") return await resolveRumble(url);
    if (platformId === "link") return await resolveDirectFile(url);
    // youtube / tiktok / instagram / twitter / facebook / twitch / linkedin /
    // dailymotion: no keyless direct file — they need the extractor tier or
    // the existing transcript flows.
    return null;
  } catch {
    return null;
  }
}

/** Vimeo: player config exposes progressive MP4 renditions. */
async function resolveVimeo(pageUrl: string): Promise<ResolvedMedia | null> {
  const idMatch = pageUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (!idMatch) return null;
  const res = await fetch(`https://player.vimeo.com/video/${idMatch[1]}/config`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const config = (await res.json()) as {
    request?: { files?: { progressive?: { url?: string; mime?: string; width?: number }[] } };
  };
  const files = config.request?.files?.progressive ?? [];
  if (files.length === 0) return null;
  // Prefer ~720p (balanced size/quality) over the largest master rendition.
  const sorted = [...files].sort((a, b) => (a.width ?? 0) - (b.width ?? 0));
  const pick = sorted.find((f) => (f.width ?? 0) >= 1280) ?? sorted[sorted.length - 1];
  if (!pick?.url) return null;
  return { url: pick.url, contentType: pick.mime ?? "video/mp4" };
}

/** Reddit: the post's public .json exposes the fallback video url. */
async function resolveReddit(pageUrl: string): Promise<ResolvedMedia | null> {
  const endpoint = `${pageUrl.replace(/\/$/, "")}.json`;
  const res = await fetch(endpoint, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as RedditJson;
  const fallback = findRedditFallback(data);
  if (!fallback) return null;
  // Strip range-request params so the whole progressive file is served.
  return { url: fallback.split("?")[0], contentType: "video/mp4" };
}

interface RedditJson {
  data?: {
    children?: {
      data?: {
        media?: { reddit_video?: { fallback_url?: string } };
        secure_media?: { reddit_video?: { fallback_url?: string } };
        crosspost_parent_list?: { media?: { reddit_video?: { fallback_url?: string } } }[];
      };
    }[];
  };
}

function findRedditFallback(data: RedditJson): string | undefined {
  const child = data.data?.children?.[0]?.data;
  return (
    child?.media?.reddit_video?.fallback_url ??
    child?.secure_media?.reddit_video?.fallback_url ??
    child?.crosspost_parent_list?.[0]?.media?.reddit_video?.fallback_url
  );
}

/** Rumble: the page embeds a canonical mp4 url in its player JSON. */
async function resolveRumble(pageUrl: string): Promise<ResolvedMedia | null> {
  const res = await fetch(pageUrl, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) return null;
  const html = await res.text();
  const m = html.match(/"url"\s*:\s*"(https:\/\/[^"]+\.mp4[^"]*)"/);
  if (!m) return null;
  const url = m[1].replace(/\\u002F/gi, "/").replace(/\\\//g, "/");
  return { url, contentType: "video/mp4" };
}

/** Any direct file link (.mp4/.webm/.mov/.m4v) passes straight through. */
async function resolveDirectFile(url: string): Promise<ResolvedMedia | null> {
  if (!/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return null;
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000),
    });
    const type = res.headers.get("content-type") ?? "video/mp4";
    const okType = type.startsWith("video/") || type.startsWith("application/octet-stream");
    if (!res.ok || !okType) return null;
    return { url, contentType: type };
  } catch {
    return null;
  }
}

// ── Storage helpers ─────────────────────────────────────────

async function uploadToStorage(
  ctx: { storage: { generateUploadUrl(): Promise<string> } },
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  const uploadUrl = await ctx.storage.generateUploadUrl();
  const body = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Storage upload failed (${res.status}) ${text.slice(0, 100)}`);
  }
  const { storageId } = (await res.json()) as { storageId: string };
  return storageId;
}

function mergeChunks(chunks: Uint8Array[], total: number): Uint8Array {
  if (chunks.length === 1) return chunks[0];
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}
