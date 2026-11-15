import "server-only";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Structured practice AI calls for transcription, evaluation and next-question generation.
 * Server-only — provider keys never reach the browser. Every call is timed and logged to PracticeAiLog.
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
const practiceOpenAiKey = () => process.env.PRACTICE_OPENAI_API_KEY;
type Provider = "gemini" | "openai";
const provider = (): Provider => process.env.PRACTICE_AI_PROVIDER === "openai" ? "openai" : "gemini";

export function isAiConfigured() {
  return Boolean(provider() === "openai" ? practiceOpenAiKey() : practiceKey());
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
  if (provider() === "openai") return [process.env.PRACTICE_OPENAI_MODEL || "gpt-4o-mini"];
  const primary = process.env.PRACTICE_GEMINI_MODEL || process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const fallbacks = (process.env.PRACTICE_GEMINI_FALLBACK_MODELS ?? DEFAULT_FALLBACKS).split(",").map((m) => m.trim()).filter((m) => m && m !== primary);
  return [primary, ...fallbacks];
}

function openAiSchema(schema: Schema): Record<string, unknown> {
  const description = "description" in schema && schema.description ? { description: schema.description } : {};
  switch (schema.type) {
    case "STRING":
      return { type: "string", ...("enum" in schema && schema.enum ? { enum: schema.enum } : {}), ...description };
    case "INTEGER":
      return { type: "integer", ...description };
    case "NUMBER":
      return { type: "number", ...description };
    case "BOOLEAN":
      return { type: "boolean", ...description };
    case "ARRAY":
      return { type: "array", items: openAiSchema(schema.items), ...description };
    case "OBJECT":
      return {
        type: "object",
        properties: Object.fromEntries(Object.entries(schema.properties).map(([key, value]) => [key, openAiSchema(value)])),
        required: schema.required ?? Object.keys(schema.properties),
        additionalProperties: false,
        ...description,
      };
  }
}

async function checkOpenAiResponse(res: Response) {
  if (res.status === 401 || res.status === 403) {
    console.error("Practice OpenAI rejected:", res.status, (await res.text().catch(() => "")).slice(0, 300));
    throw new AiError("auth");
  }
  if (res.status === 429) throw new AiError("rate_limited");
  if (res.status >= 500) throw new AiError("unavailable");
  if (!res.ok) {
    console.error("Practice OpenAI bad request:", res.status, (await res.text().catch(() => "")).slice(0, 300));
    throw new AiError("unavailable");
  }
}

async function onceOpenAi(opts: CallOptions<unknown>, signal: AbortSignal, model: string) {
  const key = practiceOpenAiKey();
  if (!key) throw new AiError("not_configured");
  try {
    const textParts = opts.parts.filter((part): part is { text: string } => "text" in part).map((part) => part.text);
    const audioParts = opts.parts.filter((part): part is { inlineData: { mimeType: string; data: string } } => "inlineData" in part);
    for (const [index, part] of audioParts.entries()) {
      const upload = new FormData();
      upload.set("model", process.env.PRACTICE_OPENAI_TRANSCRIPTION_MODEL || "gpt-4o-mini-transcribe");
      upload.set("file", new Blob([Buffer.from(part.inlineData.data, "base64")], { type: part.inlineData.mimeType }), `practice-${index + 1}.wav`);
      const transcribed = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        signal,
        headers: { Authorization: `Bearer ${key}` },
        body: upload,
      });
      await checkOpenAiResponse(transcribed);
      const result = await transcribed.json().catch(() => null) as { text?: unknown } | null;
      if (typeof result?.text !== "string") throw new AiError("invalid_output");
      textParts.push(`Transcribed learner audio (verbatim):\n${result.text}`);
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: textParts.join("\n\n") },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "practice_evaluation",
            strict: true,
            schema: openAiSchema(opts.schema),
          },
        },
        temperature: opts.temperature ?? 0.2,
        max_completion_tokens: opts.maxOutputTokens ?? 4096,
      }),
    });
    await checkOpenAiResponse(res);
    const body = await res.json().catch(() => null) as { choices?: { message?: { content?: unknown } }[] } | null;
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new AiError("invalid_output");
    let raw: unknown;
    try {
      raw = JSON.parse(content);
    } catch {
      throw new AiError("invalid_output");
    }
    const parsed = opts.parse(raw);
    if (parsed === null) throw new AiError("invalid_output");
    return parsed;
  } catch (error) {
    if (error instanceof AiError) throw error;
    throw new AiError(signal.aborted ? "timeout" : "unavailable");
  }
}

async function onceGemini(opts: CallOptions<unknown>, signal: AbortSignal, model: string) {
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
  } catch (error) {
    console.error("Practice Gemini network failure:", error instanceof Error ? error.name : "Unknown error");
    throw new AiError(signal.aborted ? "timeout" : "unavailable");
  }
  if (res.status === 401 || res.status === 403) {
    console.error("Practice AI rejected:", res.status, (await res.text().catch(() => "")).slice(0, 300));
    throw new AiError("auth");
  }
  if (res.status === 429) throw new AiError("rate_limited");
  if (res.status >= 500) {
    console.error("Practice Gemini upstream error:", res.status, res.headers.get("x-goog-request-id"));
    throw new AiError("unavailable");
  }
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

async function once(opts: CallOptions<unknown>, signal: AbortSignal, model: string) {
  return provider() === "openai"
    ? onceOpenAi(opts, signal, model)
    : onceGemini(opts, signal, model);
}

async function onceWithTimeout(opts: CallOptions<unknown>, parentSignal: AbortSignal, model: string, timeoutMs: number) {
  const attemptController = new AbortController();
  const abortFromParent = () => attemptController.abort();
  if (parentSignal.aborted) attemptController.abort();
  else parentSignal.addEventListener("abort", abortFromParent, { once: true });
  const timer = setTimeout(() => attemptController.abort(), timeoutMs);
  try {
    return await once(opts, attemptController.signal, model);
  } catch (error) {
    if (attemptController.signal.aborted) throw new AiError("timeout");
    throw error;
  } finally {
    clearTimeout(timer);
    parentSignal.removeEventListener("abort", abortFromParent);
  }
}

/**
 * Runs one structured call. Transient failures can move to the backup model while time remains; a timeout is not
 * retried, so the learner is never kept waiting through a second full-length request.
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
      const elapsedMs = performance.now() - started;
      const remainingBeforeAttempt = budget - elapsedMs;
      if (controller.signal.aborted || remainingBeforeAttempt <= 0) {
        lastError = new AiError("timeout");
        break;
      }
      const modelsLeft = chain.length - modelIndex;
      const modelBudget = modelsLeft > 1
        ? Math.floor(remainingBeforeAttempt / modelsLeft)
        : remainingBeforeAttempt;
      try {
        const data = (await onceWithTimeout(opts as CallOptions<unknown>, controller.signal, chain[modelIndex], modelBudget)) as T;
        const ms = performance.now() - started;
        logAi(opts.kind, ms, true);
        return { data, ms };
      } catch (e) {
        lastError = e instanceof AiError ? e : new AiError("unavailable");
        // A per-model timeout must not consume the full route budget; give the next model its reserved share.
        const remainingMs = budget - (performance.now() - started);
        if (
          (lastError.kind === "timeout" || lastError.kind === "rate_limited" || lastError.kind === "unavailable" || lastError.kind === "invalid_output") &&
          modelIndex < chain.length - 1 &&
          !controller.signal.aborted &&
          remainingMs > 12_000
        ) {
          console.warn(`Practice AI ${opts.kind} switching models after ${lastError.kind}.`);
          modelIndex++;
          continue;
        }
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
