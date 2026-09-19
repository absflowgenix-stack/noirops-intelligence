import { u as useAuth, J as useMutation, D as api, I as useAction, r as reactExports, z as useQuery, x as toast, $ as createContextScope, j as jsxRuntimeExports, a7 as Primitive, h as cn, al as Check, aw as Upload, B as Badge, d as Card, e as CardContent, ax as Link2, V as Video, F as FileText, ay as WandSparkles, p as LoaderCircle, a as Button, S as Sparkles, az as motion, H as Clock, aA as TooltipProvider, aB as Tooltip, aC as TooltipTrigger, N as Copy, aD as TooltipContent, aE as TriangleAlert, Z as Zap, aF as Scissors, aG as Share2, aH as Clapperboard, aI as Download, au as Send, aq as X, y as ArrowLeft, aJ as CircleAlert, W as Trash2, aK as Film } from './index-CFd9FS6K.js';
import { I as Input } from './input-BZ9Z1zrO.js';
import { T as Tabs, a as TabsList, b as TabsTrigger } from './tabs-g8H7D-Vf.js';
import { T as Textarea } from './textarea-3HcsmmLW.js';
import './index-dpUk1xYW.js';

const VIDEO_PLATFORMS = [
  {
    id: "youtube",
    name: "YouTube",
    color: "text-red-500",
    hostPatterns: [/youtube\.com$/i, /youtu\.be$/i, /youtube-nocookie\.com$/i]
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "text-cyan-500",
    hostPatterns: [/tiktok\.com$/i]
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "text-pink-500",
    hostPatterns: [/instagram\.com$/i]
  },
  {
    id: "twitter",
    name: "X / Twitter",
    color: "text-sky-500",
    hostPatterns: [/twitter\.com$/i, /x\.com$/i]
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "text-blue-600",
    hostPatterns: [/facebook\.com$/i, /fb\.watch$/i]
  },
  {
    id: "vimeo",
    name: "Vimeo",
    color: "text-sky-400",
    hostPatterns: [/vimeo\.com$/i]
  },
  {
    id: "twitch",
    name: "Twitch",
    color: "text-violet-500",
    hostPatterns: [/twitch\.tv$/i]
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    color: "text-blue-500",
    hostPatterns: [/linkedin\.com$/i]
  },
  {
    id: "reddit",
    name: "Reddit",
    color: "text-orange-500",
    hostPatterns: [/reddit\.com$/i]
  },
  {
    id: "dailymotion",
    name: "Dailymotion",
    color: "text-blue-400",
    hostPatterns: [/dailymotion\.com$/i, /dai\.ly$/i]
  },
  {
    id: "rumble",
    name: "Rumble",
    color: "text-emerald-500",
    hostPatterns: [/rumble\.com$/i]
  }
];
const CLIP_TARGET_PLATFORMS = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram Reels" },
  { id: "youtube", label: "YouTube Shorts" },
  { id: "twitter", label: "X / Twitter" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "facebook", label: "Facebook" }
];
function detectPlatform(rawUrl) {
  const url = (rawUrl || "").trim();
  if (!url) return null;
  let parsed;
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
  } catch {
    return null;
  }
  if (!parsed.hostname.includes(".")) return null;
  const host = parsed.hostname.replace(/^www\./i, "");
  for (const platform of VIDEO_PLATFORMS) {
    if (platform.hostPatterns.some((p) => p.test(host))) {
      return {
        id: platform.id,
        name: platform.name,
        color: platform.color,
        confidence: "exact",
        videoId: extractVideoId(platform.id, parsed)
      };
    }
  }
  return { id: "link", name: "Link", color: "text-muted-foreground", confidence: "unknown" };
}
function extractVideoId(platformId, url) {
  if (platformId === "youtube") {
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id || void 0;
    }
    const v = url.searchParams.get("v");
    if (v) return v;
    const m = url.pathname.match(/\/(shorts|embed|live)\/([^/?#]+)/);
    if (m) return m[2];
  }
  return void 0;
}
function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
}
function formatTimecode(totalSeconds) {
  const clamped = Math.max(0, totalSeconds);
  const h = Math.floor(clamped / 3600);
  const m = Math.floor(clamped % 3600 / 60);
  const s = Math.floor(clamped % 60);
  const ms = Math.round((clamped - Math.floor(clamped)) * 1e3);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":") + "." + String(ms).padStart(3, "0");
}
const EDIT_TYPES = [
  { id: "cut", label: "Hard cut", icon: "scissors", description: "Trim dead air, filler or tangents." },
  { id: "zoom", label: "Punch-in", icon: "zoom", description: "Push in to re-engage attention." },
  { id: "caption", label: "Caption emphasis", icon: "text", description: "Highlight key words on screen." },
  { id: "broll", label: "B-roll insert", icon: "arrow", description: "Cover a jump or illustrate a point." },
  { id: "speed", label: "Speed ramp", icon: "zap", description: "Speed up setup, slow down payoff." },
  { id: "audio", label: "Audio fix", icon: "volume", description: "Level, duck or clean the audio." },
  { id: "filter", label: "Color/Look", icon: "filter", description: "Adjust grade or apply a look." },
  { id: "cta", label: "CTA overlay", icon: "sparkles", description: "Overlay a call-to-action." }
];
const TRANSITIONS = [
  { id: "jump_cut", label: "Jump cut", description: "Instant cut, keeps raw energy." },
  { id: "whip_pan", label: "Whip pan", description: "Fast camera-style swipe between scenes." },
  { id: "zoom_transition", label: "Zoom transition", description: "Momentum-preserving zoom cut." },
  { id: "glitch", label: "Glitch", description: "Digital stutter, edgy tone." },
  { id: "fade", label: "Fade", description: "Soft dissolve for topic changes." },
  { id: "flash", label: "Flash cut", description: "White-flash accent on a punchline." },
  { id: "match_cut", label: "Match cut", description: "Cut on motion or shape similarity." }
];
const MOMENT_TYPES = [
  { id: "hook", label: "Hook", color: "bg-red-500/15 text-red-500" },
  { id: "story", label: "Story", color: "bg-blue-500/15 text-blue-500" },
  { id: "insight", label: "Insight", color: "bg-emerald-500/15 text-emerald-500" },
  { id: "humor", label: "Humor", color: "bg-amber-500/15 text-amber-500" },
  { id: "emotional", label: "Emotional", color: "bg-pink-500/15 text-pink-500" },
  { id: "data", label: "Data/Proof", color: "bg-violet-500/15 text-violet-500" },
  { id: "demo", label: "Demo", color: "bg-cyan-500/15 text-cyan-500" },
  { id: "call_to_action", label: "CTA", color: "bg-orange-500/15 text-orange-500" }
];
function momentTypeStyle(id) {
  return MOMENT_TYPES.find((m) => m.id === id)?.color ?? "bg-muted text-muted-foreground";
}
function momentTypeLabel(id) {
  return MOMENT_TYPES.find((m) => m.id === id)?.label ?? "Moment";
}
function scoreTone(score) {
  if (score >= 85) return { text: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30", label: "Exceptional" };
  if (score >= 70) return { text: "text-lime-500", bg: "bg-lime-500/10 border-lime-500/30", label: "Strong" };
  if (score >= 55) return { text: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", label: "Good" };
  return { text: "text-muted-foreground", bg: "bg-muted border-border", label: "Filler" };
}

const TIMECODE_LINE = /(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})/;
const SHORT_TIMECODE_LINE = /(\d{1,2}):(\d{2})[.,](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2})[.,](\d{1,3})/;
function hmsToSeconds(h, m, s, ms) {
  return Number(h) * 3600 + Number(m) * 60 + Number(s) + Number(ms.padEnd(3, "0")) / 1e3;
}
function msToSeconds(m, s, ms) {
  return Number(m) * 60 + Number(s) + Number(ms.padEnd(3, "0")) / 1e3;
}
function looksLikeTimedTranscript(text) {
  return TIMECODE_LINE.test(text) || SHORT_TIMECODE_LINE.test(text);
}
function parseTimecodeLine(line) {
  const m = line.match(TIMECODE_LINE);
  if (m) {
    return {
      start: hmsToSeconds(m[1], m[2], m[3], m[4]),
      end: hmsToSeconds(m[5], m[6], m[7], m[8])
    };
  }
  const s = line.match(SHORT_TIMECODE_LINE);
  if (s) {
    return { start: msToSeconds(s[1], s[2], s[3]), end: msToSeconds(s[4], s[5], s[6]) };
  }
  return null;
}
function parseTimed(text) {
  const cues = [];
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.split("\n").filter((l) => l.trim() !== "");
    if (lines.length === 0) continue;
    if (/^WEBVTT/i.test(lines[0])) continue;
    if (/^(NOTE|STYLE|REGION)\b/i.test(lines[0])) continue;
    const tcIndex = lines.findIndex((l) => parseTimecodeLine(l) !== null);
    if (tcIndex === -1) continue;
    const tc = parseTimecodeLine(lines[tcIndex]);
    const body = lines.slice(tcIndex + 1).join(" ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (body) cues.push({ start: tc.start, end: tc.end, text: body, hasTiming: true });
  }
  cues.sort((a, b) => a.start - b.start);
  const duration = cues.length > 0 ? cues[cues.length - 1].end : null;
  return {
    cues,
    hasTiming: cues.length > 0,
    duration: duration && duration > 0 ? duration : null,
    wordCount: countWords(cues)
  };
}
function parsePlainText(text) {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const sentences = normalized.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
  const cues = sentences.map((s) => ({ start: 0, end: 0, text: s, hasTiming: false }));
  return { cues, hasTiming: false, duration: null, wordCount: countWords(cues) };
}
function countWords(cues) {
  return cues.reduce((acc, c) => acc + c.text.split(/\s+/).filter(Boolean).length, 0);
}
function parseTranscript(raw) {
  const text = (raw || "").trim();
  if (!text) return { cues: [], hasTiming: false, duration: null, wordCount: 0 };
  try {
    if (looksLikeTimedTranscript(text)) {
      const parsed = parseTimed(text);
      if (parsed.cues.length > 0) return parsed;
    }
  } catch {
  }
  return parsePlainText(text);
}
function transcriptToPlain(cues, maxChars) {
  const joined = cues.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
  if (maxChars && joined.length > maxChars) {
    return joined.slice(0, maxChars) + "…";
  }
  return joined;
}
function transcriptForPrompt(cues, maxChars) {
  const lines = cues.map(
    (c) => c.hasTiming ? `[${formatTs(c.start)} - ${formatTs(c.end)}] ${c.text}` : c.text
  );
  let out = lines.join("\n");
  if (maxChars && out.length > maxChars) out = out.slice(0, maxChars) + "…";
  return out;
}
function formatTs(seconds) {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor(s % 3600 / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}` : `${m}:${String(sec).padStart(2, "0")}`;
}
function excerptForRange(cues, startSec, endSec) {
  const overlapping = cues.filter(
    (c) => c.hasTiming ? c.end > startSec && c.start < endSec : true
  );
  const text = overlapping.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
  return text.length > 400 ? text.slice(0, 400) + "…" : text;
}
function transcriptFormat(raw) {
  const text = (raw || "").trim();
  if (/^WEBVTT/i.test(text)) return "vtt";
  if (looksLikeTimedTranscript(text)) return "srt";
  return "plain";
}

const TARGET_SAMPLE_RATE = 16e3;
const AUDIO_CHUNK_SECONDS = 25;
const AUDIO_CHUNK_OVERLAP = 1.5;
async function decodeAudioFile(file) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error("Web Audio is not supported in this browser.");
  const arrayBuffer = await file.arrayBuffer();
  const ctx = new AudioCtx();
  try {
    const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const chCount = buffer.numberOfChannels;
    const length = buffer.length;
    const mono = new Float32Array(length);
    for (let ch = 0; ch < chCount; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) mono[i] += data[i];
    }
    if (chCount > 1) {
      const inv = 1 / chCount;
      for (let i = 0; i < length; i++) mono[i] *= inv;
    }
    return { samples: mono, sampleRate: buffer.sampleRate };
  } finally {
    void ctx.close().catch(() => void 0);
  }
}
function resampleTo16kMono(samples, sampleRate) {
  if (sampleRate === TARGET_SAMPLE_RATE) return samples;
  const ratio = sampleRate / TARGET_SAMPLE_RATE;
  const outLength = Math.max(1, Math.floor(samples.length / ratio));
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const srcPos = i * ratio;
    const i0 = Math.floor(srcPos);
    const i1 = Math.min(samples.length - 1, i0 + 1);
    const frac = srcPos - i0;
    out[i] = samples[i0] * (1 - frac) + samples[i1] * frac;
  }
  return out;
}
function findSilenceSplit(samples, sampleRate, targetSec) {
  const targetIdx = Math.min(samples.length - 1, Math.round(targetSec * sampleRate));
  const window2 = Math.round(4 * sampleRate);
  const win = Math.round(0.02 * sampleRate);
  const from = Math.max(0, targetIdx - window2);
  const to = Math.min(samples.length - win, targetIdx + window2);
  let bestIdx = -1;
  let bestRms = Infinity;
  for (let i = from; i < to; i += win) {
    let sum = 0;
    for (let j = i; j < i + win; j++) sum += samples[j] * samples[j];
    const rms = Math.sqrt(sum / win);
    if (rms < bestRms) {
      bestRms = rms;
      bestIdx = i + Math.floor(win / 2);
    }
  }
  if (bestIdx >= 0 && bestRms < 0.02) return bestIdx / sampleRate;
  return targetSec;
}
function encodeWavBlob(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset2, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset2 + i, str.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 32768 : s * 32767, true);
    offset += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}
function chunkAudioSamples(samples) {
  const totalSec = samples.length / TARGET_SAMPLE_RATE;
  if (totalSec <= AUDIO_CHUNK_SECONDS) {
    return [
      {
        blob: encodeWavBlob(samples, TARGET_SAMPLE_RATE),
        startSec: 0,
        endSec: totalSec
      }
    ];
  }
  const chunks = [];
  let cursor = 0;
  while (cursor < totalSec - 0.5) {
    const target = cursor + AUDIO_CHUNK_SECONDS;
    const splitSec = target >= totalSec ? totalSec : findSilenceSplit(samples, TARGET_SAMPLE_RATE, target);
    const startSample = Math.max(
      0,
      Math.round((chunks.length === 0 ? 0 : cursor - AUDIO_CHUNK_OVERLAP) * TARGET_SAMPLE_RATE)
    );
    const endSample = Math.min(samples.length, Math.round(splitSec * TARGET_SAMPLE_RATE));
    if (endSample <= startSample) break;
    const slice = samples.subarray(startSample, endSample);
    chunks.push({
      blob: encodeWavBlob(slice, TARGET_SAMPLE_RATE),
      startSec: startSample / TARGET_SAMPLE_RATE,
      endSec: endSample / TARGET_SAMPLE_RATE
    });
    cursor = splitSec;
    if (splitSec >= totalSec) break;
  }
  return chunks;
}
async function prepareAudioChunks(file) {
  const { samples, sampleRate } = await decodeAudioFile(file);
  const mono16k = resampleTo16kMono(samples, sampleRate);
  const durationSec = mono16k.length / TARGET_SAMPLE_RATE;
  return { chunks: chunkAudioSamples(mono16k), durationSec };
}

const PREFERRED_MIME_TYPES = [
  'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
  "video/mp4",
  'video/webm;codecs="vp9,opus"',
  'video/webm;codecs="vp8,opus"',
  "video/webm"
];
const MAX_CANVAS_EDGE = 1280;
function pickMimeType() {
  if (typeof MediaRecorder === "undefined") {
    throw new Error(
      "This browser cannot render clips in-app. Download the source video and cut the timecodes in your editor instead."
    );
  }
  for (const type of PREFERRED_MIME_TYPES) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type;
    } catch {
    }
  }
  return "video/webm";
}
function parseAspectRatio(aspect) {
  if (!aspect) return null;
  const m = aspect.match(/(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)/i);
  if (!m) return null;
  const rw = parseFloat(m[1]);
  const rh = parseFloat(m[2]);
  if (!(rw > 0) || !(rh > 0)) return null;
  return rw / rh;
}
function targetDims(vw, vh, aspect) {
  const ratio = parseAspectRatio(aspect);
  const native = vw > 0 && vh > 0 ? vw / vh : 16 / 9;
  let cw = vw || 1280;
  let ch = vh || 720;
  if (ratio && Math.abs(ratio - native) > 0.02) {
    if (ratio > native) {
      ch = cw / ratio;
    } else {
      cw = ch * ratio;
    }
  }
  const long = Math.max(cw, ch);
  if (long > MAX_CANVAS_EDGE) {
    const k = MAX_CANVAS_EDGE / long;
    cw *= k;
    ch *= k;
  }
  return {
    w: Math.max(2, Math.round(cw / 2) * 2),
    h: Math.max(2, Math.round(ch / 2) * 2)
  };
}
function waitForEvent(el, event, timeoutMs, failureMessage) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      el.removeEventListener(event, onEvent);
      el.removeEventListener("error", onError);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(failureMessage));
    }, timeoutMs);
    const onEvent = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("The video could not be loaded (format unsupported or network blocked)."));
    };
    el.addEventListener(event, onEvent, { once: true });
    el.addEventListener("error", onError, { once: true });
  });
}
function drawFrame(g, video, w, h) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return;
  const target = w / h;
  const native = vw / vh;
  let sx = 0;
  let sy = 0;
  let sw = vw;
  let sh = vh;
  if (Math.abs(target - native) > 0.02) {
    if (target > native) {
      sh = vw / target;
      sy = (vh - sh) / 2;
    } else {
      sw = vh * target;
      sx = (vw - sw) / 2;
    }
  }
  g.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
}
function drawOverlay(g, text, w, h) {
  void h;
  const fontSize = Math.max(15, Math.round(w * 0.042));
  g.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const maxWidth = w * 0.86;
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (g.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === 2) break;
    } else {
      line = candidate;
    }
  }
  if (lines.length < 2 && line) lines.push(line);
  if (lines.length === 0) return;
  const lineHeight = fontSize * 1.25;
  const bandH = lines.length * lineHeight + fontSize * 0.8;
  g.fillStyle = "rgba(0,0,0,0.55)";
  g.fillRect(0, 0, w, bandH);
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  lines.forEach((l, i) => {
    g.fillText(l, w / 2, fontSize * 0.4 + lineHeight * (i + 0.5), maxWidth);
  });
}
async function renderClip(options) {
  const { sourceUrl, startSec, endSec, aspectRatio, overlayText, onProgress, signal } = options;
  if (!(endSec > startSec)) throw new Error("Invalid clip timecodes.");
  const mimeType = pickMimeType();
  const duration = endSec - startSec;
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.src = sourceUrl;
  const canvas = document.createElement("canvas");
  const ctx2d = canvas.getContext("2d", { alpha: false });
  if (!ctx2d) throw new Error("Canvas is unavailable in this browser.");
  let recorder = null;
  let canvasStream = null;
  let stoppedByWatcher = false;
  const teardown = () => {
    stoppedByWatcher = true;
    try {
      if (recorder && recorder.state !== "inactive") recorder.stop();
    } catch {
    }
    try {
      video.pause();
    } catch {
    }
    canvasStream?.getTracks().forEach((t) => t.stop());
    video.removeAttribute("src");
    try {
      video.load();
    } catch {
    }
  };
  if (signal) {
    signal.addEventListener("abort", teardown, { once: true });
  }
  try {
    await waitForEvent(video, "loadedmetadata", 3e4, "Loading the source video timed out.");
    const { w, h } = targetDims(video.videoWidth, video.videoHeight, aspectRatio);
    canvas.width = w;
    canvas.height = h;
    try {
      canvasStream = canvas.captureStream(30);
    } catch {
      throw new Error(
        "This source's host blocks in-browser rendering (CORS). Re-add the link so the video is stored in NoirOps, or upload the file directly."
      );
    }
    const tracks = [...canvasStream.getVideoTracks()];
    try {
      const audio = video.captureStream?.() ?? null;
      const audioTrack = audio?.getAudioTracks()[0];
      if (audioTrack) tracks.push(audioTrack);
    } catch {
    }
    const stream = new MediaStream(tracks);
    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4e6 });
    const parts = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) parts.push(e.data);
    };
    const stopped = new Promise((resolve) => {
      recorder.onstop = () => resolve();
    });
    video.currentTime = startSec;
    await waitForEvent(video, "seeked", 15e3, "Seeking in the source video timed out.");
    drawFrame(ctx2d, video, w, h);
    if (overlayText) drawOverlay(ctx2d, overlayText, w, h);
    recorder.start(250);
    await video.play();
    const stop = () => {
      if (stoppedByWatcher) return;
      stoppedByWatcher = true;
      try {
        recorder?.stop();
      } catch {
      }
      try {
        video.pause();
      } catch {
      }
    };
    const pump = () => {
      if (stoppedByWatcher) return;
      drawFrame(ctx2d, video, w, h);
      if (overlayText) drawOverlay(ctx2d, overlayText, w, h);
      if (video.requestVideoFrameCallback) {
        video.requestVideoFrameCallback(pump);
      } else {
        requestAnimationFrame(pump);
      }
    };
    if (video.requestVideoFrameCallback) {
      video.requestVideoFrameCallback(pump);
    } else {
      requestAnimationFrame(pump);
    }
    const startedAt = performance.now();
    await new Promise((resolve) => {
      const tick = () => {
        if (stoppedByWatcher) {
          resolve();
          return;
        }
        const elapsed = video.currentTime - startSec;
        onProgress?.(Math.min(99, Math.max(1, Math.round(elapsed / duration * 100))));
        if (video.currentTime >= endSec - 0.03 || video.ended) {
          stop();
          resolve();
          return;
        }
        if (performance.now() - startedAt > (duration + 15) * 1e3) {
          stop();
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      video.addEventListener("ended", () => {
        stop();
        resolve();
      }, { once: true });
    });
    await stopped;
    const blob = new Blob(parts, { type: mimeType.split(";")[0] ?? "video/webm" });
    if (blob.size === 0) {
      throw new Error("The render produced no data — try a slightly longer clip.");
    }
    onProgress?.(100);
    return { blob, contentType: blob.type, width: w, height: h };
  } finally {
    teardown();
  }
}
function extFor(contentType) {
  if (!contentType) return "mp4";
  if (contentType.includes("webm")) return "webm";
  return "mp4";
}
function clipFilename(title, contentType) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "clip";
  return `${slug}.${extFor(contentType)}`;
}
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1e4);
}

const SOURCE_STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  analyzing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20"
};
const MAX_VIDEO_BYTES = 1024 * 1024 * 1024;
const MAX_TRANSCRIPT_FILE_BYTES = 1024 * 1024 * 1024;
function useClipWorkspace() {
  const { user } = useAuth();
  const userId = user?._id ?? "";
  const createSource = useMutation(api.videoClips.createSource);
  const deleteSource = useMutation(api.videoClips.deleteSource);
  const updateClipStatus = useMutation(api.videoClips.updateClipStatus);
  const createDraft = useMutation(api.content.create);
  const generateUploadUrl = useMutation(api.videoClips.generateUploadUrl);
  const attachSourceAudio = useMutation(api.videoClips.attachSourceAudio);
  const attachClipAsset = useMutation(api.videoClips.attachClipAsset);
  const markClipAssetFailed = useMutation(api.videoClips.markClipAssetFailed);
  const ensureShareToken = useMutation(api.videoClips.ensureShareToken);
  const analyze = useAction(api.videoClipping.analyzeSource);
  const transcribe = useAction(api.audioTranscribe.transcribeFromStorage);
  const enrichLink = useAction(api.mediaIngest.enrichAndIngestLink);
  const [mode, setMode] = reactExports.useState("link");
  const [title, setTitle] = reactExports.useState("");
  const [linkUrl, setLinkUrl] = reactExports.useState("");
  const [durationInput, setDurationInput] = reactExports.useState("");
  const [transcriptText, setTranscriptText] = reactExports.useState("");
  const [focusTopic, setFocusTopic] = reactExports.useState("");
  const [uploadedName, setUploadedName] = reactExports.useState(null);
  const [videoFile, setVideoFile] = reactExports.useState(null);
  const [videoStage, setVideoStage] = reactExports.useState("idle");
  const [videoProgress, setVideoProgress] = reactExports.useState(0);
  const fileInputRef = reactExports.useRef(null);
  const videoInputRef = reactExports.useRef(null);
  const [activeSourceId, setActiveSourceId] = reactExports.useState(null);
  const [stage, setStage] = reactExports.useState("idle");
  const [renderingClipId, setRenderingClipId] = reactExports.useState(null);
  const [renderPct, setRenderPct] = reactExports.useState(0);
  const [shareLinks, setShareLinks] = reactExports.useState({});
  const sources = useQuery(
    api.videoClips.listSources,
    userId && !activeSourceId ? { userId, limit: 12 } : "skip"
  );
  const activeSource = useQuery(
    api.videoClips.getSource,
    activeSourceId ? { sourceId: activeSourceId } : "skip"
  );
  const clips = useQuery(
    api.videoClips.listClipsForSource,
    activeSourceId ? { sourceId: activeSourceId } : "skip"
  );
  const firstClipId = clips && clips.length > 0 ? clips[0]._id : void 0;
  const sourceMediaUrl = useQuery(
    api.videoClips.getClipMediaUrl,
    firstClipId ? { clipId: firstClipId } : "skip"
  );
  const detected = reactExports.useMemo(() => detectPlatform(linkUrl), [linkUrl]);
  const tFormat = reactExports.useMemo(
    () => transcriptText.trim() ? transcriptFormat(transcriptText) : null,
    [transcriptText]
  );
  const busy = stage !== "idle" || videoStage !== "idle";
  const canAnalyze = !!userId && !busy && (mode === "video" ? !!videoFile : mode === "link" ? !!linkUrl.trim() : transcriptText.trim().length > 40 && (mode !== "upload" || !!uploadedName));
  const handleFile = async (file) => {
    if (file.size > MAX_TRANSCRIPT_FILE_BYTES) {
      toast.error("Transcript file is too large (max 1 GB).");
      return;
    }
    const text = await file.text();
    setTranscriptText(text);
    setUploadedName(file.name);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.(srt|vtt|txt)$/i, "").replace(/[_-]+/g, " "));
    }
    toast.success(`Loaded ${file.name}`);
  };
  const handleVideoFile = (file) => {
    if (file.size > MAX_VIDEO_BYTES) {
      toast.error(
        "Video is too large for in-browser transcription (max 1 GB). Trim it or use a link."
      );
      return;
    }
    setVideoFile(file);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "));
    }
  };
  const handleVideoAnalyze = async () => {
    if (!userId || !videoFile) return;
    try {
      setVideoStage("decoding");
      setVideoProgress(8);
      const { chunks, durationSec } = await prepareAudioChunks(videoFile);
      setVideoStage("uploading");
      setVideoProgress(20);
      const storageIds = [];
      const chunkStarts = [];
      for (let i = 0; i < chunks.length; i++) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": "audio/wav" },
          body: chunks[i].blob
        });
        if (!res.ok) throw new Error(`Audio upload failed (${res.status}).`);
        const { storageId } = await res.json();
        storageIds.push(storageId);
        chunkStarts.push(chunks[i].startSec);
        setVideoProgress(20 + Math.round((i + 1) / chunks.length * 40));
      }
      const sourceId = await createSource({
        userId,
        title: title.trim() || videoFile.name.replace(/\.[^.]+$/, ""),
        sourceKind: "upload",
        fileSizeBytes: videoFile.size,
        mimeType: videoFile.type || "video/*"
      });
      await attachSourceAudio({
        sourceId,
        audioStorageIds: storageIds,
        durationSec,
        fileSizeBytes: videoFile.size,
        mimeType: videoFile.type || void 0
      });
      setVideoStage("transcribing");
      setVideoProgress(65);
      await transcribe({
        sourceId,
        audioStorageIds: storageIds,
        chunkStarts,
        focusTopic: focusTopic.trim() || void 0
      });
      setVideoProgress(100);
      toast.success("Transcription + analysis complete — clips are ready.");
      setActiveSourceId(sourceId);
      setVideoStage("idle");
      setVideoProgress(0);
    } catch (err) {
      setVideoStage("idle");
      setVideoProgress(0);
      const message = err instanceof Error ? err.message : "Video analysis failed";
      toast.error(message.slice(0, 200), {
        description: "Try a smaller file, or paste an SRT transcript instead."
      });
    }
  };
  const reset = () => {
    setActiveSourceId(null);
    setStage("idle");
    setMode("link");
    setTitle("");
    setLinkUrl("");
    setDurationInput("");
    setTranscriptText("");
    setFocusTopic("");
    setUploadedName(null);
    setVideoFile(null);
    setVideoStage("idle");
    setVideoProgress(0);
  };
  const handleAnalyze = async () => {
    if (!canAnalyze || busy) return;
    if (mode === "video") {
      await handleVideoAnalyze();
      return;
    }
    if (mode === "link") {
      const url = linkUrl.trim();
      const finalTitle2 = title.trim() || (detected?.name && detected.id !== "link" ? `${detected.name} video` : "Untitled video");
      try {
        setStage("creating");
        const sourceId = await createSource({
          userId,
          title: finalTitle2,
          sourceKind: "link",
          url,
          platform: detected && detected.id !== "link" ? detected.id : void 0,
          videoId: detected?.videoId
        });
        if (tFormat && tFormat !== "plain" && transcriptText.trim().length > 40) {
          setStage("analyzing");
          await analyze({
            sourceId,
            transcriptText: transcriptText.trim(),
            durationSec: Number(durationInput) > 0 ? Number(durationInput) : void 0,
            focusTopic: focusTopic.trim() || void 0
          });
          toast.success("Analysis complete — clips are ready below.");
        } else {
          setStage("analyzing");
          const result = await enrichLink({
            sourceId,
            url,
            focusTopic: focusTopic.trim() || void 0,
            autoAnalyze: true
          });
          if (result.transcriptFound) {
            toast.success(result.message);
          } else if (result.mediaStored) {
            toast.success(result.message);
          } else {
            toast(result.message, {
              description: "The link was enriched with platform metadata — add its transcript below for timed clips."
            });
          }
        }
        setActiveSourceId(sourceId);
        setStage("idle");
      } catch (err) {
        setStage("idle");
        const message = err instanceof Error ? err.message : "Analysis failed";
        toast.error(message.slice(0, 200));
      }
      return;
    }
    if (tFormat === "plain") {
      toast.error(
        "This transcript has no timestamps. Paste an SRT or VTT transcript (with timecodes) so clips can be located in the video."
      );
      return;
    }
    const trimmed = transcriptText.trim();
    const finalTitle = title.trim() || (mode === "upload" && uploadedName ? uploadedName.replace(/\.(srt|vtt|txt)$/i, "") : "Untitled video");
    const durationSec = Number(durationInput) > 0 ? Number(durationInput) : void 0;
    try {
      setStage("creating");
      const sourceId = await createSource({
        userId,
        title: finalTitle,
        sourceKind: mode === "upload" ? "upload" : "transcript",
        platform: detected && detected.id !== "link" ? detected.id : void 0
      });
      setStage("analyzing");
      await analyze({
        sourceId,
        transcriptText: trimmed,
        durationSec,
        focusTopic: focusTopic.trim() || void 0
      });
      toast.success("Analysis complete — clips are ready below.");
      setActiveSourceId(sourceId);
      setStage("idle");
    } catch (err) {
      setStage("idle");
      const message = err instanceof Error ? err.message : "Analysis failed";
      toast.error(message.slice(0, 200), {
        description: "Adjust the transcript and try again."
      });
    }
  };
  const acceptClip = async (clip) => {
    try {
      await updateClipStatus({ clipId: clip._id, status: "accepted" });
      toast.success("Clip accepted — ready for editing.");
    } catch {
      toast.error("Could not update the clip.");
    }
  };
  const dismissClip = async (clip) => {
    await updateClipStatus({ clipId: clip._id, status: "dismissed" });
  };
  const copyTimecodes = (clip) => {
    const edl = `${formatTimecode(clip.startSec)} --> ${formatTimecode(clip.endSec)}`;
    navigator.clipboard.writeText(edl);
    toast.success("Timecodes copied (EDL format).");
  };
  const copyCaption = (clip) => {
    navigator.clipboard.writeText(clip.caption ?? "");
    toast.success("Caption copied");
  };
  const renderClipAsset = async (clip) => {
    if (!userId || !activeSourceId || clip.sourceId !== activeSourceId) return;
    try {
      setRenderingClipId(clip._id);
      setRenderPct(1);
      if (!sourceMediaUrl?.url) {
        toast.error(
          "No playable media for this source yet — upload the video file or use a link whose video can be fetched.",
          { description: "Timecodes, captions and edits still work without media." }
        );
        setRenderingClipId(null);
        return;
      }
      const rendered = await renderClip({
        sourceUrl: sourceMediaUrl.url,
        startSec: clip.startSec,
        endSec: clip.endSec,
        aspectRatio: clip.aspectRatio,
        overlayText: clip.hook ?? null,
        onProgress: setRenderPct
      });
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": rendered.contentType },
        body: rendered.blob
      });
      if (!res.ok) throw new Error(`Clip upload failed (${res.status}).`);
      const { storageId } = await res.json();
      await attachClipAsset({
        clipId: clip._id,
        assetStorageId: storageId,
        assetBytes: rendered.blob.size,
        assetContentType: rendered.contentType
      });
      toast.success("Clip rendered and saved — it now plays right here.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Clip render failed";
      try {
        await markClipAssetFailed({ clipId: clip._id, errorMessage: message });
      } catch {
      }
      toast.error(message.slice(0, 200));
    } finally {
      setRenderingClipId(null);
      setRenderPct(0);
    }
  };
  const shareClip = async (clip) => {
    try {
      const token = await ensureShareToken({ clipId: clip._id });
      const url = `${window.location.origin}/share/clip/${token}`;
      setShareLinks((prev) => ({ ...prev, [clip._id]: url }));
      await navigator.clipboard.writeText(url).catch(() => void 0);
      toast.success("Share link copied — anyone with it can view this clip.");
      return url;
    } catch {
      toast.error("Could not create the share link.");
      return null;
    }
  };
  const getShareLink = (clipId) => shareLinks[clipId] ?? null;
  const sendToDrafts = async (clip) => {
    if (!userId) return;
    try {
      const hashtags = (clip.hashtags ?? []).join(" ");
      await createDraft({
        userId,
        title: clip.title,
        body: [clip.caption, hashtags].filter(Boolean).join("\n\n"),
        platform: clip.targetPlatform ?? void 0,
        contentType: "clip",
        status: "draft",
        generationParams: {
          origin: "video-clipping",
          clipId: clip._id,
          sourceId: clip.sourceId,
          startSec: clip.startSec,
          endSec: clip.endSec
        }
      });
      await updateClipStatus({ clipId: clip._id, status: "exported" });
      toast.success("Sent to Content History as a draft.");
    } catch {
      toast.error("Could not create the draft.");
    }
  };
  const removeSource = async (sourceId) => {
    try {
      await deleteSource({ sourceId });
      toast.success("Source and its clips deleted.");
    } catch {
      toast.error("Could not delete the source.");
    }
  };
  const openSource = (sourceId) => setActiveSourceId(sourceId);
  return {
    // input state
    mode,
    setMode,
    title,
    setTitle,
    linkUrl,
    setLinkUrl,
    durationInput,
    setDurationInput,
    transcriptText,
    setTranscriptText,
    focusTopic,
    setFocusTopic,
    uploadedName,
    setUploadedName,
    videoFile,
    videoStage,
    videoProgress,
    fileInputRef,
    videoInputRef,
    // derived
    detected,
    tFormat,
    busy,
    canAnalyze,
    stage,
    // data
    sources,
    activeSource,
    clips,
    activeSourceId,
    sourceMediaUrl,
    // actions
    handleFile,
    handleVideoFile,
    handleAnalyze,
    reset,
    acceptClip,
    dismissClip,
    copyTimecodes,
    copyCaption,
    sendToDrafts,
    removeSource,
    openSource,
    // render + share
    renderingClipId,
    renderPct,
    renderClipAsset,
    shareClip,
    getShareLink
  };
}

"use client";
var PROGRESS_NAME = "Progress";
var DEFAULT_MAX = 100;
var [createProgressContext, createProgressScope] = createContextScope(PROGRESS_NAME);
var [ProgressProvider, useProgressContext] = createProgressContext(PROGRESS_NAME);
var Progress$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeProgress,
      value: valueProp = null,
      max: maxProp,
      getValueLabel = defaultGetValueLabel,
      ...progressProps
    } = props;
    if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
      console.error(getInvalidMaxError(`${maxProp}`, "Progress"));
    }
    const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
    if (valueProp !== null && !isValidValueNumber(valueProp, max)) {
      console.error(getInvalidValueError(`${valueProp}`, "Progress"));
    }
    const value = isValidValueNumber(valueProp, max) ? valueProp : null;
    const valueLabel = isNumber(value) ? getValueLabel(value, max) : void 0;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ProgressProvider, { scope: __scopeProgress, value, max, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "aria-valuemax": max,
        "aria-valuemin": 0,
        "aria-valuenow": isNumber(value) ? value : void 0,
        "aria-valuetext": valueLabel,
        role: "progressbar",
        "data-state": getProgressState(value, max),
        "data-value": value ?? void 0,
        "data-max": max,
        ...progressProps,
        ref: forwardedRef
      }
    ) });
  }
);
Progress$1.displayName = PROGRESS_NAME;
var INDICATOR_NAME = "ProgressIndicator";
var ProgressIndicator = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeProgress, ...indicatorProps } = props;
    const context = useProgressContext(INDICATOR_NAME, __scopeProgress);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.div,
      {
        "data-state": getProgressState(context.value, context.max),
        "data-value": context.value ?? void 0,
        "data-max": context.max,
        ...indicatorProps,
        ref: forwardedRef
      }
    );
  }
);
ProgressIndicator.displayName = INDICATOR_NAME;
function defaultGetValueLabel(value, max) {
  return `${Math.round(value / max * 100)}%`;
}
function getProgressState(value, maxValue) {
  return value == null ? "indeterminate" : value === maxValue ? "complete" : "loading";
}
function isNumber(value) {
  return typeof value === "number";
}
function isValidMaxNumber(max) {
  return isNumber(max) && !isNaN(max) && max > 0;
}
function isValidValueNumber(value, max) {
  return isNumber(value) && !isNaN(value) && value <= max && value >= 0;
}
function getInvalidMaxError(propValue, componentName) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}
function getInvalidValueError(propValue, componentName) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - \`null\` or \`undefined\` if the progress is indeterminate.

Defaulting to \`null\`.`;
}
var Root = Progress$1;
var Indicator = ProgressIndicator;

