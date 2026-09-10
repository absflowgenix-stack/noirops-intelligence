/**
 * Client-side stub for the Vercel AI SDK (`ai`).
 *
 * `@vly-ai/integrations` imports `ai` at module top level, which drags the
 * entire AI SDK + zod module graph into every client bundle and blows past
 * the production build deadline in this browser runtime. The client never
 * instantiates `VlyAI` (only Convex "use node" actions do, on the server),
 * so these stubs are never called — they only need to satisfy the named
 * imports so Rollup can tree-shake the rest.
 */

export async function generateText(): Promise<unknown> {
  return {
    text: "",
    finishReason: "stop",
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
  };
}

export async function streamText(): Promise<unknown> {
  return {
    textStream: (async function* () {})(),
    usage: Promise.resolve({
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    }),
  };
}