/**
 * VLY integration gateway resolution, shared by all server-side fetches.
 *
 * Deployments provisioned with `VLY_INTEGRATION_BASE_URL` pointing at
 * `integrations.freebuff.com` are broken: that subdomain does not exist in
 * DNS worldwide (NXDOMAIN via Cloudflare's resolvers), so every outbound
 * fetch fails with `EBUSY` (the runtime's rendition of `ENOTFOUND`). The
 * real gateway — per the official `@vly-ai/integrations` package — is
 * `https://integrations.vly.ai`. A known-dead base URL is therefore ignored
 * in favor of the real default; genuinely custom URLs still win.
 */

const DEAD_BASES = new Set([
  "https://integrations.freebuff.com",
  "http://integrations.freebuff.com",
  "https://integrations.freebuff.com/",
  "http://integrations.freebuff.com/",
]);

const REAL_DEFAULT = "https://integrations.vly.ai";

export function vlyGatewayBase(): string {
  const raw = (process.env.VLY_INTEGRATION_BASE_URL || "").trim();
  if (raw && !DEAD_BASES.has(raw.toLowerCase())) return raw;
  return REAL_DEFAULT;
}

export function vlyGatewayKey(): string | undefined {
  return process.env.VLY_INTEGRATION_KEY;
}

/**
 * Direct OpenRouter endpoint (validated working from the Convex runtime with
 * the deployment-provisioned key). The integration gateway exposes no
 * Whisper/audio route and its LLM route rejects this deployment's token, so
 * AI + transcription calls go straight to OpenRouter.
 */
export const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

/**
 * Deployment AI key: the platform-provisioned OpenRouter key first, falling
 * back to the integration key (same value in current deployments).
 */
export function aiGatewayKey(): string | undefined {
  return process.env.AI_API_KEY || process.env.VLY_INTEGRATION_KEY;
}
