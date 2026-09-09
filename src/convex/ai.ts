"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const VLY_KEY = process.env.VLY_INTEGRATION_KEY;
const VLY_BASE = process.env.VLY_INTEGRATION_BASE_URL || "https://integrations.freebuff.com";

async function callAI(messages: { role: string; content: string }[], temperature = 0.7, maxTokens = 1500) {
  if (!VLY_KEY) {
    throw new Error("AI service not configured. Please add VLY_INTEGRATION_KEY to your environment.");
  }

  const res = await fetch(`${VLY_BASE}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${VLY_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`AI service error (${res.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

const PLATFORM_GUIDELINES: Record<string, string> = {
  instagram:
    "Instagram posts should be visually descriptive, use 3-5 relevant hashtags, include a strong call-to-action, and keep captions concise but engaging. Use line breaks for readability. Max 2200 characters.",
  twitter:
    "Twitter/X posts should be punchy, direct, and under 280 characters. Use threads for longer content. Include 1-2 relevant hashtags. Use hooks to grab attention in the first line.",
  linkedin:
    "LinkedIn posts should be professional yet personable. Use storytelling. Start with a hook. Keep paragraphs short. No hashtags in the body (add 3-5 at the end). Max 3000 characters.",
  tiktok:
    "TikTok content should be casual, trend-aware, and hook-driven. Start with a bold statement or question. Use trending formats. Keep copy short and energetic.",
  youtube:
    "YouTube content should be informative, engaging, and use clear structure. Use timestamps for long-form. Create compelling titles and descriptions with relevant keywords.",
  facebook:
    "Facebook posts should be conversational and community-oriented. Ask questions to drive engagement. Keep under 80 characters for best reach. Use storytelling.",
};

const SYSTEM_PROMPT = `You are NoirOps AI, an expert social media content strategist and copywriter. You create high-quality, platform-optimized content for creators, entrepreneurs, and businesses.

Key principles:
- Write authentic, non-generic content
- Match the specified platform's best practices
- Adapt tone and style to the user's brand voice
- Create content that drives engagement
- Be specific and actionable, not vague
- Never fabricate statistics, awards, or testimonials
- Always provide value to the reader

Output ONLY the content itself. No explanations, no labels, no meta-commentary.`;

export const generateContent = action({
  args: {
    topic: v.string(),
    platform: v.optional(v.string()),
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
    goal: v.optional(v.string()),
    contentType: v.optional(v.string()),
    brandVoiceContext: v.optional(v.string()),
    additionalContext: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const platformGuide = args.platform
      ? PLATFORM_GUIDELINES[args.platform.toLowerCase()] || ""
      : "";

    let userPrompt = `Create ${args.contentType || "social media content"} about: ${args.topic}`;

    if (args.platform) userPrompt += `\nPlatform: ${args.platform}`;
    if (args.audience) userPrompt += `\nTarget audience: ${args.audience}`;
    if (args.tone) userPrompt += `\nTone: ${args.tone}`;
    if (args.goal) userPrompt += `\nGoal: ${args.goal}`;
    if (args.brandVoiceContext) userPrompt += `\nBrand voice: ${args.brandVoiceContext}`;
    if (args.additionalContext) userPrompt += `\nAdditional context: ${args.additionalContext}`;
    if (platformGuide) userPrompt += `\n\nPlatform guidelines:\n${platformGuide}`;

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    const result = await callAI(messages);
    return { content: result, platform: args.platform || "general" };
  },
});

export const generateMultipleIdeas = action({
  args: {
    topic: v.string(),
    platform: v.optional(v.string()),
    count: v.number(),
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const messages = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nGenerate ${args.count} distinct content ideas. Format each as a numbered item with a short title and 1-2 sentence description. Be specific and creative.`,
      },
      {
        role: "user",
        content: `Generate ${args.count} content ideas about: ${args.topic}${args.platform ? ` for ${args.platform}` : ""}${args.audience ? ` targeting ${args.audience}` : ""}${args.tone ? ` with a ${args.tone} tone` : ""}`,
      },
    ];

    const result = await callAI(messages, 0.9);
    return { ideas: result };
  },
});

export const generateCalendar = action({
  args: {
    topic: v.string(),
    platform: v.optional(v.string()),
    days: v.number(),
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const messages = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nCreate a ${args.days}-day content calendar. For each day, provide a date-relative label (Day 1, Day 2, etc.), a content topic/title, content type, and a brief description of what to post. Format as a numbered list.`,
      },
      {
        role: "user",
        content: `Create a ${args.days}-day content calendar about: ${args.topic}${args.platform ? ` for ${args.platform}` : ""}${args.audience ? ` targeting ${args.audience}` : ""}`,
      },
    ];

    const result = await callAI(messages, 0.8);
    return { calendar: result };
  },
});

export const analyzeContent = action({
  args: {
    content: v.string(),
    platform: v.optional(v.string()),
    goal: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const messages = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nAnalyze the provided content and give feedback on:\n1. Strengths (2-3 points)\n2. Areas for improvement (2-3 points)\n3. Platform optimization tips\n4. Suggested improvements\nBe specific and actionable.`,
      },
      {
        role: "user",
        content: `Analyze this content:${args.platform ? ` (Platform: ${args.platform})` : ""}${args.goal ? ` (Goal: ${args.goal})` : ""}\n\n---\n${args.content}`,
      },
    ];

    const result = await callAI(messages, 0.5);
    return { analysis: result };
  },
});

export const repurposeContent = action({
  args: {
    content: v.string(),
    targetPlatform: v.string(),
    audience: v.optional(v.string()),
    tone: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const targetGuide =
      PLATFORM_GUIDELINES[args.targetPlatform.toLowerCase()] || "";

    const messages = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\nRepurpose the provided content for ${args.targetPlatform}. Adapt the format, tone, length, and style to match the platform's best practices while preserving the core message.\n\nPlatform guidelines:\n${targetGuide}`,
      },
      {
        role: "user",
        content: `Repurpose this content for ${args.targetPlatform}:${args.audience ? ` Target audience: ${args.audience}` : ""}${args.tone ? ` Tone: ${args.tone}` : ""}\n\n---\n${args.content}`,
      },
    ];

    const result = await callAI(messages, 0.7);
    return { content: result, platform: args.targetPlatform };
  },
});
