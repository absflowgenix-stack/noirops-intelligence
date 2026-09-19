"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { vlyGatewayBase } from "./gateway";

/**
 * TEMPORARY diagnostic: fires one small request of each shape through the
 * runtime's outbound bridge and reports exactly which shapes fail. Remove
 * once the EBUSY cause is pinned down.
 */

function vlyBase(): string {
  return vlyGatewayBase();
}

function vlyKey(): string | undefined {
  return process.env.VLY_INTEGRATION_KEY;
}

function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err).slice(0, 200);
  const cause = (err as { cause?: unknown }).cause;
  let causeText = "";
  if (cause !== undefined && cause !== null) {
    if (cause instanceof Error) {
      const code = (cause as { code?: string }).code;
      causeText = code ? `${code}: ${cause.message}` : cause.message;
    } else {
      causeText = String(cause);
    }
  }
  return causeText ? `${err.message} (${causeText})` : err.message;
}

interface ProbeResult {
  name: string;
  ok: boolean;
  detail: string;
}

async function probe(
  name: string,
  fn: () => Promise<string>,
): Promise<ProbeResult> {
  try {
    return { name, ok: true, detail: await fn() };
  } catch (err) {
    return { name, ok: false, detail: describeError(err).slice(0, 300) };
  }
}

function textOrThrow(res: Response): Promise<string> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

/** Zero-filled pseudo-WAV of `seconds` at 16 kHz mono 16-bit (~32 KB/s). */
function fakeWav(seconds: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(44 + Math.round(seconds * 32000)));
  new TextEncoder().encodeInto("RIFF....WAVEfmt ", bytes);
  return bytes;
}

function multipartBody(bytes: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder();
  const B = "----noirops-probe-boundary";
  const head = enc.encode(
    `--${B}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n` +
      `--${B}\r\nContent-Disposition: form-data; name="file"; filename="a.wav"\r\nContent-Type: audio/wav\r\n\r\n`,
  );
  const tail = enc.encode(`\r\n--${B}--\r\n`);
  const out = new Uint8Array(new ArrayBuffer(head.byteLength + bytes.byteLength + tail.byteLength));
  out.set(head, 0);
  out.set(bytes, head.byteLength);
  out.set(tail, head.byteLength + bytes.byteLength);
  return out;
}

