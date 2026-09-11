import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    // ── Content ──────────────────────────────────────────
    content: defineTable({
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
      publishedAt: v.optional(v.number()),
      sourceContentId: v.optional(v.string()),
      isRegenerated: v.optional(v.boolean()),
      generationParams: v.optional(v.any()),
    })
      .index("by_user", ["userId"])
      .index("by_user_status", ["userId", "status"])
      .index("by_user_platform", ["userId", "platform"])
      .index("by_scheduled", ["userId", "scheduledFor"]),

    // ── Calendar Events ──────────────────────────────────
    calendarEvents: defineTable({
      userId: v.string(),
      contentId: v.optional(v.string()),
      title: v.string(),
      description: v.optional(v.string()),
      date: v.string(),
      time: v.optional(v.string()),
      platform: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("scheduled"),
        v.literal("published"),
        v.literal("failed"),
      ),
    })
      .index("by_user_date", ["userId", "date"])
      .index("by_user", ["userId"]),

    // ── Brand Voices ─────────────────────────────────────
    brandVoices: defineTable({
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
    }).index("by_user", ["userId"]),

    // ── Analytics ────────────────────────────────────────
    // No index on _creationTime: Convex rejects custom indexes that include it
    // (it ships a built-in `by_creation_time` index, and the push fails with
    // IndexFieldsContainCreationTime), and the queries below only need the
    // user-scoped indexes.
    analyticsEvents: defineTable({
      userId: v.string(),
      eventType: v.string(),
      metadata: v.optional(v.any()),
    })
      .index("by_user", ["userId"])
      .index("by_user_type", ["userId", "eventType"]),

    // ── Feedback ─────────────────────────────────────────
    feedback: defineTable({
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
    }).index("by_user", ["userId"]),

    // ── Settings ─────────────────────────────────────────
    settings: defineTable({
      userId: v.string(),
      defaultPlatform: v.optional(v.string()),
      defaultTone: v.optional(v.string()),
      defaultAudience: v.optional(v.string()),
      defaultBrandVoiceId: v.optional(v.string()),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