function Progress({
  className,
  value,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "progress",
      className: cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Indicator,
        {
          "data-slot": "progress-indicator",
          className: "bg-primary h-full w-full flex-1 transition-all",
          style: { transform: `translateX(-${100 - (value || 0)}%)` }
        }
      )
    }
  );
}

function UploadDropzone({ workspace }) {
  const { uploadedName, fileInputRef, handleFile } = workspace;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "border border-dashed border-border/70 rounded-md p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors",
      onClick: () => fileInputRef.current?.click(),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileInputRef,
            type: "file",
            accept: ".srt,.vtt,.txt",
            className: "hidden",
            onChange: (e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }
          }
        ),
        uploadedName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-emerald-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: uploadedName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "— click to replace" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-5 w-5 text-muted-foreground mx-auto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Upload an SRT, VTT or TXT transcript" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Timed transcripts (SRT/VTT) give frame-accurate clips. Up to 1 GB." })
        ] })
      ]
    }
  );
}
function PasteArea({ workspace }) {
  const { mode, uploadedName, transcriptText, setTranscriptText, tFormat } = workspace;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium text-muted-foreground", children: [
        "Transcript",
        " ",
        mode === "upload" && uploadedName ? "(loaded from file)" : mode === "link" ? "(optional — auto-pulled for YouTube)" : ""
      ] }),
      tFormat && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px]", children: tFormat === "srt" ? "SRT detected" : tFormat === "vtt" ? "WebVTT detected" : "Plain text — needs timecodes" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Textarea,
      {
        placeholder: "1\n00:00:00,000 --> 00:00:12,000\nWelcome back to the show...\n\n2\n00:00:12,000 --> 00:00:30,000\nToday we're talking about...",
        value: transcriptText,
        onChange: (e) => {
          setTranscriptText(e.target.value);
          workspace.setUploadedName(null);
        },
        className: "min-h-[160px] font-mono text-xs leading-relaxed"
      }
    ),
    transcriptText.trim() && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
      transcriptText.trim().split(/\s+/).length.toLocaleString(),
      " words",
      tFormat === "plain" ? " — paste timecoded SRT/VTT for timed clips" : ""
    ] })
  ] });
}

