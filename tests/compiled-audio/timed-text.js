/**
 * SRT/VTT construction and manipulation helpers for the AI clipping pipeline.
 * Pure TypeScript — safe in the browser, in Convex actions and in unit tests.
 * Complements src/lib/transcript.ts (parsing) — nothing there is modified.
 */
/** `HH:MM:SS,mmm` (SRT style). */
export function toSrtTimestamp(seconds) {
    const s = Math.max(0, seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    const ms = Math.round((s - Math.floor(s)) * 1000);
    return (`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},` +
        `${String(Math.min(999, ms)).padStart(3, "0")}`);
}
/** `HH:MM:SS.mmm` (WebVTT style). */
export function toVttTimestamp(seconds) {
    return toSrtTimestamp(seconds).replace(",", ".");
}
const FULL_STAMP = /^(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})$/;
const SHORT_STAMP = /^(\d{1,2}):(\d{2})[.,](\d{1,3})$/;
/** Parse an SRT/VTT timestamp (`H:MM:SS,mmm` or `MM:SS.mmm`) into seconds. Returns NaN when invalid. */
export function timestampToSeconds(stamp) {
    const t = stamp.trim();
    const full = t.match(FULL_STAMP);
    if (full) {
        return (Number(full[1]) * 3600 + Number(full[2]) * 60 + Number(full[3]) + Number(full[4].padEnd(3, "0")) / 1000);
    }
    const short = t.match(SHORT_STAMP);
    if (short) {
        return Number(short[1]) * 60 + Number(short[2]) + Number(short[3].padEnd(3, "0")) / 1000;
    }
    return NaN;
}
/**
 * Shift every timestamp in an SRT/VTT document forward by `offsetSec`.
 * Used when audio is transcribed in chunks (each Whisper call restarts at
 * 00:00) and when caption windows start at a non-zero offset.
 */
export function offsetTimedText(raw, offsetSec) {
    if (!offsetSec || offsetSec <= 0)
        return raw;
    const isVtt = /^WEBVTT/i.test(raw.trim());
    const stamp = isVtt ? toVttTimestamp : toSrtTimestamp;
    return raw.replace(/(\d{1,2}:\d{2}(?::\d{2})?[.,]\d{1,3})/g, (m) => {
        const total = timestampToSeconds(m);
        if (!Number.isFinite(total))
            return m;
        return stamp(total + offsetSec);
    });
}
function cleanSegmentText(text) {
    return text.replace(/\s+/g, " ").trim();
}
/** Build a complete SRT document from segments whose times are already global. */
export function buildSrtFromSegments(segments) {
    const blocks = [];
    let index = 1;
    for (const seg of segments) {
        const text = cleanSegmentText(seg.text);
        if (!text)
            continue;
        blocks.push(`${index}\n${toSrtTimestamp(seg.start)} --> ${toSrtTimestamp(seg.end)}\n${text}`);
        index += 1;
    }
    return blocks.join("\n\n") + (blocks.length > 0 ? "\n" : "");
}
/** Build a complete WebVTT document from segments whose times are already global. */
export function buildVttFromSegments(segments) {
    const blocks = ["WEBVTT"];
    for (const seg of segments) {
        const text = cleanSegmentText(seg.text);
        if (!text)
            continue;
        blocks.push(`${toVttTimestamp(seg.start)} --> ${toVttTimestamp(seg.end)}\n${text}`);
    }
    return blocks.join("\n\n") + "\n";
}
/**
 * Convert a YouTube timedtext JSON3 payload into segments.
 * Shape: { events: [ { tStartMs, dDurationMs, segs: [ { utf8 } ] } ] }
 * Returns [] for anything unparseable — the caller falls back gracefully.
 */
export function youtubeJson3ToSegments(json) {
    try {
        const data = JSON.parse(json);
        if (!Array.isArray(data.events))
            return [];
        const segments = [];
        for (const ev of data.events) {
            if (typeof ev.tStartMs !== "number")
                continue;
            const text = (ev.segs ?? [])
                .map((s) => s.utf8 ?? "")
                .join("")
                .replace(/\s+/g, " ")
                .trim();
            if (!text)
                continue;
            const start = ev.tStartMs / 1000;
            const end = typeof ev.dDurationMs === "number" ? start + ev.dDurationMs / 1000 : start + 4;
            segments.push({ start, end, text });
        }
        return segments;
    }
    catch {
        return [];
    }
}
