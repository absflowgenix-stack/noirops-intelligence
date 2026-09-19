import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";

// ── Video sources ─────────────────────────────────────────

export const createSource = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    sourceKind: v.union(v.literal("link"), v.literal("upload"), v.literal("transcript")),
    url: v.optional(v.string()),
    platform: v.optional(v.string()),
    videoId: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    fileSizeBytes: v.optional(v.number()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("videoSources", {
      ...args,
      status: "pending" as const,
    });
  },
});

export const markSourceReady = mutation({
  args: {
    sourceId: v.id("videoSources"),
    durationSec: v.optional(v.number()),
    transcriptText: v.optional(v.string()),
    transcriptFormat: v.optional(v.string()),
    transcriptWordCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sourceId, ...patch } = args;
    await ctx.db.patch(sourceId, patch);
    await ctx.db.patch(sourceId, { status: "ready" as const, errorMessage: undefined });
  },
});

export const markSourceFailed = mutation({
  args: { sourceId: v.id("videoSources"), errorMessage: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, {
      status: "failed" as const,
      errorMessage: args.errorMessage.slice(0, 500),
    });
  },
});

export const getSource = query({
  args: { sourceId: v.id("videoSources") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sourceId);
  },
});

export const listSources = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videoSources")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 25);
  },
});

export const deleteSource = mutation({
  args: { sourceId: v.id("videoSources") },
  handler: async (ctx, args) => {
    // Cascading delete: remove the source's clips, then the source itself.
    const clips = await ctx.db
      .query("videoClips")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .collect();
    for (const clip of clips) {
      await ctx.db.delete(clip._id);
    }
    await ctx.db.delete(args.sourceId);
  },
});

// ── Clips ─────────────────────────────────────────────────

export const saveClips = mutation({
  args: {
    sourceId: v.id("videoSources"),
    userId: v.string(),
    clips: v.array(
      v.object({
        title: v.string(),
        startSec: v.number(),
        endSec: v.number(),
        score: v.number(),
        momentType: v.optional(v.string()),
        hook: v.optional(v.string()),
        reason: v.optional(v.string()),
        transcriptExcerpt: v.optional(v.string()),
        caption: v.optional(v.string()),
        hashtags: v.optional(v.array(v.string())),
        targetPlatform: v.optional(v.string()),
        aspectRatio: v.optional(v.string()),
        edits: v.optional(v.any()),
        transitions: v.optional(v.any()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const ids: string[] = [];
    for (const clip of args.clips) {
      ids.push(
        await ctx.db.insert("videoClips", {
          ...clip,
          userId: args.userId,
          sourceId: args.sourceId,
          status: "suggested" as const,
        }),
      );
    }
    return ids;
  },
});

export const listClipsForSource = query({
  args: { sourceId: v.id("videoSources") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videoClips")
      .withIndex("by_source", (q) => q.eq("sourceId", args.sourceId))
      .order("desc")
      .collect();
  },
});

export const listClipsForUser = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videoClips")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const updateClipStatus = mutation({
  args: {
    clipId: v.id("videoClips"),
    status: v.union(
      v.literal("suggested"),
      v.literal("accepted"),
      v.literal("exported"),
      v.literal("dismissed"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.clipId, { status: args.status });
  },
});

export const deleteClip = mutation({
  args: { clipId: v.id("videoClips") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.clipId);
  },
});

// ── Local upload audio pipeline (additive) ────────────────

/** Raised cap for transcript files (was 5 MB) — 1 GB, same as video uploads. */
export const MAX_TRANSCRIPT_FILE_BYTES = 1024 * 1024 * 1024; // 1 GB

/** Short-lived upload URL (audio chunks, rendered clip assets). */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/** Attach uploaded audio chunk storage ids + file metadata to a source. */
export const attachSourceAudio = mutation({
  args: {
    sourceId: v.id("videoSources"),
    audioStorageIds: v.array(v.id("_storage")),
    durationSec: v.optional(v.number()),
    fileSizeBytes: v.optional(v.number()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sourceId, ...patch } = args;
    await ctx.db.patch(sourceId, patch);
  },
});

/** Temporary URL for one stored file (actions fetch it to transcribe). */
export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

/** Enrich a source with platform-link metadata (oEmbed / captions). */
export const patchSourceMeta = mutation({
  args: {
    sourceId: v.id("videoSources"),
    title: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    authorName: v.optional(v.string()),
    durationSec: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sourceId, ...patch } = args;
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    );
    if (Object.keys(clean).length > 0) {
      await ctx.db.patch(sourceId, clean);
    }
  },
});

