/**
 * Video platform helpers for the AI clipping feature.
 * Pure TypeScript — safe to import in the browser, in Convex actions and in unit tests.
 * Exports: VIDEO_PLATFORMS, detectPlatform, extractVideoId, formatDuration,
 * formatTimecode, EDIT_TYPES, TRANSITIONS, MOMENT_TYPES, momentTypeStyle,
 * momentTypeLabel, scoreTone, CLIP_TARGET_PLATFORMS.
 */
export const VIDEO_PLATFORMS = [
    {
        id: "youtube",
        name: "YouTube",
        color: "text-red-500",
        hostPatterns: [/youtube\.com$/i, /youtu\.be$/i, /youtube-nocookie\.com$/i],
    },
    {
        id: "tiktok",
        name: "TikTok",
        color: "text-cyan-500",
        hostPatterns: [/tiktok\.com$/i],
    },
    {
        id: "instagram",
        name: "Instagram",
        color: "text-pink-500",
        hostPatterns: [/instagram\.com$/i],
    },
    {
        id: "twitter",
        name: "X / Twitter",
        color: "text-sky-500",
        hostPatterns: [/twitter\.com$/i, /x\.com$/i],
    },
    {
        id: "facebook",
        name: "Facebook",
        color: "text-blue-600",
        hostPatterns: [/facebook\.com$/i, /fb\.watch$/i],
    },
    {
        id: "vimeo",
        name: "Vimeo",
        color: "text-sky-400",
        hostPatterns: [/vimeo\.com$/i],
    },
    {
        id: "twitch",
        name: "Twitch",
        color: "text-violet-500",
        hostPatterns: [/twitch\.tv$/i],
    },
    {
        id: "linkedin",
        name: "LinkedIn",
        color: "text-blue-500",
        hostPatterns: [/linkedin\.com$/i],
    },
    {
        id: "reddit",
        name: "Reddit",
        color: "text-orange-500",
        hostPatterns: [/reddit\.com$/i],
    },
    {
        id: "dailymotion",
        name: "Dailymotion",
        color: "text-blue-400",
        hostPatterns: [/dailymotion\.com$/i, /dai\.ly$/i],
    },
    {
        id: "rumble",
        name: "Rumble",
        color: "text-emerald-500",
        hostPatterns: [/rumble\.com$/i],
    },
];
/** Platforms a suggested clip can be targeted at (short-form destinations). */
export const CLIP_TARGET_PLATFORMS = [
    { id: "tiktok", label: "TikTok" },
    { id: "instagram", label: "Instagram Reels" },
    { id: "youtube", label: "YouTube Shorts" },
    { id: "twitter", label: "X / Twitter" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "facebook", label: "Facebook" },
];
/**
 * Detect which social/video platform a URL belongs to.
 * Returns null for strings that aren't plausible URLs at all.
 */
