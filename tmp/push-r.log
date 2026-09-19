/**
 * Client-side stub for the `ai` package (Vercel AI SDK).
 *
 * The `ai` and `@ai-sdk/openai-compatible` specifiers are aliased here via
 * vite.config.ts so the heavy SDK + zod graph never enters the client bundle —
 * the template notes that bundling it blew past the production build deadline.
 * `@vly-ai/integrations` imports these names, so the stub must satisfy the
 * named imports. These functions are never called in the browser; all real AI
 * work runs server-side in Convex actions.
 */

export async function generateText(): Promise<never> {
  throw new Error("ai is server-only");
}

export function streamText(): never {
  throw new Error("ai is server-only");
}