const VIDEO_STAGE_LABELS = {
  idle: "",
  decoding: "Extracting & chunking audio in your browser...",
  uploading: "Uploading audio chunks...",
  transcribing: "Transcribing with AI (Whisper)...",
  analyzing: "Finding the best moments..."
};
function ClipInputForm({ workspace }) {
  const {
    mode,
    setMode,
    title,
    setTitle,
    linkUrl,
    setLinkUrl,
    durationInput,
    setDurationInput,
    transcriptText,
    setTranscriptText,
    focusTopic,
    setFocusTopic,
    uploadedName,
    videoFile,
    videoStage,
    videoProgress,
    fileInputRef,
    videoInputRef,
    detected,
    tFormat,
    busy,
    canAnalyze,
    stage,
    handleFile,
    handleVideoFile,
    handleAnalyze
  } = workspace;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: mode, onValueChange: (v) => setMode(v), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "link", className: "gap-1.5 cursor-pointer text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "h-3.5 w-3.5" }),
        " Link"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "video", className: "gap-1.5 cursor-pointer text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-3.5 w-3.5" }),
        " Video"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "upload", className: "gap-1.5 cursor-pointer text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-3.5 w-3.5" }),
        " SRT file"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "transcript", className: "gap-1.5 cursor-pointer text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3.5 w-3.5" }),
        " Paste"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Video title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: "e.g. Podcast ep. 42 — Scaling to 100k",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            className: "text-sm"
          }
        )
      ] }),
      mode !== "video" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium text-muted-foreground", children: [
          "Duration in seconds ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/60", children: "(optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            min: 0,
            placeholder: "Auto-detected when possible",
            value: durationInput,
            onChange: (e) => setDurationInput(e.target.value),
            className: "text-sm"
          }
        )
      ] })
    ] }),
    mode === "link" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-muted-foreground", children: "Video URL (YouTube, TikTok, Instagram, X, Facebook, Vimeo, Twitch, LinkedIn, Reddit, Dailymotion, Rumble)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "https://youtube.com/watch?v=...",
              value: linkUrl,
              onChange: (e) => setLinkUrl(e.target.value),
              className: "pl-9 text-sm"
            }
          )
        ] }),
        linkUrl.trim() && detected && /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "outline", className: cn("text-[10px] shrink-0", detected.color), children: [
          detected.name,
          detected.confidence === "unknown" ? " (generic link)" : ""
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground flex items-start gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "h-3 w-3 mt-0.5 shrink-0 text-primary/70" }),
        "We pull captions for clipping and download the video when the platform allows it, so clips preview, render and share right here. Some platforms only expose captions — add their transcript below or use the Video tab."
      ] })
    ] }),
    mode === "video" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "border border-dashed border-border/70 rounded-md p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/30 transition-colors",
          onClick: () => videoInputRef.current?.click(),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                ref: videoInputRef,
                type: "file",
                accept: "video/*,audio/*",
                className: "hidden",
                onChange: (e) => {
                  const f = e.target.files?.[0];
                  if (f) handleVideoFile(f);
                }
              }
            ),
            videoFile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-emerald-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium truncate max-w-[320px]", children: videoFile.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs shrink-0", children: [
                "(",
                (videoFile.size / (1024 * 1024)).toFixed(1),
                " MB) — click to replace"
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Video, { className: "h-5 w-5 text-muted-foreground mx-auto" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Upload a video or audio file" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "MP4, MOV, WebM, MP3, WAV... Audio is extracted in your browser and transcribed with AI. Max 1 GB." })
            ] })
          ]
        }
      ),
      videoStage !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
          VIDEO_STAGE_LABELS[videoStage] ?? ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: videoProgress, className: "h-1.5", "aria-label": "Video processing" })
      ] })
    ] }),
    mode !== "video" && /* @__PURE__ */ jsxRuntimeExports.jsx(TranscriptSection, { workspace }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium text-muted-foreground", children: [
        "Topic focus ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground/60", children: "(optional)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          placeholder: "e.g. pricing strategy, hiring lessons, product demos",
          value: focusTopic,
          onChange: (e) => setFocusTopic(e.target.value),
          className: "text-sm"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 pt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: mode === "video" ? "Transcription runs on chunked audio; long videos are fully supported." : mode === "link" ? "Captions are fetched automatically and the video is saved in-app when possible." : tFormat === "plain" ? "Add timecoded SRT/VTT text to enable clipping." : "The AI returns up to 8 ranked, non-overlapping clips." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleAnalyze,
          disabled: !canAnalyze,
          className: "gap-2 cursor-pointer",
          children: busy ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            mode === "video" ? "Processing..." : stage === "creating" ? "Preparing..." : "Analyzing..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4" }),
            " Find best moments"
          ] })
        }
      )
    ] }),
    mode !== "video" && stage !== "idle" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      Progress,
      {
        value: stage === "creating" ? 30 : 70,
        className: "h-1",
        "aria-label": "Analysis progress"
      }
    )
  ] }) });
}
function TranscriptSection({ workspace }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    workspace.mode === "upload" && /* @__PURE__ */ jsxRuntimeExports.jsx(UploadDropzone, { workspace }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PasteArea, { workspace })
  ] });
}

