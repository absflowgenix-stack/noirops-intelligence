import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const submit = mutation({
  args: {
    userId: v.optional(v.string()),
    category: v.union(
      v.literal("bug"),
      v.literal("feature"),
      v.literal("general"),
      v.literal("experience"),
    ),
    message: v.string(),
    rating: v.optional(v.number()),
    page: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.message.length > 2000) {
      throw new Error("Feedback message must be 2000 characters or fewer.");
    }
    return await ctx.db.insert("feedback", args);
  },
});

export const listAll = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
