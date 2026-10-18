import "server-only";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Structured (JSON-schema) Gemini calls for Practice: transcription, evaluation and next-question generation.
 * Server-only — the API key never reaches the browser. Every call is timed and logged to PracticeAiLog for the
 * admin performance dashboard.
 */

const DEFAULT_MODEL = "gemini-3.8-flash";
/** Verified to accept audio and JSON schemas with this API. */
const DEFAULT_FALLBACKS = "gemini-3.1-flash-lite";

export type AiKind = "interview_turn" | "interview_report" | "speaking_turn" | "speaking_report" | "gd_segment" | "gd_judge";
export type AiErrorKind = "not_configured" | "timeout" | "unavailable" | "rate_limited" | "auth" | "invalid_output";

export class AiError extends Error {
  constructor(public kind: AiErrorKind) {
    super(`Practice AI ${kind}`);
  }
}

/** Practice can use its own key, so enabling it does not switch the site's AI chat (MyBuddy) over to Gemini. */
const practiceKey = () => process.env.PRACTICE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export function isAiConfigured() {
  return Boolean(practiceKey());
}

export type AiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

/** Gemini's OpenAPI-subset schema. */
export type Schema =
  | { type: "STRING"; enum?: string[]; description?: string }
  | { type: "INTEGER" | "NUMBER" | "BOOLEAN"; description?: string }
  | { type: "ARRAY"; items: Schema; maxItems?: number; description?: string }
  | { type: "OBJECT"; properties: Record<string, Schema>; required?: string[]; description?: string };

export const S = {
  str: (description?: string): Schema => ({ type: "STRING", ...(description ? { description } : {}) }),
  int: (description?: string): Schema => ({ type: "INTEGER", ...(description ? { description } : {}) }),
  bool: (description?: string): Schema => ({ type: "BOOLEAN", ...(description ? { description } : {}) }),
  /** Arrays are always bounded: repetitive audio (tongue twisters) can otherwise send the model into an output loop. */
  arr: (items: Schema, description?: string, maxItems = 8): Schema => ({ type: "ARRAY", items, maxItems, ...(description ? { description } : {}) }),
  obj: (properties: Record<string, Schema>, description?: string): Schema => ({ type: "OBJECT", properties, required: Object.keys(properties), ...(description ? { description } : {}) }),
  oneOf: (values: string[], description?: string): Schema => ({ type: "STRING", enum: values, ...(description ? { description } : {}) }),
};

export function logAi(kind: AiKind, ms: number, ok: boolean, error?: AiErrorKind) {
  const write = () => prisma.practiceAiLog.create({ data: { kind, ms: Math.round(ms), ok, error } }).catch(() => {});
  try {
    after(write);
  } catch {
    // Outside a request (scripts, tests): write directly.
    void write();
  }
}

type CallOptions<T> = {
  kind: AiKind;
  system: string;
  parts: AiPart[];
  schema: Schema;
  /** Turns raw JSON into a typed value, or null when the output is unusable. */
  parse: (value: unknown) => T | null;
  timeoutMs?: number;
  /** Thinking tokens: 0 for per-turn work (latency matters), more for end-of-session reports. */
  thinking?: number;
  temperature?: number;
  maxOutputTokens?: number;
};

/** Primary model, then fallbacks used only when a model is rate-limited (quotas are per model). */
function models() {
  const primary = process.env.PRACTICE_GEMINI_MODEL || process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const fallbacks = (process.env.PRACTICE_GEMINI_FALLBACK_MODELS ?? DEFAULT_FALLBACKS).split(",").map((m) => m.trim()).filter((m) => m && m !== primary);
  return [primary, ...fallbacks];
}

