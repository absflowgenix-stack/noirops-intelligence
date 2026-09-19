/**
 * Targeted verification suite for the transcription pipeline changes.
 *
 * Covers the modules touched by the recent fixes:
 *  - src/lib/audio.ts      (EBUSY fix: 25 s ≈ <1 MB WAV chunks per request)
 *  - src/lib/timed-text.ts (chunk timestamp rebasing + SRT/VTT building)
 *  - src/lib/transcript.ts (SRT/VTT/plain parsing that feeds clip analysis)
 *
 * Pure TS, zero dependencies — runs on Node 24's native type stripping:
 *   node scripts/tests-targeted.mts
 *
 * Tooling only: lives outside the app/ts build graphs by design.
 */

import {
  AUDIO_CHUNK_SECONDS,
  AUDIO_CHUNK_OVERLAP,
  resampleTo16kMono,
  findSilenceSplit,
  encodeWavBlob,
  chunkAudioSamples,
} from "../src/lib/audio.ts";
import {
  toSrtTimestamp,
  toVttTimestamp,
  timestampToSeconds,
  offsetTimedText,
  buildSrtFromSegments,
  buildVttFromSegments,
  youtubeJson3ToSegments,
} from "../src/lib/timed-text.ts";
import {
  parseTranscript,
  transcriptFormat,
  transcriptForPrompt,
  transcriptToPlain,
  excerptForRange,
} from "../src/lib/transcript.ts";

// ---------------------------------------------------------------- harness --
let passed = 0;
const failures: string[] = [];

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (err) {
    failures.push(name);
    console.log(`FAIL  ${name}: ${(err as Error).message}`);
  }
}

