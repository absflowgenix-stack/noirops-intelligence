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

/** Short-lived upload URL for one audio chunk (client POSTs the WAV blob). */
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

/** Temporary URL for one stored audio chunk (actions fetch it to transcribe). */
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
