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

    // ── AI Video Clipping ────────────────────────────────
    // A long-form video the user submitted for AI clipping: a social link,
    // an uploaded file (via Convex storage), or a pasted transcript.
    videoSources: defineTable({
      userId: v.string(),
      title: v.string(),
      sourceKind: v.union(
        v.literal("link"),
        v.literal("upload"),
        v.literal("transcript"),
      ),
      url: v.optional(v.string()),
      platform: v.optional(v.string()),
      videoId: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      // Local-upload transcription: per-chunk WAV parts stored in Convex
      // storage while transcription runs (cleaned up afterwards).
      audioStorageIds: v.optional(v.array(v.id("_storage"))),
      fileSizeBytes: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      // Platform-link media ingestion: the actual video file resolved from a
      // social link and copied into NoirOps storage so clips are delivered
      // from our own app, not the origin platform.
      mediaUrl: v.optional(v.string()),
      mediaStorageId: v.optional(v.id("_storage")),
      mediaBytes: v.optional(v.number()),
      mediaContentType: v.optional(v.string()),
      mediaStatus: v.optional(
        v.union(v.literal("none"), v.literal("stored"), v.literal("failed")),
      ),
      mediaError: v.optional(v.string()),
      // Platform-link enrichment (oEmbed / captions).
      thumbnailUrl: v.optional(v.string()),
      authorName: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("ready"),
        v.literal("failed"),
      ),
      durationSec: v.optional(v.number()),
      transcriptText: v.optional(v.string()),
      transcriptFormat: v.optional(v.string()),
      transcriptWordCount: v.optional(v.number()),
      errorMessage: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_user_status", ["userId", "status"]),

    // One AI-suggested short-form clip cut from a videoSources document.
    videoClips: defineTable({
      userId: v.string(),
      sourceId: v.id("videoSources"),
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
      status: v.union(
        v.literal("suggested"),
        v.literal("accepted"),
        v.literal("exported"),
        v.literal("dismissed"),
      ),
      // Rendered clip asset (cut in the browser from the source media, stored
      // in NoirOps) + a capability token for the public client share page.
      assetStorageId: v.optional(v.id("_storage")),
      assetBytes: v.optional(v.number()),
      assetContentType: v.optional(v.string()),
      assetStatus: v.optional(
        v.union(v.literal("none"), v.literal("ready"), v.literal("failed")),
      ),
      assetError: v.optional(v.string()),
      shareToken: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_source", ["sourceId"])
      .index("by_share_token", ["shareToken"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
