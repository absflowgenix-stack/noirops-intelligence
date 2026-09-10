/**
 * Client-side stub for `@ai-sdk/openai-compatible`.
 *
 * See ai-client-stub.ts for the rationale: this satisfies the named import
 * from `@vly-ai/integrations` so the heavy provider SDK never enters the
 * client bundle. Never called in the browser.
 */

export function createOpenAICompatible(): unknown {
  return () => ({});
}