export function detectPlatform(rawUrl) {
    const url = (rawUrl || "").trim();
    if (!url)
        return null;
    let parsed;
    try {
        parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    }
    catch {
        return null;
    }
    if (!parsed.hostname.includes("."))
        return null;
    const host = parsed.hostname.replace(/^www\./i, "");
    for (const platform of VIDEO_PLATFORMS) {
        if (platform.hostPatterns.some((p) => p.test(host))) {
            return {
                id: platform.id,
                name: platform.name,
                color: platform.color,
                confidence: "exact",
                videoId: extractVideoId(platform.id, parsed),
            };
        }
    }
    return { id: "link", name: "Link", color: "text-muted-foreground", confidence: "unknown" };
}
/** Best-effort extraction of the platform's video id (only YouTube is canonical). */
export function extractVideoId(platformId, url) {
    if (platformId === "youtube") {
        if (url.hostname.includes("youtu.be")) {
            const id = url.pathname.split("/").filter(Boolean)[0];
            return id || undefined;
        }
        const v = url.searchParams.get("v");
        if (v)
            return v;
        const m = url.pathname.match(/\/(shorts|embed|live)\/([^/?#]+)/);
        if (m)
            return m[2];
    }
    return undefined;
}
/** `SS` / `MM:SS` / `H:MM:SS` from seconds. */
export function formatDuration(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
        return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
}
/** `HH:MM:SS.mmm` (frame-accurate style, EDL friendly). */
export function formatTimecode(totalSeconds) {
    const clamped = Math.max(0, totalSeconds);
    const h = Math.floor(clamped / 3600);
    const m = Math.floor((clamped % 3600) / 60);
    const s = Math.floor(clamped % 60);
    const ms = Math.round((clamped - Math.floor(clamped)) * 1000);
    return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":") + "." + String(ms).padStart(3, "0");
}
/** Vocabulary the AI picks from when suggesting edits inside a clip. */
export const EDIT_TYPES = [
    { id: "cut", label: "Hard cut", icon: "scissors", description: "Trim dead air, filler or tangents." },
    { id: "zoom", label: "Punch-in", icon: "zoom", description: "Push in to re-engage attention." },
    { id: "caption", label: "Caption emphasis", icon: "text", description: "Highlight key words on screen." },
    { id: "broll", label: "B-roll insert", icon: "arrow", description: "Cover a jump or illustrate a point." },
    { id: "speed", label: "Speed ramp", icon: "zap", description: "Speed up setup, slow down payoff." },
    { id: "audio", label: "Audio fix", icon: "volume", description: "Level, duck or clean the audio." },
    { id: "filter", label: "Color/Look", icon: "filter", description: "Adjust grade or apply a look." },
    { id: "cta", label: "CTA overlay", icon: "sparkles", description: "Overlay a call-to-action." },
];
/** Vocabulary the AI picks from when suggesting transitions between shots. */
export const TRANSITIONS = [
    { id: "jump_cut", label: "Jump cut", description: "Instant cut, keeps raw energy." },
    { id: "whip_pan", label: "Whip pan", description: "Fast camera-style swipe between scenes." },
    { id: "zoom_transition", label: "Zoom transition", description: "Momentum-preserving zoom cut." },
    { id: "glitch", label: "Glitch", description: "Digital stutter, edgy tone." },
    { id: "fade", label: "Fade", description: "Soft dissolve for topic changes." },
    { id: "flash", label: "Flash cut", description: "White-flash accent on a punchline." },
    { id: "match_cut", label: "Match cut", description: "Cut on motion or shape similarity." },
];
export const MOMENT_TYPES = [
    { id: "hook", label: "Hook", color: "bg-red-500/15 text-red-500" },
    { id: "story", label: "Story", color: "bg-blue-500/15 text-blue-500" },
    { id: "insight", label: "Insight", color: "bg-emerald-500/15 text-emerald-500" },
    { id: "humor", label: "Humor", color: "bg-amber-500/15 text-amber-500" },
    { id: "emotional", label: "Emotional", color: "bg-pink-500/15 text-pink-500" },
    { id: "data", label: "Data/Proof", color: "bg-violet-500/15 text-violet-500" },
    { id: "demo", label: "Demo", color: "bg-cyan-500/15 text-cyan-500" },
    { id: "call_to_action", label: "CTA", color: "bg-orange-500/15 text-orange-500" },
];
export function momentTypeStyle(id) {
    return MOMENT_TYPES.find((m) => m.id === id)?.color ?? "bg-muted text-muted-foreground";
}
export function momentTypeLabel(id) {
    return MOMENT_TYPES.find((m) => m.id === id)?.label ?? "Moment";
}
/** Deterministic score → Tailwind classes (avoids dynamic class names). */
export function scoreTone(score) {
    if (score >= 85)
        return { text: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/30", label: "Exceptional" };
    if (score >= 70)
        return { text: "text-lime-500", bg: "bg-lime-500/10 border-lime-500/30", label: "Strong" };
    if (score >= 55)
        return { text: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30", label: "Good" };
    return { text: "text-muted-foreground", bg: "bg-muted border-border", label: "Filler" };
}