const CLIP_STATUS_STYLES = {
  suggested: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  accepted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  exported: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  dismissed: "bg-muted text-muted-foreground border-border"
};
const ASSET_STATUS_STYLES = {
  ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  rendering: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  failed: "bg-red-500/10 text-red-500 border-red-500/20",
  none: "bg-muted text-muted-foreground border-border"
};
function editMeta(id) {
  return EDIT_TYPES.find((e) => e.id === id);
}
function transitionMeta(id) {
  return TRANSITIONS.find((t) => t.id === id);
}
function ClipPlayer({
  src,
  startSec,
  endSec,
  aspectRatio
}) {
  const videoRef = reactExports.useRef(null);
  const [muted, setMuted] = reactExports.useState(true);
  const [playing, setPlaying] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = startSec;
    const onTime = () => {
      if (v.currentTime >= endSec) {
        v.pause();
        setPlaying(false);
        v.currentTime = startSec;
      }
    };
    v.addEventListener("timeupdate", onTime);
    return () => v.removeEventListener("timeupdate", onTime);
  }, [src, startSec, endSec]);
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime < startSec || v.currentTime >= endSec) v.currentTime = startSec;
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "relative overflow-hidden rounded-md border border-border/60 bg-black/90",
        aspectRatio === "9:16" ? "max-w-[220px]" : "w-full"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "video",
          {
            ref: videoRef,
            src,
            className: "w-full h-auto max-h-[320px]",
            muted,
            playsInline: true,
            preload: "metadata",
            onClick: togglePlay
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/60 px-2 py-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: togglePlay,
              className: "text-white/90 hover:text-white text-xs cursor-pointer",
              children: playing ? "❚❚" : "▶"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-white/60 tabular-nums", children: [
            formatDuration(startSec),
            " – ",
            formatDuration(endSec)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setMuted((m) => !m),
              className: "ml-auto text-[10px] text-white/60 hover:text-white cursor-pointer",
              children: muted ? "Unmute" : "Mute"
            }
          )
        ] })
      ]
    }
  );
}
function ClipCard({
  clip,
  index,
  totalDuration,
  mediaUrl,
  mediaOrigin,
  renderingClipId,
  renderPct,
  shareLink,
  onAccept,
  onDismiss,
  onSendToDrafts,
  onCopyTimecodes,
  onCopyCaption,
  onRender,
  onShare
}) {
  const tone = scoreTone(clip.score);
  const duration = clip.endSec - clip.startSec;
  const edits = clip.edits ?? [];
  const transitions = clip.transitions ?? [];
  const isRendering = renderingClipId === clip._id;
  const assetStatus = clip.assetStatus ?? "none";
  const downloadRendered = () => {
    if (!clip.assetStorageId) return;
    const url = `/api/storage/${clip.assetStorageId}`;
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.blob();
    }).then((b) => downloadBlob(b, clipFilename(clip.title, clip.assetContentType))).catch(() => toast.error("Could not download the rendered clip."));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.18, delay: Math.min(index * 0.04, 0.25) },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: cn(
                    "inline-flex items-center justify-center h-6 px-2 rounded text-xs font-bold border",
                    tone.bg,
                    tone.text
                  ),
                  children: clip.score
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold tracking-tight truncate", children: clip.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: cn("text-[10px]", momentTypeStyle(clip.momentType)),
                  children: momentTypeLabel(clip.momentType)
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: cn("text-[10px] capitalize", CLIP_STATUS_STYLES[clip.status] ?? ""),
                  children: clip.status
                }
              ),
              assetStatus !== "none" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: "outline",
                  className: cn("text-[10px] capitalize", ASSET_STATUS_STYLES[assetStatus] ?? ""),
                  children: assetStatus === "ready" ? "rendered" : assetStatus
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                formatDuration(clip.startSec),
                " – ",
                formatDuration(clip.endSec),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground/60", children: [
                  "(",
                  formatDuration(duration),
                  ")"
                ] })
              ] }),
              clip.targetPlatform && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: clip.targetPlatform }),
              clip.aspectRatio && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: clip.aspectRatio })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipProvider, { delayDuration: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Tooltip, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-7 w-7 cursor-pointer shrink-0",
                onClick: onCopyTimecodes,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TooltipContent, { children: "Copy EDL timecodes" })
          ] }) })
        ] }),
        totalDuration && totalDuration > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 rounded-full bg-muted relative overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute top-0 bottom-0 bg-primary/70 rounded-full",
            style: {
              left: `${Math.min(100, clip.startSec / totalDuration * 100)}%`,
              width: `${Math.min(100, duration / totalDuration * 100)}%`
            }
          }
        ) }),
        isRendering ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border/50 bg-muted/40 p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin text-primary" }),
            "Rendering clip in your browser (",
            renderPct ?? 0,
            "%) — real-time capture, hang tight."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Progress, { value: renderPct ?? 0, className: "h-1.5", "aria-label": "Clip render progress" })
        ] }) : clip.assetStorageId ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          ClipPlayer,
          {
            src: `/api/storage/${clip.assetStorageId}`,
            startSec: clip.startSec,
            endSec: clip.endSec,
            aspectRatio: clip.aspectRatio
          }
        ) : mediaUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          ClipPlayer,
          {
            src: mediaUrl,
            startSec: clip.startSec,
            endSec: clip.endSec,
            aspectRatio: clip.aspectRatio
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-dashed border-border/50 bg-muted/30 p-3 flex items-start gap-2 text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "No playable media for this source yet. Clips still carry exact timecodes — upload the video or paste a platform link whose video can be fetched to render them in-app." })
        ] }),
        clip.hook && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-medium", children: "Hook" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-0.5 italic text-foreground/90", children: [
            "“",
            clip.hook,
            "”"
          ] })
        ] }),
        clip.reason && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: clip.reason }),
        clip.transcriptExcerpt && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border/50 bg-muted/40 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-medium", children: "Transcript" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 line-clamp-3", children: clip.transcriptExcerpt })
        ] }),
        (edits.length > 0 || transitions.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          edits.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3" }),
              " Suggested edits"
            ] }),
            edits.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: editMeta(e.type)?.label ?? e.type }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " ",
                "@ ",
                formatDuration(e.atSec),
                " — ",
                e.note
              ] })
            ] }, i))
          ] }),
          transitions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-3 w-3" }),
              " Transitions"
            ] }),
            transitions.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: transitionMeta(t.type)?.label ?? t.type }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " ",
                "@ ",
                formatDuration(t.atSec),
                " — ",
                t.note
              ] })
            ] }, i))
          ] })
        ] }),
        (clip.caption || (clip.hashtags ?? []).length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border/50 bg-muted/40 p-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wide text-muted-foreground font-medium", children: "Ready-to-post caption" }),
          clip.caption && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs", children: clip.caption }),
          (clip.hashtags ?? []).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-primary/80", children: (clip.hashtags ?? []).join(" ") })
        ] }),
        shareLink && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-primary/30 bg-primary/5 p-2.5 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "text-[11px] truncate flex-1 text-foreground/80", children: shareLink }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-6 px-2 text-[11px] cursor-pointer",
              onClick: () => {
                void navigator.clipboard.writeText(shareLink);
                toast.success("Link copied");
              },
              children: "Copy"
            }
          )
        ] }),
        clip.assetError && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-red-500/90 flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3 w-3" }),
          " ",
          clip.assetError
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 pt-1", children: [
          clip.status === "suggested" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", className: "h-8 gap-1.5 cursor-pointer", onClick: onAccept, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
            " Accept clip"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-8 gap-1.5 cursor-pointer",
              onClick: onRender,
              disabled: isRendering,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clapperboard, { className: "h-3.5 w-3.5" }),
                clip.assetStorageId ? "Re-render" : "Render clip"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "h-8 gap-1.5 cursor-pointer",
              onClick: onShare,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5" }),
                " Share"
              ]
            }
          ),
          clip.assetStorageId && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-8 gap-1.5 text-muted-foreground cursor-pointer",
              onClick: downloadRendered,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3.5 w-3.5" }),
                " Download (.",
                extFor(clip.assetContentType),
                ")"
              ]
            }
          ),
          clip.caption && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-8 gap-1.5 text-muted-foreground cursor-pointer",
              onClick: onSendToDrafts,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3.5 w-3.5" }),
                " Send to drafts"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-8 gap-1.5 text-muted-foreground cursor-pointer",
              onClick: onCopyCaption,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }),
                " Copy caption"
              ]
            }
          ),
          clip.status !== "dismissed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-8 gap-1.5 text-muted-foreground hover:text-destructive cursor-pointer ml-auto",
              onClick: onDismiss,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" }),
                " Dismiss"
              ]
            }
          )
        ] })
      ] }) })
    }
  );
}

