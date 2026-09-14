/**
 * Browser audio extraction and chunking for local-video transcription.
 * Decodes via AudioContext (any format the browser can play), resamples to
 * 16 kHz mono, chunks on silence boundaries, and encodes WAV parts for the
 * Whisper endpoint. Pure client-side — no ffmpeg needed.
 */
const TARGET_SAMPLE_RATE = 16000;
/** Target chunk length in seconds (safely below Whisper's 25 MB limit). */
export const AUDIO_CHUNK_SECONDS = 420; // 7 minutes
/** Overlap kept between chunks so sentences spanning boundaries stay intact. */
export const AUDIO_CHUNK_OVERLAP = 1.5;
/** Decode a media file to a mono Float32 signal at the file's sample rate. */
export async function decodeAudioFile(file) {
    const AudioCtx = window.AudioContext ||
        window.webkitAudioContext;
    if (!AudioCtx)
        throw new Error("Web Audio is not supported in this browser.");
    const arrayBuffer = await file.arrayBuffer();
    const ctx = new AudioCtx();
    try {
        const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
        // Downmix all channels to mono by averaging.
        const chCount = buffer.numberOfChannels;
        const length = buffer.length;
        const mono = new Float32Array(length);
        for (let ch = 0; ch < chCount; ch++) {
            const data = buffer.getChannelData(ch);
            for (let i = 0; i < length; i++)
                mono[i] += data[i];
        }
        if (chCount > 1) {
            const inv = 1 / chCount;
            for (let i = 0; i < length; i++)
                mono[i] *= inv;
        }
        return { samples: mono, sampleRate: buffer.sampleRate };
    }
    finally {
        void ctx.close().catch(() => undefined);
    }
}
/** Linear resampler — high enough quality for speech-to-text input. */
export function resampleTo16kMono(samples, sampleRate) {
    if (sampleRate === TARGET_SAMPLE_RATE)
        return samples;
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
/**
 * Find a silence point near `targetSec` (±4s window) so chunks split between
 * sentences rather than mid-word. Falls back to the target when the audio is
 * continuously loud (e.g. music).
 */
export function findSilenceSplit(samples, sampleRate, targetSec) {
    const targetIdx = Math.min(samples.length - 1, Math.round(targetSec * sampleRate));
    const window = Math.round(4 * sampleRate);
    const win = Math.round(0.02 * sampleRate); // 20 ms RMS window
    const from = Math.max(0, targetIdx - window);
    const to = Math.min(samples.length - win, targetIdx + window);
    let bestIdx = -1;
    let bestRms = Infinity;
    for (let i = from; i < to; i += win) {
        let sum = 0;
        for (let j = i; j < i + win; j++)
            sum += samples[j] * samples[j];
        const rms = Math.sqrt(sum / win);
        if (rms < bestRms) {
            bestRms = rms;
            bestIdx = i + Math.floor(win / 2);
        }
    }
    // Only prefer the silence point if it is meaningfully quiet.
    if (bestIdx >= 0 && bestRms < 0.02)
        return bestIdx / sampleRate;
    return targetSec;
}
/** Encode a Float32 slice (16 kHz mono) as a 16-bit PCM WAV Blob. */
export function encodeWavBlob(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeStr = (offset, str) => {
        for (let i = 0; i < str.length; i++)
            view.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    writeStr(36, "data");
    view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
        offset += 2;
    }
    return new Blob([view], { type: "audio/wav" });
}
/**
 * Slice a decoded 16 kHz signal into WAV chunks: `AUDIO_CHUNK_SECONDS` long,
 * split on silence, with a small overlap so words at boundaries survive.
 */
export function chunkAudioSamples(samples) {
    const totalSec = samples.length / TARGET_SAMPLE_RATE;
    if (totalSec <= AUDIO_CHUNK_SECONDS) {
        return [
            {
                blob: encodeWavBlob(samples, TARGET_SAMPLE_RATE),
                startSec: 0,
                endSec: totalSec,
            },
        ];
    }
    const chunks = [];
    let cursor = 0; // seconds
    while (cursor < totalSec - 0.5) {
        const target = cursor + AUDIO_CHUNK_SECONDS;
        const splitSec = target >= totalSec ? totalSec : findSilenceSplit(samples, TARGET_SAMPLE_RATE, target);
        const startSample = Math.max(0, Math.round((chunks.length === 0 ? 0 : cursor - AUDIO_CHUNK_OVERLAP) * TARGET_SAMPLE_RATE));
        const endSample = Math.min(samples.length, Math.round(splitSec * TARGET_SAMPLE_RATE));
        if (endSample <= startSample)
            break;
        const slice = samples.subarray(startSample, endSample);
        chunks.push({
            blob: encodeWavBlob(slice, TARGET_SAMPLE_RATE),
            startSec: startSample / TARGET_SAMPLE_RATE,
            endSec: endSample / TARGET_SAMPLE_RATE,
        });
        cursor = splitSec;
        if (splitSec >= totalSec)
            break;
    }
    return chunks;
}
/** One-shot helper: File → decoded, resampled, chunked WAV parts. */
export async function prepareAudioChunks(file) {
    const { samples, sampleRate } = await decodeAudioFile(file);
    const mono16k = resampleTo16kMono(samples, sampleRate);
    const durationSec = mono16k.length / TARGET_SAMPLE_RATE;
    return { chunks: chunkAudioSamples(mono16k), durationSec };
}