// ── Media ingestion + client delivery (additive) ───────────

/** Record that a social-link video was fetched into NoirOps storage. */
export const attachSourceMedia = mutation({
  args: {
    sourceId: v.id("videoSources"),
    mediaUrl: v.string(),
    mediaStorageId: v.id("_storage"),
    mediaBytes: v.number(),
    mediaContentType: v.string(),
  },
  handler: async (ctx, args) => {
    const { sourceId, ...fields } = args;
    await ctx.db.patch(sourceId, { ...fields, mediaStatus: "stored" as const });
  },
});

/** Record a failed social-link media fetch on the source. */
export const markSourceMediaFailed = mutation({
  args: { sourceId: v.id("videoSources"), errorMessage: v.string() },
  handler: async (ctx, { sourceId, errorMessage }) => {
    await ctx.db.patch(sourceId, {
      mediaStatus: "failed" as const,
      mediaError: errorMessage.slice(0, 500),
    });
  },
});

/** Attach a browser-rendered clip asset to a clip (client delivery). */
export const attachClipAsset = mutation({
  args: {
    clipId: v.id("videoClips"),
    assetStorageId: v.id("_storage"),
    assetBytes: v.number(),
    assetContentType: v.string(),
  },
  handler: async (ctx, { clipId, assetStorageId, assetBytes, assetContentType }) => {
    await ctx.db.patch(clipId, {
      assetStorageId,
      assetBytes,
      assetContentType,
      assetStatus: "ready" as const,
      assetError: undefined,
    });
  },
});

/** Record a failed in-browser clip render. */
export const markClipAssetFailed = mutation({
  args: { clipId: v.id("videoClips"), errorMessage: v.string() },
  handler: async (ctx, { clipId, errorMessage }) => {
    await ctx.db.patch(clipId, {
      assetStatus: "failed" as const,
      assetError: errorMessage.slice(0, 500),
    });
  },
});

/**
 * Create (or return) the capability token for a clip's share page.
 * 128-bit random hex; idempotent so re-opening share reuses the same link.
 */
export const ensureShareToken = mutation({
  args: { clipId: v.id("videoClips") },
  handler: async (ctx, { clipId }) => {
    const clip = await ctx.db.get(clipId);
    if (!clip) throw new Error("Clip not found");
    if (clip.shareToken) return clip.shareToken;
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const token = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    await ctx.db.patch(clipId, { shareToken: token });
    return token;
  },
});

/**
 * Public, unauthenticated data for the share page — safe subset only.
 * Resolution requires the clip's 128-bit capability token, unguessable by
 * enumeration; no user identity or other fields are exposed.
 */
export const getClipByShareToken = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    if (!token || token.length < 16) return null;
    const clip = await ctx.db
      .query("videoClips")
      .withIndex("by_share_token", (q) => q.eq("shareToken", token))
      .unique();
    if (!clip) return null;
    return {
      title: clip.title,
      caption: clip.caption,
      hashtags: clip.hashtags,
      targetPlatform: clip.targetPlatform,
      aspectRatio: clip.aspectRatio,
      startSec: clip.startSec,
      endSec: clip.endSec,
      assetStatus: clip.assetStatus ?? "none",
      assetContentType: clip.assetContentType,
    };
  },
});

