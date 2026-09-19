import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const logEvent = mutation({
  args: {
    userId: v.string(),
    eventType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("analyticsEvents", args);
  },
});

export const getUserStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    const last7Days = events.filter((e) => e._creationTime > sevenDaysAgo);
    const last30Days = events.filter((e) => e._creationTime > thirtyDaysAgo);

    const byType: Record<string, number> = {};
    for (const e of last30Days) {
      byType[e.eventType] = (byType[e.eventType] || 0) + 1;
    }

    // Daily activity for last 7 days
    const dailyActivity: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - (i + 1) * 24 * 60 * 60 * 1000;
      const dayEnd = now - i * 24 * 60 * 60 * 1000;
      const dateStr = new Date(dayStart).toISOString().split("T")[0];
      dailyActivity.push({
        date: dateStr,
        count: events.filter(
          (e) => e._creationTime > dayStart && e._creationTime <= dayEnd,
        ).length,
      });
    }

    return {
      totalEvents: events.length,
      last7Days: last7Days.length,
      last30Days: last30Days.length,
      byType,
      dailyActivity,
      generations: byType["generation"] || 0,
      saves: byType["save"] || 0,
      edits: byType["edit"] || 0,
      calendarItems: byType["calendar_item"] || 0,
    };
  },
});

export const getRecentActivity = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analyticsEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit ?? 10);
  },
});
