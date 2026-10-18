/**
 * Deterministic speech measurements shared by the browser (live meter, "did we hear you?" check) and the server
 * (which recomputes everything from the uploaded WAV, so scores never depend on numbers the client reports).
 * The AI judges content and language; timing, pace, pauses, fillers and word accuracy are measured here, so the same
 * recording always gets the same numbers.
 */

export const SAMPLE_RATE = 16_000;
const FRAME_MS = 30;
/** A silence this long between two stretches of speech counts as a long pause. */
export const LONG_PAUSE_MS = 1_500;

export type VoiceActivity = {
  durationMs: number;
  /** Time with voice energy. */
  speechMs: number;
  /** From the first to the last voiced frame. */
  spanMs: number;
  firstVoiceMs: number;
  longPauses: number;
  longestPauseMs: number;
};

/** Frame energies (RMS, 0..1) of 16-bit PCM. */
export function frameEnergies(pcm: Int16Array, rate = SAMPLE_RATE) {
  const size = Math.max(1, Math.round((rate * FRAME_MS) / 1000));
  const out = new Float32Array(Math.floor(pcm.length / size));
  for (let f = 0; f < out.length; f++) {
    let sum = 0;
    for (let i = f * size; i < (f + 1) * size; i++) { const v = pcm[i] / 32768; sum += v * v; }
    out[f] = Math.sqrt(sum / size);
  }
  return out;
}

/** Voice activity from frame energies, with a threshold that adapts to the room's noise floor. */
export function voiceActivity(energies: Float32Array): VoiceActivity {
  const n = energies.length;
  const durationMs = n * FRAME_MS;
  if (!n) return { durationMs: 0, speechMs: 0, spanMs: 0, firstVoiceMs: 0, longPauses: 0, longestPauseMs: 0 };
  const sorted = Float32Array.from(energies).sort();
  const floor = sorted[Math.floor(n * 0.15)];
  const threshold = Math.max(0.012, floor * 3);
  // Voiced frames, with 4-frame hangover so consonant gaps inside a word are not counted as silence.
  const voiced = new Uint8Array(n);
  let hang = 0;
  for (let i = 0; i < n; i++) {
    if (energies[i] >= threshold) { voiced[i] = 1; hang = 4; } else if (hang > 0) { voiced[i] = 1; hang--; }
  }
  let first = -1, last = -1, speech = 0, longPauses = 0, longest = 0, gap = 0;
  for (let i = 0; i < n; i++) {
    if (voiced[i]) {
      if (first < 0) first = i;
      else if (gap) {
        const gapMs = gap * FRAME_MS;
        if (gapMs >= LONG_PAUSE_MS) longPauses++;
        longest = Math.max(longest, gapMs);
      }
      gap = 0;
      last = i;
      speech++;
    } else if (first >= 0) gap++;
  }
  // Ignore blips: under 0.4 s of total voice is treated as no speech.
  if (speech * FRAME_MS < 400) return { durationMs, speechMs: 0, spanMs: 0, firstVoiceMs: 0, longPauses: 0, longestPauseMs: 0 };
  return { durationMs, speechMs: speech * FRAME_MS, spanMs: (last - first + 1) * FRAME_MS, firstVoiceMs: first * FRAME_MS, longPauses, longestPauseMs: longest };
}

// ───────────── WAV ─────────────

/** 16-bit mono PCM WAV. */
export function encodeWav(pcm: Int16Array, rate = SAMPLE_RATE): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + pcm.length * 2);
  const v = new DataView(buffer);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + pcm.length * 2, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, pcm.length * 2, true);
  new Int16Array(buffer, 44).set(pcm);
  return buffer;
}

/** Reads a 16-bit mono PCM WAV; null for anything else. */
export function decodeWav(bytes: Uint8Array): { pcm: Int16Array; rate: number } | null {
  if (bytes.length < 44) return null;
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (o: number) => String.fromCharCode(bytes[o], bytes[o + 1], bytes[o + 2], bytes[o + 3]);
  if (tag(0) !== "RIFF" || tag(8) !== "WAVE") return null;
  let offset = 12, rate = 0, ok = false;
  while (offset + 8 <= bytes.length) {
    const id = tag(offset);
    const size = v.getUint32(offset + 4, true);
    const body = offset + 8;
    if (id === "fmt ") {
      const format = v.getUint16(body, true), channels = v.getUint16(body + 2, true), bits = v.getUint16(body + 14, true);
      rate = v.getUint32(body + 4, true);
      ok = format === 1 && channels === 1 && bits === 16 && rate >= 8000 && rate <= 48000;
    } else if (id === "data") {
      if (!ok) return null;
      const len = Math.min(size, bytes.length - body) >> 1;
      const pcm = new Int16Array(len);
      for (let i = 0; i < len; i++) pcm[i] = v.getInt16(body + i * 2, true);
      return { pcm, rate };
    }
    offset = body + size + (size & 1);
  }
  return null;
}

// ───────────── transcript measures ─────────────

