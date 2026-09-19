import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brandVoices")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("brandVoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    tone: v.optional(v.string()),
    personality: v.optional(v.string()),
    coreValues: v.optional(v.array(v.string())),
    productsServices: v.optional(v.string()),
    preferredVocabulary: v.optional(v.array(v.string())),
    wordsToAvoid: v.optional(v.array(v.string())),
    exampleContent: v.optional(v.string()),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    if (args.isDefault) {
      const existing = await ctx.db
        .query("brandVoices")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();
      for (const voice of existing) {
        await ctx.db.patch(voice._id, { isDefault: false });
      }
    }
    return await ctx.db.insert("brandVoices", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("brandVoices"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    industry: v.optional(v.string()),
    targetAudience: v.optional(v.string()),
    tone: v.optional(v.string()),
    personality: v.optional(v.string()),
    coreValues: v.optional(v.array(v.string())),
    productsServices: v.optional(v.string()),
    preferredVocabulary: v.optional(v.array(v.string())),
    wordsToAvoid: v.optional(v.array(v.string())),
    exampleContent: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    if (fields.isDefault) {
      const voice = await ctx.db.get(id);
      if (!voice) throw new Error("Brand voice not found");
      const existing = await ctx.db
        .query("brandVoices")
        .withIndex("by_user", (q) => q.eq("userId", voice.userId))
        .collect();
      for (const v of existing) {
        if (v._id !== id) {
          await ctx.db.patch(v._id, { isDefault: false });
        }
      }
    }
    await ctx.db.patch(id, fields);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("brandVoices") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});