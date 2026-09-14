/**
 * Transcript parsing for the AI clipping feature.
 * Supports SRT, WebVTT and plain text. Pure TypeScript — no dependencies.
 */
const TIMECODE_LINE = /(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2}):(\d{2})[.,](\d{1,3})/;
const SHORT_TIMECODE_LINE = /(\d{1,2}):(\d{2})[.,](\d{1,3})\s*-->\s*(\d{1,2}):(\d{2})[.,](\d{1,3})/;
function hmsToSeconds(h, m, s, ms) {
    return (Number(h) * 3600 +
        Number(m) * 60 +
        Number(s) +
        Number(ms.padEnd(3, "0")) / 1000);
}
function msToSeconds(m, s, ms) {
    return Number(m) * 60 + Number(s) + Number(ms.padEnd(3, "0")) / 1000;
}
function looksLikeTimedTranscript(text) {
    return TIMECODE_LINE.test(text) || SHORT_TIMECODE_LINE.test(text);
}
/** Parse the `HH:MM:SS,mmm --> HH:MM:SS,mmm` (SRT) or `HH:MM:SS.mmm` (VTT) line. */
function parseTimecodeLine(line) {
    const m = line.match(TIMECODE_LINE);
    if (m) {
        return {
            start: hmsToSeconds(m[1], m[2], m[3], m[4]),
            end: hmsToSeconds(m[5], m[6], m[7], m[8]),
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
    // SRT: blank-line separated blocks (index line optional). VTT: same, with
    // WEBVTT header and NOTE/STYLE blocks to skip.
    const blocks = text
        .replace(/\r\n/g, "\n")
        .split(/\n{2,}/);
    for (const block of blocks) {
        const lines = block.split("\n").filter((l) => l.trim() !== "");
        if (lines.length === 0)
            continue;
        if (/^WEBVTT/i.test(lines[0]))
            continue;
        if (/^(NOTE|STYLE|REGION)\b/i.test(lines[0]))
            continue;
        // The timecode line may be first (VTT w/ cue id absent or SRT without index).
        const tcIndex = lines.findIndex((l) => parseTimecodeLine(l) !== null);
        if (tcIndex === -1)
            continue;
        const tc = parseTimecodeLine(lines[tcIndex]);
        const body = lines
            .slice(tcIndex + 1)
            .join(" ")
            // Strip inline timestamp artifacts some auto-captions emit, plus VTT tags.
            .replace(/<[^>]+>/g, "")
            .replace(/\s+/g, " ")
            .trim();
        if (body)
            cues.push({ start: tc.start, end: tc.end, text: body, hasTiming: true });
    }
    cues.sort((a, b) => a.start - b.start);
    const duration = cues.length > 0 ? cues[cues.length - 1].end : null;
    return {
        cues,
        hasTiming: cues.length > 0,
        duration: duration && duration > 0 ? duration : null,
        wordCount: countWords(cues),
    };
}
function parsePlainText(text) {
    const normalized = text.replace(/\r\n/g, "\n").trim();
    // Split into sentence-ish cues so the AI prompt gets readable chunks.
    const sentences = normalized
        .split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/)
        .map((s) => s.replace(/\s+/g, " ").trim())
        .filter(Boolean);
    const cues = sentences.map((s) => ({ start: 0, end: 0, text: s, hasTiming: false }));
    return { cues, hasTiming: false, duration: null, wordCount: countWords(cues) };
}
function countWords(cues) {
    return cues.reduce((acc, c) => acc + c.text.split(/\s+/).filter(Boolean).length, 0);
}
/**
 * Parse a transcript in SRT, WebVTT or plain-text form.
 * Never throws on messy input — degrades to plain text.
 */
export function parseTranscript(raw) {
    const text = (raw || "").trim();
    if (!text)
        return { cues: [], hasTiming: false, duration: null, wordCount: 0 };
    try {
        if (looksLikeTimedTranscript(text)) {
            const parsed = parseTimed(text);
            if (parsed.cues.length > 0)
                return parsed;
        }
    }
    catch {
        // fall through to plain text
    }
    return parsePlainText(text);
}
/** Flatten cues into a single plain-text transcript for AI analysis. */
export function transcriptToPlain(cues, maxChars) {
    const joined = cues.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
    if (maxChars && joined.length > maxChars) {
        return joined.slice(0, maxChars) + "…";
    }
    return joined;
}
/** Speaker-tagged, timestamped view — gives the AI temporal grounding. */
export function transcriptForPrompt(cues, maxChars) {
    const lines = cues.map((c) => c.hasTiming ? `[${formatTs(c.start)} - ${formatTs(c.end)}] ${c.text}` : c.text);
    let out = lines.join("\n");
    if (maxChars && out.length > maxChars)
        out = out.slice(0, maxChars) + "…";
    return out;
}
function formatTs(seconds) {
    const s = Math.floor(seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
        ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
        : `${m}:${String(sec).padStart(2, "0")}`;
}
/** Text of the cues overlapping [startSec, endSec] — shown as clip context. */
export function excerptForRange(cues, startSec, endSec) {
    const overlapping = cues.filter((c) => (c.hasTiming ? c.end > startSec && c.start < endSec : true));
    const text = overlapping.map((c) => c.text).join(" ").replace(/\s+/g, " ").trim();
    return text.length > 400 ? text.slice(0, 400) + "…" : text;
}
/** Lightweight sniff used to label pasted transcripts in the UI. */
export function transcriptFormat(raw) {
    const text = (raw || "").trim();
    if (/^WEBVTT/i.test(text))
        return "vtt";
    if (looksLikeTimedTranscript(text))
        return "srt";
    return "plain";
}