export function words(text: string) {
  return (text.toLowerCase().replace(/[’`]/g, "'").match(/[a-z0-9]+(?:'[a-z]+)?/g) ?? []);
}

/** Hesitation sounds always count; discourse words count only as mild "possible fillers". */
const HESITATIONS = new Set(["um", "umm", "uh", "uhh", "er", "erm", "ah", "hmm", "mm"]);
const DISCOURSE = ["you know", "i mean", "basically", "actually", "literally", "kind of", "sort of", "like"];

export type TranscriptMetrics = {
  words: number;
  wpm: number;
  fillers: Record<string, number>;
  fillerCount: number;
  /** Fillers per 100 words. */
  fillerRate: number;
  /** Immediately repeated words ("I I think"). */
  repeats: number;
  /** 0..1 vocabulary variety (moving-window type/token ratio, so long answers are not penalised). */
  variety: number;
  sentences: number;
};

export function transcriptMetrics(transcript: string, speakingMs: number): TranscriptMetrics {
  const list = words(transcript);
  const lower = ` ${list.join(" ")} `;
  const fillers: Record<string, number> = {};
  for (const w of list) if (HESITATIONS.has(w)) fillers[w] = (fillers[w] ?? 0) + 1;
  for (const phrase of DISCOURSE) {
    const n = lower.split(` ${phrase} `).length - 1;
    // "like" is a normal verb too: only count it when it is frequent.
    if (n && (phrase !== "like" || n >= 3)) fillers[phrase] = n;
  }
  const fillerCount = Object.values(fillers).reduce((a, b) => a + b, 0);
  let repeats = 0;
  for (let i = 1; i < list.length; i++) if (list[i] === list[i - 1] && !HESITATIONS.has(list[i])) repeats++;
  const content = list.filter((w) => !HESITATIONS.has(w));
  const window = 40;
  let variety = 0;
  if (content.length <= window) variety = content.length ? new Set(content).size / content.length : 0;
  else {
    let sum = 0, count = 0;
    for (let i = 0; i + window <= content.length; i += 10) { sum += new Set(content.slice(i, i + window)).size / window; count++; }
    variety = sum / count;
  }
  const minutes = speakingMs / 60_000;
  return {
    words: list.length,
    wpm: minutes > 0.05 ? Math.round(list.length / minutes) : 0,
    fillers,
    fillerCount,
    fillerRate: list.length ? Math.round((fillerCount / list.length) * 1000) / 10 : 0,
    repeats,
    variety: Math.round(variety * 100) / 100,
    sentences: (transcript.match(/[.!?](\s|$)/g) ?? []).length || (list.length ? 1 : 0),
  };
}

/**
 * Delivery score from measured numbers only: pace, long pauses, fillers and repetitions. Natural speech is not
 * punished harshly — a few fillers or one pause cost little.
 */
export function deliveryScore(m: TranscriptMetrics, va: VoiceActivity) {
  if (!m.words) return 0;
  let score = 100;
  // Comfortable conversational pace for interviews/presentations: ~110-165 wpm.
  if (m.wpm < 110) score -= Math.min(30, (110 - m.wpm) * 0.5);
  if (m.wpm > 165) score -= Math.min(20, (m.wpm - 165) * 0.4);
  const minutes = Math.max(va.spanMs, 1) / 60_000;
  const pausesPerMin = va.longPauses / Math.max(minutes, 0.5);
  score -= Math.min(20, Math.max(0, pausesPerMin - 1) * 6);
  score -= Math.min(20, Math.max(0, m.fillerRate - 2) * 2.5);
  score -= Math.min(10, m.repeats * 2);
  return Math.max(0, Math.round(score));
}

// ───────────── word accuracy (listen & repeat, tongue twisters, pronunciation) ─────────────

export type Alignment = {
  accuracy: number;
  matched: number;
  missing: string[];
  extra: string[];
  substituted: { expected: string; said: string }[];
  /** Every target word in order, with how it was said. */
  marks: { word: string; status: "ok" | "missing" | "wrong"; said?: string }[];
};

const NUMBER_WORDS: Record<string, string> = { "1": "one", "2": "two", "3": "three", "4": "four", "5": "five", "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten" };
const norm = (w: string) => NUMBER_WORDS[w] ?? w.replace(/'s$/, "s");

/** Word-level edit-distance alignment of what was said against the target text. Hesitations are ignored. */
export function alignWords(target: string, said: string): Alignment {
  const a = words(target).map(norm);
  const b = words(said).filter((w) => !HESITATIONS.has(w)).map(norm);
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  const missing: string[] = [], extra: string[] = [], substituted: { expected: string; said: string }[] = [];
  const marks: Alignment["marks"] = [];
  let matched = 0, i = a.length, j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      if (a[i - 1] === b[j - 1]) { matched++; marks.unshift({ word: a[i - 1], status: "ok" }); }
      else { substituted.unshift({ expected: a[i - 1], said: b[j - 1] }); marks.unshift({ word: a[i - 1], status: "wrong", said: b[j - 1] }); }
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) { missing.unshift(a[i - 1]); marks.unshift({ word: a[i - 1], status: "missing" }); i--; }
    else { extra.unshift(b[j - 1]); j--; }
  }
  const accuracy = a.length ? Math.max(0, Math.round(((matched - extra.length * 0.25) / a.length) * 100)) : 0;
  return { accuracy: Math.min(100, accuracy), matched, missing, extra, substituted, marks };
}

// ───────────── bands ─────────────

export function band(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Very Good";
  if (score >= 70) return "Good";
  if (score >= 60) return "Needs Improvement";
  return "Significant Improvement Needed";
}

export function bandColor(score: number) {
  if (score >= 80) return "#059669";
  if (score >= 70) return "#2563eb";
  if (score >= 60) return "#d97706";
  return "#dc2626";
}
