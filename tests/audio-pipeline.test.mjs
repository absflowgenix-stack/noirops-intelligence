// Unit tests for src/lib/audio.ts and src/lib/timed-text.ts
// (the local-upload + platform-link ingestion round).
import * as audio from "./compiled-audio/audio.js";
import * as tt from "./compiled-audio/timed-text.js";

let pass = 0;
let fail = 0;
const ok = (c, n) => {
  if (c) pass++;
  else {
    fail++;
    console.log("FAIL:", n);
  }
};

async function main() {
  // ── constants ──────────────────────────────────────────
  ok(audio.AUDIO_CHUNK_SECONDS === 420, "chunk length 420s");
  ok(audio.AUDIO_CHUNK_OVERLAP === 1.5, "chunk overlap 1.5s");

  // ── resampling ─────────────────────────────────────────
  const id = audio.resampleTo16kMono(new Float32Array([0.1, 0.2, 0.3]), 16000);
  ok(id.length === 3 && Math.abs(id[1] - 0.2) < 0.001, "identity at 16k (float32-safe)");
  const up = audio.resampleTo16kMono(new Float32Array(8000).fill(0.5), 8000);
  ok(up.length === 16000, "8k -> 16k doubles length");
  const down = audio.resampleTo16kMono(new Float32Array(48000).fill(0.5), 48000);
  ok(Math.abs(down.length - 16000) < 2, "48k -> 16k thirds length");

  // ── silence-aware split ────────────────────────────────
  const SR = 16000;
  const sig = new Float32Array(30 * SR).fill(0.4);
  for (let i = 20 * SR; i < 24 * SR; i++) sig[i] = 0;
  const split = audio.findSilenceSplit(sig, SR, 22);
  ok(split >= 20 && split <= 23.9, `split lands inside silence window (got ${split})`);
  const loud = new Float32Array(30 * SR).fill(0.5);
  ok(audio.findSilenceSplit(loud, SR, 15) === 15, "continuously loud audio falls back to target");

  // ── WAV encoding ───────────────────────────────────────
  const blob = audio.encodeWavBlob(new Float32Array([0, -1, 1, 0.5]), SR);
  const ab = await blob.arrayBuffer();
  const dv = new DataView(ab);
  ok(dv.getUint32(0, true) === 0x46464952, "RIFF magic");
  ok(dv.getUint32(8, true) === 0x45564157, "WAVE magic");
  ok(dv.getUint32(24, true) === SR, "sample rate field");
  ok(dv.getUint16(22, true) === 1, "mono channel count");
  ok(dv.getUint16(34, true) === 16, "16 bits per sample");
  ok(dv.getUint32(40, true) === 8, "data chunk size = 4 samples x 2 bytes");
  ok(dv.getInt16(46, true) <= -32767, "-1 clips to int16 min");

  // ── chunking ───────────────────────────────────────────
  const short = audio.chunkAudioSamples(new Float32Array(60 * SR));
  ok(short.length === 1 && short[0].startSec === 0 && Math.abs(short[0].endSec - 60) < 0.01,
    "60s input -> single chunk");
  const long = new Float32Array(500 * SR).fill(0.3);
  for (let i = 418 * SR; i < 422 * SR; i++) long[i] = 0;
  const chunks = audio.chunkAudioSamples(long);
  ok(chunks.length === 2, `500s input -> 2 chunks (got ${chunks.length})`);
  ok(Math.abs(chunks[0].endSec - 420) < 4,
    `first chunk ends near 420s (got ${chunks[0].endSec.toFixed(1)})`);
  ok(Math.abs(chunks[1].startSec - (chunks[0].endSec - 1.5)) < 0.01,
    "second chunk starts 1.5s before previous end (overlap)");
  const head = new Uint8Array(await chunks[0].blob.slice(0, 4).arrayBuffer());
  ok(head[0] === 82 && head[1] === 73 && head[2] === 70 && head[3] === 70, "chunk blob is a WAV");

  // ── timed-text offsets (link ingestion) ────────────────
  const NL = String.fromCharCode(10);
  const srt =
    "1" + NL + "00:00:05,000 --> 00:00:09,000" + NL + "First cue body." + NL + NL +
    "2" + NL + "00:00:12,000 --> 00:00:16,000" + NL + "Second cue body.";
  const shifted = tt.offsetTimedText(srt, 30.5);
  ok(shifted.includes("00:00:35,500"), "srt start shifted by 30.5s");
  ok(shifted.includes("00:00:39,500"), "srt end shifted (9s + 30.5s = 39.5s)");
  ok(shifted.includes("00:00:46,500"), "second srt block shifted");
  ok(shifted.includes("First cue body."), "cue bodies preserved");
  const vtt = "WEBVTT" + NL + NL + "00:00.000 --> 00:04.500" + NL + "Hello there.";
  const vshift = tt.offsetTimedText(vtt, 10);
  ok(vshift.includes("00:10.000"), "vtt shifted");
  ok(vshift.startsWith("WEBVTT"), "vtt header preserved");
  ok(tt.offsetTimedText("just plain words here", 5) === "just plain words here",
    "untimed text passes through unchanged");
  ok(tt.offsetTimedText(srt, 0).includes("00:00:05,000"), "zero offset is a no-op");

  console.log(`AUDIO+TT PASS:${pass} FAIL:${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.log("ERR", e.message);
  process.exit(1);
});
