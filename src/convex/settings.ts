import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    return existing ?? null;
  },
});

export const upsert = mutation({
  args: {
    userId: v.string(),
    defaultPlatform: v.optional(v.string()),
    defaultTone: v.optional(v.string()),
    defaultAudience: v.optional(v.string()),
    defaultBrandVoiceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }
    return await ctx.db.insert("settings", args);
  },
});