function ClipResults({ workspace }) {
  const {
    activeSource,
    clips,
    sourceMediaUrl,
    renderingClipId,
    renderPct,
    acceptClip,
    dismissClip,
    copyTimecodes,
    copyCaption,
    sendToDrafts,
    renderClipAsset,
    shareClip,
    getShareLink,
    reset
  } = workspace;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8 cursor-pointer", onClick: reset, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold tracking-tight truncate", children: activeSource?.title ?? "Analysis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
          clips ? `${clips.length} clip${clips.length === 1 ? "" : "s"} suggested` : "Loading clips...",
          activeSource?.durationSec ? ` from ${formatDuration(activeSource.durationSec)} of video` : "",
          sourceMediaUrl?.origin === "noirops" ? " — video stored in NoirOps" : sourceMediaUrl?.origin === "platform" ? " — streaming from platform" : ""
        ] })
      ] }),
      activeSource && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Badge,
        {
          variant: "outline",
          className: cn("text-[10px]", SOURCE_STATUS_STYLES[activeSource.status]),
          children: activeSource.status
        }
      )
    ] }),
    activeSource?.errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-red-500/30 bg-red-500/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-red-500 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-red-500", children: "Analysis issue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs mt-1", children: activeSource.errorMessage })
      ] })
    ] }) }),
    !clips ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading clips..."
    ] }) : clips.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-10 w-10 text-muted-foreground/30 mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No clips yet for this source. Run the analysis again with a richer transcript." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: clips.map((clip, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      ClipCard,
      {
        clip,
        index,
        totalDuration: activeSource?.durationSec ?? void 0,
        mediaUrl: sourceMediaUrl?.url ?? null,
        mediaOrigin: sourceMediaUrl?.origin ?? null,
        renderingClipId: renderingClipId ?? null,
        renderPct,
        shareLink: getShareLink(clip._id),
        onAccept: () => void acceptClip(clip),
        onSendToDrafts: () => void sendToDrafts(clip),
        onCopyTimecodes: () => copyTimecodes(clip),
        onDismiss: () => void dismissClip(clip),
        onCopyCaption: () => copyCaption(clip),
        onRender: () => void renderClipAsset(clip),
        onShare: () => void shareClip(clip)
      },
      clip._id
    )) })
  ] });
}

