/**
 * Client-side stub for the `ai` package (Vercel AI SDK).
 *
 * `vlyPlugin()` injects `import '@vly-ai/integrations';` into every page, and
 * that module imports `generateText`/`streamText` from `ai` at the top level.
 * Left alone, that dragged the whole AI SDK + zod graph into the client bundle
 * and blew past the production build deadline in this runtime. No browser code
 * instantiates VlyAI (AI runs in Convex "use node" actions, server-side), so
 * these tiny stubs satisfy the named imports and let Rollup drop the rest.
 * They are never called in the browser.
 *
 * NOTE: Convex/server code is bundled separately and does NOT go through this
 * config, so server-side AI imports resolve to the real `ai` package.
 */

// Minimal structural types so the stub is dependency-free. The real SDK's
// richer signatures don't matter here because these are never invoked client-side.
type Prompt = { prompt?: string; messages?: unknown[]; [key: string]: unknown };
type TextResult = { text: string; [key: string]: unknown };
type StreamResult = { textStream: AsyncIterable<string>; [key: string]: unknown };

export async function generateText(_options: Prompt): Promise<TextResult> {
  throw new Error("ai stub: generateText is not available in the browser build");
}

export function streamText(_options: Prompt): StreamResult {
  // The body only runs on first iteration, so the error surfaces at use —
  // never in practice, since nothing in the browser calls this.
  async function* stream(): AsyncGenerator<string> {
    throw new Error("ai stub: streamText is not available in the browser build");
  }
  return { textStream: stream() };
}