function eq(actual: unknown, expected: unknown, msg = ""): void {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${msg} expected ${b}, got ${a}`);
}

function ok(cond: unknown, msg: string): void {
  if (!cond) throw new Error(msg);
}

function near(actual: number, expected: number, eps: number, msg = ""): void {
  if (!(Math.abs(actual - expected) <= eps)) {
    throw new Error(`${msg} expected ~${expected} (±${eps}), got ${actual}`);
  }
}

/** Decode the PCM data of a WAV produced by encodeWavBlob back to floats. */
function decodeWavPcm(buf: ArrayBuffer): { sampleRate: number; samples: number[] } {
  const v = new DataView(buf);
  const sig = (o: number, len: number) =>
    String.fromCharCode(...new Uint8Array(buf, o, len));
  eq(sig(0, 4), "RIFF", "riff magic:");
  eq(sig(8, 4), "WAVE", "wave magic:");
  eq(sig(36, 4), "data", "data chunk id:");
  const sampleRate = v.getUint32(24, true);
  const dataLen = v.getUint32(40, true);
  const samples: number[] = [];
  for (let i = 0; i < dataLen / 2; i++) {
    samples.push(v.getInt16(44 + i * 2, true) / 32768);
  }
  return { sampleRate, samples };
}

// ------------------------------------------------------------ 1. EBUSY fix --
await test("AUDIO_CHUNK_SECONDS = 25 → every request body stays under 1 MB", () => {
  eq(AUDIO_CHUNK_SECONDS, 25, "chunk seconds:");
  eq(AUDIO_CHUNK_OVERLAP, 1.5, "overlap seconds:");
  // 16 kHz × 16-bit mono. Worst-case chunk: 25 s target + 4 s silence-search
  // window + 1.5 s overlap ≈ 30.5 s ≈ 976 KB — still < 1 MB (the EBUSY bound).
  const worstCaseBytes = (AUDIO_CHUNK_SECONDS + 4 + AUDIO_CHUNK_OVERLAP) * 16000 * 2 + 44;
  ok(worstCaseBytes < 1_000_000, `worst-case chunk is ${worstCaseBytes} B, must be < 1 MB`);
});

await test("chunkAudioSamples: short input → single chunk", () => {
  const samples = new Float32Array(10 * 16000); // 10 s of silence
  const chunks = chunkAudioSamples(samples);
  eq(chunks.length, 1, "chunk count:");
  eq(chunks[0].startSec, 0, "start:");
  near(chunks[0].endSec, 10, 1e-9, "end:");
  ok(chunks[0].blob.size < 1_000_000, "single chunk must stay under 1 MB");
});

await test("chunkAudioSamples: quiet long audio splits on silence with overlap", () => {
  const samples = new Float32Array(52 * 16000); // 52 s of digital silence
  const chunks = chunkAudioSamples(samples);
  ok(chunks.length >= 2, `expected ≥2 chunks, got ${chunks.length}`);
  for (const c of chunks) ok(c.startSec < c.endSec, "chunk must have positive length");
  for (let i = 1; i < chunks.length; i++) {
    ok(chunks[i].startSec > chunks[i - 1].startSec, "starts must be monotonic");
    ok(chunks[i].startSec < chunks[i - 1].endSec, "adjacent chunks must overlap");
  }
  near(chunks[chunks.length - 1].endSec, 52, 0.01, "must cover to the end:");
  for (const c of chunks) {
    ok(c.blob.size < 1_000_000, `chunk blob is ${c.blob.size} B, must stay < 1 MB`);
  }
});

await test("chunkAudioSamples: continuously loud audio still splits (fallback)", () => {
  const samples = new Float32Array(52 * 16000).fill(1); // never quiet
  const chunks = chunkAudioSamples(samples);
  // Fallback split lands exactly on targets: 0→25, 23.5→50, 48.5→52.
  eq(chunks.length, 3, "chunk count:");
  near(chunks[0].startSec, 0, 1e-9, "chunk 0 start:");
  near(chunks[1].startSec, 23.5, 1e-9, "chunk 1 start (25 - overlap):");
  near(chunks[2].startSec, 48.5, 1e-9, "chunk 2 start (50 - overlap):");
  near(chunks[2].endSec, 52, 1e-9, "last chunk end:");
  for (const c of chunks) {
    ok(c.blob.size < 1_000_000, `chunk blob is ${c.blob.size} B, must stay < 1 MB`);
  }
});

await test("findSilenceSplit prefers a quiet point inside the ±4 s window", () => {
  const rate = 16000;
  const samples = new Float32Array(30 * rate).fill(1); // loud everywhere…
  for (let i = 24 * rate; i < samples.length; i++) samples[i] = 0; // …except 24–30 s
  const split = findSilenceSplit(samples, rate, 25);
  ok(split >= 23.9 && split <= 29, `split ${split}s should land in the quiet region (24–29 s)`);
});

await test("resampleTo16kMono: ratio and identity cases", () => {
  const src = new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  const out = resampleTo16kMono(src, 32000); // 32 kHz → 16 kHz
  eq(out.length, 8, "output length (half rate):");
  near(out[1], 2.0, 1e-9, "sample maps to src[2]:");
  near(out[2], 4.0, 1e-9, "sample maps to src[4]:");
  const identity = resampleTo16kMono(src, 16000);
  eq(identity.length, 16, "identity passthrough keeps length:");
  near(identity[15], 15, 1e-9, "identity passthrough keeps values:");
});

await test("encodeWavBlob: valid header and PCM round-trip", async () => {
  const original = [0, 0.25, -0.25, 0.5, -0.5, 1, -1];
  const blob = encodeWavBlob(new Float32Array(original), 16000);
  eq(blob.type, "audio/wav", "mime:");
  eq(blob.size, 44 + original.length * 2, "size:");
  const { sampleRate, samples } = decodeWavPcm(await blob.arrayBuffer());
  eq(sampleRate, 16000, "sample rate:");
  eq(samples.length, original.length, "pcm length:");
  for (let i = 0; i < original.length; i++) {
    near(samples[i], original[i], 2e-4, `sample ${i}:`);
  }
});

// ------------------------------------------------- 2. timed-text (rebasing) --
await test("SRT/VTT timestamp formatting and parsing round-trip", () => {
  eq(toSrtTimestamp(3723.456), "01:02:03,456", "srt stamp:");
  eq(toVttTimestamp(3723.456), "01:02:03.456", "vtt stamp:");
  near(timestampToSeconds("01:02:03,456"), 3723.456, 1e-6, "full srt parse:");
  near(timestampToSeconds("02:03.5"), 123.5, 1e-6, "short mm:ss.mmm parse:");
  ok(Number.isNaN(timestampToSeconds("not a stamp")), "invalid input must yield NaN");
  eq(toSrtTimestamp(timestampToSeconds("01:02:03,456")), "01:02:03,456", "round-trip:");
});

await test("offsetTimedText rebases SRT and VTT cue times (chunk rebasing path)", () => {
  const srt =
    "1\n00:00:01,000 --> 00:00:02,500\nHello\n\n2\n00:00:03,000 --> 00:00:04,000\nWorld\n";
  const shifted = offsetTimedText(srt, 30);
  ok(shifted.includes("00:00:31,000 --> 00:00:32,500"), "first cue shifted:");
  ok(shifted.includes("00:00:33,000 --> 00:00:34,000"), "second cue shifted:");
  ok(shifted.includes("Hello") && shifted.includes("World"), "text preserved:");
  eq(offsetTimedText(srt, 0), srt, "zero offset returns input unchanged:");

  const vtt = "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHi\n";
  const vttShifted = offsetTimedText(vtt, 60);
  ok(vttShifted.startsWith("WEBVTT"), "vtt header preserved:");
  ok(vttShifted.includes("00:01:01.000 --> 00:01:02.000"), "vtt cue shifted with dots:");
});

await test("buildSrtFromSegments / buildVttFromSegments", () => {
  const srt = buildSrtFromSegments([
    { start: 0, end: 2, text: "Alpha" },
    { start: 5, end: 7.5, text: "   " }, // dropped (blank)
    { start: 5, end: 7.5, text: "Beta" },
  ]);
  ok(srt.startsWith("1\n00:00:00,000 --> 00:00:02,000\nAlpha"), "first numbered block:");
  ok(srt.includes("2\n00:00:05,000 --> 00:00:07,500\nBeta"), "blank skipped, numbering compacted:");

  const vtt = buildVttFromSegments([{ start: 1, end: 2, text: "Hi" }]);
  ok(vtt.startsWith("WEBVTT"), "vtt starts with header:");
  ok(vtt.includes("00:00:01.000 --> 00:00:02.000\nHi"), "vtt block content:");
});

await test("youtubeJson3ToSegments: happy path and graceful failures", () => {
  const segs = youtubeJson3ToSegments(
    JSON.stringify({
      events: [
        { tStartMs: 1000, dDurationMs: 2500, segs: [{ utf8: "He" }, { utf8: "llo " }] },
        { tStartMs: 4000, segs: [{ utf8: "Next" }] },
      ],
    }),
  );
  eq(segs.length, 2, "segment count:");
  eq(segs[0], { start: 1, end: 3.5, text: "Hello" }, "first segment:");
  near(segs[1].end, 8, 1e-9, "default 4 s duration applied:");
  eq(youtubeJson3ToSegments("{oops"), [], "invalid JSON:");
  eq(youtubeJson3ToSegments(JSON.stringify({ events: "nope" })), [], "non-array events:");
});

// --------------------------------------------------- 3. transcript parsing --
const SRT = "1\n00:00:01,000 --> 00:00:02,500\nHello world\n\n2\n00:00:03,000 --> 00:00:04,000\nSecond line\n";

await test("parseTranscript: SRT cues, timing and duration", () => {
  const t = parseTranscript(SRT);
  eq(t.cues.length, 2, "cue count:");
  eq(t.cues[0].start, 1, "cue 0 start:");
  near(t.cues[0].end, 2.5, 1e-9, "cue 0 end:");
  eq(t.cues[0].text, "Hello world", "cue 0 text:");
  eq(t.cues[0].hasTiming, true, "hasTiming:");
  near(t.duration ?? -1, 4, 1e-9, "duration:");
  eq(t.wordCount, 4, "word count:");
  eq(transcriptFormat(SRT), "srt", "format sniff:");
});

await test("parseTranscript: WebVTT", () => {
  const vtt = "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHi there\n";
  const t = parseTranscript(vtt);
  eq(transcriptFormat(vtt), "vtt", "format sniff:");
  eq(t.cues.length, 1, "cue count:");
  eq(t.cues[0].start, 1, "start:");
  eq(t.cues[0].end, 2, "end:");
  eq(t.cues[0].text, "Hi there", "text:");
});

await test("parseTranscript: plain text fallback", () => {
  const plain = "Just some words here. No timing at all.";
  const t = parseTranscript(plain);
  eq(transcriptFormat(plain), "plain", "format sniff:");
  eq(t.hasTiming, false, "hasTiming:");
  ok(t.cues.length >= 1 && t.wordCount === 8, `word count (got ${t.wordCount}):`);
});

await test("transcriptForPrompt / transcriptToPlain / excerptForRange", () => {
  const cues = parseTranscript(SRT).cues;
  ok(transcriptForPrompt(cues).includes("[0:01 - 0:02] Hello world"), "prompt formatting:");
  eq(transcriptToPlain(cues), "Hello world Second line", "plain join:");
  ok(transcriptToPlain(cues, 10).endsWith("…"), "maxChars truncation:");
  eq(excerptForRange(cues, 2.6, 10), "Second line", "range picks overlapping cue only:");
  eq(excerptForRange(cues, 0, 10), "Hello world Second line", "full-range excerpt:");
});

await test("end-to-end: segments → SRT → +30 s offset → parsed back (chunk rebase mirror)", () => {
  const srt = buildSrtFromSegments([
    { start: 0, end: 2, text: "Alpha" },
    { start: 5, end: 7.5, text: "Beta" },
  ]);
  const parsed = parseTranscript(offsetTimedText(srt, 30));
  eq(parsed.cues.length, 2, "cue count:");
  near(parsed.cues[0].start, 30, 1e-9, "cue 0 rebased start:");
  near(parsed.cues[0].end, 32, 1e-9, "cue 0 rebased end:");
  near(parsed.cues[1].start, 35, 1e-9, "cue 1 rebased start:");
  near(parsed.cues[1].end, 37.5, 1e-9, "cue 1 rebased end:");
  eq(parsed.cues[1].text, "Beta", "text survives the rebase:");
});

// ----------------------------------------------------------------- report --
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.log(`FAILED: ${failures.join(" | ")}`);
  process.exit(1);
}