export const probeEgress = action({
  args: {},
  handler: async (): Promise<ProbeResult[]> => {
    const base = vlyBase();
    const key = vlyKey() ?? "";
    const auth = { Authorization: `Bearer ${key}` };

    const results: ProbeResult[] = [];

    // 1. Plain GET to the gateway — does ANY request cross the bridge?
    results.push(
      await probe("gateway_get", async () =>
        textOrThrow(await fetch(`${base}/`, { signal: AbortSignal.timeout(15000) })).then(
          () => "200 OK",
        ),
      ),
    );

    // 2. GET to a well-known external host — is general egress fine?
    results.push(
      await probe("external_get", async () =>
        textOrThrow(await fetch("https://api.github.com/zen", { signal: AbortSignal.timeout(15000) })).then(
          (t) => `200: ${t.slice(0, 40)}`,
        ),
      ),
    );

    // 3. Tiny JSON POST to the gateway (same shape ai.ts uses).
    results.push(
      await probe("gateway_json_post", async () => {
        const res = await fetch(`${base}/v1/chat/completions`, {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({ model: "gpt-4o-mini", max_tokens: 1, messages: [{ role: "user", content: "ping" }] }),
          signal: AbortSignal.timeout(20000),
        });
        return `HTTP ${res.status}`;
      }),
    );

    // 4. Tiny multipart POST (~2 KB) to the transcription endpoint.
    results.push(
      await probe("gateway_multipart_2k", async () => {
        const body = multipartBody(fakeWav(0.05));
        const res = await fetch(`${base}/v1/audio/transcriptions`, {
          method: "POST",
          headers: { ...auth, "Content-Type": `multipart/form-data; boundary=----noirops-probe-boundary` },
          body,
          signal: AbortSignal.timeout(20000),
        });
        return `HTTP ${res.status}`;
      }),
    );

    // 5. ~800 KB multipart POST — the size a real 25s chunk produces.
    results.push(
      await probe("gateway_multipart_800k", async () => {
        const body = multipartBody(fakeWav(25));
        const res = await fetch(`${base}/v1/audio/transcriptions`, {
          method: "POST",
          headers: { ...auth, "Content-Type": `multipart/form-data; boundary=----noirops-probe-boundary` },
          body,
          signal: AbortSignal.timeout(30000),
        });
        return `HTTP ${res.status}`;
      }),
    );

    // 6. Tiny raw binary (non-multipart) POST — is it binary bodies at all?
    results.push(
      await probe("gateway_binary_2k", async () => {
        const res = await fetch(`${base}/v1/audio/transcriptions`, {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/octet-stream" },
          body: fakeWav(0.05),
          signal: AbortSignal.timeout(20000),
        });
        return `HTTP ${res.status}`;
      }),
    );

    // 7. Correct chat path with the package's default model.
    results.push(
      await probe("llm_chat_gpt5", async () => {
        const res = await fetch(`${base}/v1/llm/chat/completions`, {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-5",
            max_tokens: 300,
            messages: [{ role: "user", content: "Say OK" }],
          }),
          signal: AbortSignal.timeout(60000),
        });
        const t = await res.text();
        return `HTTP ${res.status}: ${t.slice(0, 150)}`;
      }),
    );

    // 8. Audio via OpenAI "file" content part (data URI) on gemini-flash.
    results.push(
      await probe("llm_audio_file_gemini", async () => {
        const wav = fakeWav(0.4);
        let binary = "";
        for (const b of wav) binary += String.fromCharCode(b);
        const dataUri = `data:audio/wav;base64,${btoa(binary)}`;
        const res = await fetch(`${base}/v1/llm/chat/completions`, {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Transcribe this audio. Reply with the words heard only." },
                  { type: "file", file: { filename: "audio.wav", file_data: dataUri } },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(60000),
        });
        const t = await res.text();
        return `HTTP ${res.status}: ${t.slice(0, 200)}`;
      }),
    );

    // 9. Same file-part audio on gpt-4o-audio-preview.
    results.push(
      await probe("llm_audio_file_gpt4o", async () => {
        const wav = fakeWav(0.4);
        let binary = "";
        for (const b of wav) binary += String.fromCharCode(b);
        const dataUri = `data:audio/wav;base64,${btoa(binary)}`;
        const res = await fetch(`${base}/v1/llm/chat/completions`, {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-audio-preview",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Transcribe this audio. Reply with the words heard only." },
                  { type: "file", file: { filename: "audio.wav", file_data: dataUri } },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(60000),
        });
        const t = await res.text();
        return `HTTP ${res.status}: ${t.slice(0, 200)}`;
      }),
    );

    // 10. Direct OpenRouter text call with the deployment's AI_API_KEY.
    results.push(
      await probe("openrouter_text", async () => {
        const key = process.env.AI_API_KEY || "";
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            max_tokens: 10,
            messages: [{ role: "user", content: "Say OK" }],
          }),
          signal: AbortSignal.timeout(60000),
        });
        const t = await res.text();
        return `HTTP ${res.status}: ${t.slice(0, 150)}`;
      }),
    );

    // 11. Direct OpenRouter WITH audio as input_audio part (their schema).
    results.push(
      await probe("openrouter_audio", async () => {
        const key = process.env.AI_API_KEY || "";
        const wav = fakeWav(0.4);
        let binary = "";
        for (const b of wav) binary += String.fromCharCode(b);
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: "Transcribe this audio. Reply with the words heard only." },
                  { type: "input_audio", input_audio: { data: btoa(binary), format: "wav" } },
                ],
              },
            ],
          }),
          signal: AbortSignal.timeout(60000),
        });
        const t = await res.text();
        return `HTTP ${res.status}: ${t.slice(0, 300)}`;
      }),
    );

    // 12. Gateway auth header variants (x-api-key / raw token).
    for (const [label, headers] of [
      ["x-api-key", { "x-api-key": key }] as const,
      ["raw-bearer", { Authorization: key }] as const,
    ]) {
      results.push(
        await probe(`gateway_auth_${label}`, async () => {
          const res = await fetch(`${base}/v1/llm/chat/completions`, {
            method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "gpt-5",
              max_tokens: 10,
              messages: [{ role: "user", content: "Say OK" }],
            }),
            signal: AbortSignal.timeout(60000),
          });
          const t = await res.text();
          return `HTTP ${res.status}: ${t.slice(0, 120)}`;
        }),
      );
    }

    return results;
  },
});

// Satisfy the linter that `v` is used (args schema kept for symmetry).
void v;
