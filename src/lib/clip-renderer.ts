/**
 * Client-side clip rendering: cut a short segment out of a source video in
 * the browser (no server transcoding), capture with canvas + MediaRecorder,
 * and return the encoded blob for upload to Convex storage. Also provides
 * download helpers used by the app and the public share page. Requires no
 * external dependencies.
 */

export interface RenderedClip {
  blob: Blob;
  contentType: string;
  width: number;
  height: number;
}

export interface RenderClipOptions {
  /** Playable URL of the source video (Convex storage or platform media). */
  sourceUrl: string;
  startSec: number;
  endSec: number;
  /** Optional target aspect ratio like "9:16", "1:1", "16:9" (center-crop). */
  aspectRatio?: string | null;
  /** Optional on-screen hook text drawn over the first frames. */
  overlayText?: string | null;
  /** 0–100 progress callback while the clip renders in real time. */
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
}

const PREFERRED_MIME_TYPES = [
  'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
  "video/mp4",
  'video/webm;codecs="vp9,opus"',
  'video/webm;codecs="vp8,opus"',
  "video/webm",
];

const MAX_CANVAS_EDGE = 1280;

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: VideoFrameRequestCallback) => number;
  captureStream?: () => MediaStream;
};

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    throw new Error(
      "This browser cannot render clips in-app. Download the source video and cut the timecodes in your editor instead."
    );
  }
  for (const type of PREFERRED_MIME_TYPES) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type;
    } catch {
      // Keep probing.
    }
  }
  return "video/webm";
}

function parseAspectRatio(aspect?: string | null): number | null {
  if (!aspect) return null;
  const m = aspect.match(/(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)/i);
  if (!m) return null;
  const rw = parseFloat(m[1]!);
  const rh = parseFloat(m[2]!);
  if (!(rw > 0) || !(rh > 0)) return null;
  return rw / rh;
}

/** Output canvas size: center-crop to the target ratio, capped for perf. */
function targetDims(
  vw: number,
  vh: number,
  aspect?: string | null
): { w: number; h: number } {
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
    h: Math.max(2, Math.round(ch / 2) * 2),
  };
}

function waitForEvent(
  el: HTMLElement,
  event: string,
  timeoutMs: number,
  failureMessage: string
): Promise<void> {
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

/** Center-crop draw of the current video frame onto the canvas. */
function drawFrame(
  g: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  w: number,
  h: number
): void {
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

/** Draw the clip hook as a dark band with white text at the top of the frame. */
function drawOverlay(
  g: CanvasRenderingContext2D,
  text: string,
  w: number,
  h: number
): void {
  void h;
  const fontSize = Math.max(15, Math.round(w * 0.042));
  g.font = `600 ${fontSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const maxWidth = w * 0.86;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
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

/**
 * Render the [startSec, endSec) window of `sourceUrl` in the browser.
 * Runs at 1x realtime (audio must be captured live), so a 30s clip takes
 * ~30s; callers should surface onProgress.
 */
export async function renderClip(options: RenderClipOptions): Promise<RenderedClip> {
  const { sourceUrl, startSec, endSec, aspectRatio, overlayText, onProgress, signal } = options;
  if (!(endSec > startSec)) throw new Error("Invalid clip timecodes.");
  const mimeType = pickMimeType();
  const duration = endSec - startSec;

  const video = document.createElement("video") as VideoWithFrameCallback;
  video.crossOrigin = "anonymous";
  video.muted = true; // captureStream still carries the audio track
  video.playsInline = true;
  video.preload = "auto";
  video.src = sourceUrl;

  const canvas = document.createElement("canvas");
  const ctx2d = canvas.getContext("2d", { alpha: false });
  if (!ctx2d) throw new Error("Canvas is unavailable in this browser.");

  let recorder: MediaRecorder | null = null;
  let canvasStream: MediaStream | null = null;
  let stoppedByWatcher = false;

  const teardown = () => {
    stoppedByWatcher = true;
    try {
      if (recorder && recorder.state !== "inactive") recorder.stop();
    } catch {
      // Already stopped.
    }
    try {
      video.pause();
    } catch {
      // Not playing.
    }
    canvasStream?.getTracks().forEach((t) => t.stop());
    video.removeAttribute("src");
    try {
      video.load();
    } catch {
      // No-op.
    }
  };

  if (signal) {
    signal.addEventListener("abort", teardown, { once: true });
  }

  try {
    await waitForEvent(video, "loadedmetadata", 30000, "Loading the source video timed out.");

    const { w, h } = targetDims(video.videoWidth, video.videoHeight, aspectRatio);
    canvas.width = w;
    canvas.height = h;

    canvasStream = canvas.captureStream(30);
    const tracks = [...canvasStream.getVideoTracks()];
    try {
      const audio = video.captureStream?.() ?? null;
      const audioTrack = audio?.getAudioTracks()[0];
      if (audioTrack) tracks.push(audioTrack);
    } catch {
      // Audio capture unsupported — render video-only.
    }
    const stream = new MediaStream(tracks);

    recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
    const parts: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) parts.push(e.data);
    };
    const stopped = new Promise<void>((resolve) => {
      recorder!.onstop = () => resolve();
    });

    // Seek to the clip start and paint the first frame before recording.
    video.currentTime = startSec;
    await waitForEvent(video, "seeked", 15000, "Seeking in the source video timed out.");
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
        // Already stopped.
      }
      try {
        video.pause();
      } catch {
        // Not playing.
      }
    };

    // Frame pump: draw every frame at native cadence with the hook overlay.
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

    // Watcher: progress + end condition + safety timeout (realtime render).
    const startedAt = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        if (stoppedByWatcher) {
          resolve();
          return;
        }
        const elapsed = video.currentTime - startSec;
        onProgress?.(Math.min(99, Math.max(1, Math.round((elapsed / duration) * 100))));
        if (video.currentTime >= endSec - 0.03 || video.ended) {
          stop();
          resolve();
          return;
        }
        if (performance.now() - startedAt > (duration + 15) * 1000) {
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

// ── Download / filename helpers ─────────────────────────────

export function extFor(contentType?: string | null): string {
  if (!contentType) return "mp4";
  if (contentType.includes("webm")) return "webm";
  return "mp4";
}

export function clipFilename(title: string, contentType?: string | null): string {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "clip";
  return `${slug}.${extFor(contentType)}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