/**
 * Resolve the playable URL for a clip's source media.
 * Prefers the stored copy in NoirOps storage; falls back to the original
 * platform media URL when the video could not be fetched server-side.
 */
export const getClipMediaUrl = query({
  args: { clipId: v.id("videoClips") },
  handler: async (ctx, { clipId }) => {
    const clip = await ctx.db.get(clipId);
    if (!clip) throw new Error("Clip not found");
    const source = await ctx.db.get(clip.sourceId);
    if (!source) throw new Error("Source not found");
    if (source.mediaStorageId) {
      const url = await ctx.storage.getUrl(source.mediaStorageId);
      if (url) {
        return { url, origin: "noirops" as const, contentType: source.mediaContentType };
      }
    }
    if (source.mediaUrl) {
      return { url: source.mediaUrl, origin: "platform" as const, contentType: undefined };
    }
    return null;
  },
});

// ── Internals (used by the clipping/transcription actions) ──

export const markSourceReadyInternal = internalMutation({
  args: {
    sourceId: v.id("videoSources"),
    durationSec: v.optional(v.number()),
    transcriptText: v.optional(v.string()),
    transcriptFormat: v.optional(v.string()),
    transcriptWordCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sourceId, ...patch } = args;
    await ctx.db.patch(sourceId, {
      ...patch,
      status: "ready" as const,
      errorMessage: undefined,
    });
  },
});

export const markSourceFailedInternal = internalMutation({
  args: { sourceId: v.id("videoSources"), errorMessage: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sourceId, {
      status: "failed" as const,
      errorMessage: args.errorMessage.slice(0, 500),
    });
  },
});

/** Internal twin of markSourceMediaFailed for actions. */
export const markSourceMediaFailedInternal = internalMutation({
  args: { sourceId: v.id("videoSources"), errorMessage: v.string() },
  handler: async (ctx, { sourceId, errorMessage }) => {
    await ctx.db.patch(sourceId, {
      mediaStatus: "failed" as const,
      mediaError: errorMessage.slice(0, 500),
    });
  },
});

export const patchSourceMetaInternal = internalMutation({
  args: {
    sourceId: v.id("videoSources"),
    title: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    authorName: v.optional(v.string()),
    durationSec: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sourceId, ...patch } = args;
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    );
    if (Object.keys(clean).length > 0) {
      await ctx.db.patch(sourceId, clean);
    }
  },
});

export const patchSourceMediaInternal = internalMutation({
  args: {
    sourceId: v.id("videoSources"),
    mediaUrl: v.optional(v.string()),
    mediaBytes: v.optional(v.number()),
    mediaContentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { sourceId, ...patch } = args;
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined && value !== null && value !== ""),
    );
    if (Object.keys(clean).length > 0) {
      await ctx.db.patch(sourceId, clean);
    }
  },
});

export const saveClipsInternal = internalMutation({
  args: {
    sourceId: v.id("videoSources"),
    clips: v.array(
      v.object({
        title: v.string(),
        startSec: v.number(),
        endSec: v.number(),
        score: v.number(),
        momentType: v.optional(v.string()),
        hook: v.optional(v.string()),
        reason: v.optional(v.string()),
        transcriptExcerpt: v.optional(v.string()),
        caption: v.optional(v.string()),
        hashtags: v.optional(v.array(v.string())),
        targetPlatform: v.optional(v.string()),
        aspectRatio: v.optional(v.string()),
        edits: v.optional(v.any()),
        transitions: v.optional(v.any()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.sourceId);
    if (!source) throw new Error("Source not found");
    const ids: string[] = [];
    for (const clip of args.clips) {
      ids.push(
        await ctx.db.insert("videoClips", {
          ...clip,
          userId: source.userId,
          sourceId: args.sourceId,
          status: "suggested" as const,
        }),
      );
    }
    return ids;
  },
});
