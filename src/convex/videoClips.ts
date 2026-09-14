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

// ── Internals (used by the videoClipping action) ─────────

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