function SourceList({ workspace }) {
  const { sources, openSource, removeSource } = workspace;
  if (!sources) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
      " Loading..."
    ] });
  }
  if (sources.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10 border border-dashed border-border/60 rounded-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-8 w-8 text-muted-foreground/30 mx-auto mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No analyses yet. Your first video's clips will appear here." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: sources.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 6 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.15, delay: Math.min(i * 0.03, 0.2) },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/50 hover:border-border transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium truncate max-w-[320px]", children: s.title }),
            s.platform && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-[10px] capitalize", children: s.platform }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Badge,
              {
                variant: "outline",
                className: cn("text-[10px]", SOURCE_STATUS_STYLES[s.status] ?? ""),
                children: s.status
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 text-[10px] text-muted-foreground", children: [
            s.durationSec ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
              " ",
              formatDuration(s.durationSec)
            ] }) : null,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.sourceKind }),
            s.fileSizeBytes ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              (s.fileSizeBytes / (1024 * 1024)).toFixed(1),
              " MB"
            ] }) : null,
            s.authorName ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "by ",
              s.authorName
            ] }) : null
          ] }),
          s.status === "failed" && s.errorMessage && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-red-500/80 mt-1 line-clamp-1", children: s.errorMessage })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "h-7 text-xs gap-1 cursor-pointer",
              onClick: () => openSource(s._id),
              disabled: s.status !== "ready",
              children: "View clips"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "icon",
              className: "h-7 w-7 text-destructive cursor-pointer",
              onClick: () => void removeSource(s._id),
              title: "Delete source and clips",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" })
            }
          )
        ] })
      ] }) })
    },
    s._id
  )) });
}

function AIVideoClipping() {
  const workspace = useClipWorkspace();
  if (workspace.activeSourceId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(ClipResults, { workspace });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-4xl mx-auto space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-5 w-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight", children: "AI Video Clipping" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-[9px] px-1.5 py-0 h-4", children: "Beta" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-sm mt-1", children: "Turn long-form video into publish-ready shorts. Upload a video from your device, paste a link from any major platform, or bring a transcript — the AI finds the strongest moments and suggests edits and transitions." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ClipInputForm, { workspace }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-semibold tracking-tight mb-2 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "h-4 w-4 text-muted-foreground" }),
        " Recent analyses"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SourceList, { workspace })
    ] })
  ] });
}

export { AIVideoClipping as default };