async function once(opts: CallOptions<unknown>, signal: AbortSignal, model: string) {
  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", "x-goog-api-key": practiceKey()! },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: [{ role: "user", parts: opts.parts }],
        generationConfig: {
          // Low temperature keeps scores consistent for similar answers.
          temperature: opts.temperature ?? 0.2,
          maxOutputTokens: opts.maxOutputTokens ?? 4096,
          responseMimeType: "application/json",
          responseSchema: opts.schema,
          thinkingConfig: { thinkingBudget: opts.thinking ?? 0 },
        },
      }),
    });
  } catch {
    throw new AiError(signal.aborted ? "timeout" : "unavailable");
  }
  if (res.status === 401 || res.status === 403) {
    console.error("Practice AI rejected:", res.status, (await res.text().catch(() => "")).slice(0, 300));
    throw new AiError("auth");
  }
  if (res.status === 429) throw new AiError("rate_limited");
  if (res.status >= 500) throw new AiError("unavailable");
  if (!res.ok) {
    console.error("Practice AI bad request:", res.status, (await res.text().catch(() => "")).slice(0, 300));
    throw new AiError("unavailable");
  }
  const body = (await res.json().catch(() => null)) as { candidates?: { content?: { parts?: { text?: string }[] } }[] } | null;
  const text = body?.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new AiError("invalid_output");
  }
  const parsed = opts.parse(raw);
  if (parsed === null) throw new AiError("invalid_output");
  return parsed;
}

/**
 * Runs one structured call. A transient failure (rate limit, 5xx, malformed output) is retried once while time
 * remains; a timeout is not, so the learner is never kept waiting twice as long.
 */
export async function generateJson<T>(opts: CallOptions<T>): Promise<{ data: T; ms: number }> {
  if (!isAiConfigured()) throw new AiError("not_configured");
  const budget = opts.timeoutMs ?? 30_000;
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), budget);
  try {
    let lastError: AiError | null = null;
    const chain = models();
    let modelIndex = 0;
    for (let attempt = 0; attempt < 2 + chain.length - 1; attempt++) {
      try {
        const data = (await once(opts as CallOptions<unknown>, controller.signal, chain[modelIndex])) as T;
        const ms = performance.now() - started;
        logAi(opts.kind, ms, true);
        return { data, ms };
      } catch (e) {
        lastError = e instanceof AiError ? e : new AiError("unavailable");
        // Rate-limited: move straight to the next model, which has its own quota.
        if (lastError.kind === "rate_limited" && modelIndex < chain.length - 1) { modelIndex++; continue; }
        const retryable = lastError.kind === "unavailable" || lastError.kind === "invalid_output" || lastError.kind === "rate_limited";
        if (!retryable || controller.signal.aborted || performance.now() - started > budget * 0.5 || attempt >= 1 + modelIndex) break;
        // A rate limit needs a real pause before the retry; other transient errors a short one.
        await new Promise((r) => setTimeout(r, lastError!.kind === "rate_limited" ? 2500 : 400));
      }
    }
    const error = controller.signal.aborted ? new AiError("timeout") : lastError ?? new AiError("unavailable");
    logAi(opts.kind, performance.now() - started, false, error.kind);
    console.error(`Practice AI ${opts.kind} failed: ${error.kind}`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/** Shared rules every evaluator prompt includes, so scoring stays consistent across modules. */
export const RUBRIC = `Scoring rubric (0-100, integers), applied the same way every time:
90-100 Excellent: accurate, well structured, fluent, almost no errors.
80-89 Very good: clear and relevant with minor slips.
70-79 Good: understandable and mostly relevant; noticeable errors or gaps.
60-69 Needs improvement: frequent errors, weak structure or partial relevance.
Below 60: significant improvement needed (very short, off-topic, or hard to follow).
Judge quality over quantity: a longer answer is not better unless it adds relevant substance.
Be a professional evaluator: no exaggerated praise, no "Great job!"-style filler. Feedback must be specific and actionable,
quoting or paraphrasing what the learner actually said. Keep explanations simple; the learner may be a non-native speaker.`;

/** Instruction that stops the model inventing words from silence or noise (observed with a pure tone). */
export const NO_HALLUCINATION = `Transcribe only words actually spoken by a human voice, verbatim, keeping fillers such as "um", "uh", "like".
If the audio is silence, noise, music or a tone, set heardSpeech to false and transcript to "". Never guess or invent words.`;

// ───────────── output coercion helpers (never trust model output shapes) ─────────────

export const clampScore = (v: unknown, fallback = 0) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : fallback;
};
export const asText = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
export const asList = (v: unknown, max = 8, maxLen = 400) => (Array.isArray(v) ? v.map((x) => asText(x, maxLen)).filter(Boolean).slice(0, max) : []);
export const asRecord = (v: unknown): Record<string, unknown> => (v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
export const asObjects = (v: unknown, max = 8): Record<string, unknown>[] => (Array.isArray(v) ? v.map(asRecord).slice(0, max) : []);
