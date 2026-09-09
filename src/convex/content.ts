import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {
    userId: v.string(),
    platform: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results;
    if (args.platform && args.status) {
      results = await ctx.db
        .query("content")
        .withIndex("by_user_platform", (q) =>
          q.eq("userId", args.userId).eq("platform", args.platform!)
        )
        .order("desc")
        .collect();
      results = results.filter((c) => c.status === args.status);
    } else if (args.platform) {
      results = await ctx.db
        .query("content")
        .withIndex("by_user_platform", (q) =>
          q.eq("userId", args.userId).eq("platform", args.platform!)
        )
        .order("desc")
        .collect();
    } else if (args.status) {
      results = await ctx.db
        .query("content")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", args.userId).eq("status", args.status as "draft" | "scheduled" | "published" | "failed")
        )
        .order("desc")
        .collect();
    } else {
      results = await ctx.db
        .query("content")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    }
    return results.slice(0, args.limit ?? 50);
  },
});

export const get = query({
  args: { id: v.id("content") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    title: v.optional(v.string()),
    body: v.string(),
    platform: v.optional(v.string()),
    contentType: v.optional(v.string()),
    tone: v.optional(v.string()),
    audience: v.optional(v.string()),
    goal: v.optional(v.string()),
    hashtags: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("failed"),
    ),
    scheduledFor: v.optional(v.number()),
    generationParams: v.optional(v.any()),
    sourceContentId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("content", {
      ...args,
      isRegenerated: false,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("content"),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    platform: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("failed"),
    )),
    scheduledFor: v.optional(v.number()),
    hashtags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("content") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const duplicate = mutation({
  args: { id: v.id("content") },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.id);
    if (!original) throw new Error("Content not found");
    const { _id, _creationTime, ...rest } = original;
    return await ctx.db.insert("content", {
      ...rest,
      status: "draft",
    });
  },
});

export const stats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("content")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recent = all.filter((c) => c._creationTime > thirtyDaysAgo);
    return {
      total: all.length,
      drafts: all.filter((c) => c.status === "draft").length,
      scheduled: all.filter((c) => c.status === "scheduled").length,
      published: all.filter((c) => c.status === "published").length,
      failed: all.filter((c) => c.status === "failed").length,
      last30Days: recent.length,
      platforms: recent.reduce(
        (acc, c) => {
          const p = c.platform || "Other";
          acc[p] = (acc[p] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    };
  },
});
