import "server-only";
import { randomInt } from "node:crypto";
import { NO_HALLUCINATION, RUBRIC, S, asList, asObjects, asRecord, asText, clampScore, generateJson } from "../ai";
import { alignWords, deliveryScore, transcriptMetrics, type Alignment, type VoiceActivity } from "../speech";
import { mean, type Pair, type PracticeReport, type QaItem } from "../report";
import { band } from "../speech";
import { EXERCISES, MAX_ATTEMPTS_PER_ITEM, TWISTER_MODES, challengeSeconds, exerciseByKind, itemById, type SpeakingExercise, type SpeakingItem, type TwisterMode } from "./content";

export type SpeakingConfig = { kind: string; mode?: TwisterMode; items: string[] };
/** cursor: position of the current item; attempts: tries on it so far; n: attempts in the whole session (the turn index). */
export type SpeakingState = { cursor: number; attempts: number; n: number };

/** Exact-word tasks: what is said is compared with the target text. */
const EXACT = new Set(["repeat", "pronounce", "twister"]);

function sample<T>(list: T[], n: number) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) { const j = randomInt(i + 1); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy.slice(0, n);
}

export function normalizeSpeakingConfig(input: Record<string, unknown>): SpeakingConfig | null {
  const ex = exerciseByKind(String(input.kind ?? ""));
  if (!ex) return null;
  let items: SpeakingItem[];
  if (ex.kind === "comprehension") {
    // Keep one passage's questions together and in order.
    const passages = [...new Set(ex.items.map((i) => i.id.split(".")[1]))];
    const pick = passages[randomInt(passages.length)];
    items = ex.items.filter((i) => i.id.split(".")[1] === pick);
  } else if (ex.kind === "fluency" && typeof input.focus === "string" && ex.items.some((i) => i.focus === input.focus)) {
    items = sample(ex.items.filter((i) => i.focus === input.focus), ex.perSession);
  } else items = sample(ex.items, ex.perSession);
  const mode = ex.kind === "twister" ? (TWISTER_MODES.find((m) => m.id === input.mode)?.id ?? "practice") : undefined;
  return { kind: ex.kind, ...(mode ? { mode } : {}), items: items.map((i) => i.id) };
}

export const speakingTitle = (config: SpeakingConfig) => {
  const ex = exerciseByKind(config.kind)!;
  const mode = config.mode ? TWISTER_MODES.find((m) => m.id === config.mode)?.label : null;
  return mode ? `${ex.title} · ${mode}` : ex.title;
};

/** What the learner must say this attempt (twister modes repeat the phrase). */
export function targetFor(config: SpeakingConfig, item: SpeakingItem) {
  if (!item.target) return undefined;
  const reps = config.mode ? TWISTER_MODES.find((m) => m.id === config.mode)!.reps : 1;
  return Array.from({ length: reps }, () => item.target).join(" ");
}

export type SpeakingEvaluation = {
  scores: Record<string, number>;
  overall: number;
  feedback: string;
  corrections: Pair[];
  words: { word: string; score: number; issue: string }[];
  tips: string[];
  better: string;
  alignment?: Alignment;
  challenge?: { limit: number; taken: number; passed: boolean };
};

function taskInstructions(ex: SpeakingExercise, item: SpeakingItem, target: string | undefined, strict: boolean) {
  switch (ex.kind) {
    case "repeat": return `The learner heard and must repeat exactly: "${target}". Judge pronunciation, rhythm and clarity of each word. In "words", score every target word they mispronounced or struggled with (skip words that were fine).`;
    case "pronounce": return `The learner reads these words aloud, one after another: ${item.guide!.map((g) => `${g.word} /${g.ipa}/`).join(", ")}. In "words", give EVERY target word a pronunciation score and, if below 85, the specific issue (stress, a sound, a dropped syllable). Accept standard Indian, British and American English pronunciations as correct.`;
    case "twister": return `Tongue twister${target !== item.target ? " (said repeatedly)" : ""}: "${target}". Focus sounds: ${item.focus}. ${strict ? "Be strict: every sound must be clear." : "Judge clarity while speaking at speed."} In "words", list words that were mispronounced or slurred.`;
    case "describe": return `Image description task. The picture actually shows: ${item.reference}\nScore "observation" on how many correct details they described (and penalise details not in the picture). Score structure on logical order (overall scene, then details, then feelings).`;
    case "story": return `Storytelling task: "${item.display}". ${item.scene ? `The picture shows: ${item.reference}` : item.reference}\nScore creativity, coherence (a clear beginning, problem and ending) and structure.`;
    case "listen": return `The learner only heard (did not read) this question: "${item.display}". Score comprehension on whether they understood the question and relevance on how directly they answered it.`;
    case "comprehension": return `Listening comprehension. ${item.reference}\nQuestion: "${item.display}". Score comprehension on factual correctness against the expected answer.`;
    case "grammar": return `Spoken grammar practice. Prompt: "${item.display}". Target structure: ${item.focus}. List EVERY grammar mistake in corrections with a one-line simple reason (e.g. "Use past tense because the action happened yesterday").`;
    case "fluency": return `Fluency task: "${item.display}" (${item.seconds} seconds). Judge flow, sentence completion, organisation and relevance. Fillers and pauses are measured separately; do not over-penalise natural speech.`;
  }
}

const AI_DIMS = (ex: SpeakingExercise) => ex.dims.map((d) => d.key).filter((k) => k !== "accuracy" && k !== "speed");

function schemaFor(ex: SpeakingExercise) {
  return S.obj({
    heardSpeech: S.bool("false when the audio has no intelligible human speech"),
    transcript: S.str("verbatim transcript"),
    scores: S.obj(Object.fromEntries(AI_DIMS(ex).map((k) => [k, S.int()]))),
    feedback: S.str("2 specific sentences: what was good and the single most useful thing to fix"),
    corrections: S.arr(S.obj({ said: S.str(), better: S.str(), why: S.str() }), "spoken grammar/wording corrections (max 4); empty if none"),
    words: S.arr(S.obj({ word: S.str(), score: S.int(), issue: S.str() }), "per-word pronunciation feedback; each distinct word at most once", 8),
    tips: S.arr(S.str(), "up to 3 short practical tips, e.g. 'Focus on the th sound in three'"),
    better: S.str(EXACT.has(ex.kind) ? "empty string" : "an improved version of the learner's answer, max 80 words, keeping their ideas"),
  });
}

export type SpeakingTurnResult =
  | { kind: "no_speech" }
  | { kind: "ok"; transcript: string; evaluation: SpeakingEvaluation; metrics: Record<string, unknown>; aiMs: number };

export async function runSpeakingTurn(config: SpeakingConfig, item: SpeakingItem, audio: { base64: string; va: VoiceActivity }): Promise<SpeakingTurnResult> {
  const ex = exerciseByKind(config.kind)!;
  const mode = config.mode ? TWISTER_MODES.find((m) => m.id === config.mode)! : null;
  const target = targetFor(config, item);
  const dims = AI_DIMS(ex);
  const { data, ms } = await generateJson({
    kind: "speaking_turn",
    system: `You are an English speaking coach for Indian students and job seekers. ${NO_HALLUCINATION}\nEvaluate the complete recording.\n${RUBRIC}`,
    parts: [{ text: taskInstructions(ex, item, target, Boolean(mode?.strict)) }, { text: "Learner's recording:" }, { inlineData: { mimeType: "audio/wav", data: audio.base64 } }],
    schema: schemaFor(ex),
    parse: (raw) => {
      const r = asRecord(raw);
      if (typeof r.heardSpeech !== "boolean") return null;
      const s = asRecord(r.scores);
      return {
        heardSpeech: r.heardSpeech,
        transcript: asText(r.transcript, 5000),
        scores: Object.fromEntries(dims.map((k) => [k, clampScore(s[k], 50)])),
        feedback: asText(r.feedback, 600),
        corrections: asObjects(r.corrections, 4).map((c) => ({ said: asText(c.said, 200), better: asText(c.better, 200), why: asText(c.why, 200) })).filter((c) => c.said && c.better),
        words: asObjects(r.words, 12).map((w) => ({ word: asText(w.word, 40), score: clampScore(w.score, 70), issue: asText(w.issue, 160) })).filter((w) => w.word),
        tips: asList(r.tips, 3, 200),
        better: asText(r.better, 700),
      };
    },
    timeoutMs: 45_000,
    // A normal evaluation is ~300 tokens; the cap stops a degenerate repetition loop within seconds.
    maxOutputTokens: 1500,
  });
  if (!data.heardSpeech || !data.transcript.trim()) return { kind: "no_speech" };

  const tm = transcriptMetrics(data.transcript, audio.va.spanMs);
  const scores: Record<string, number> = { ...data.scores };
  let alignment: Alignment | undefined;
  let challenge: SpeakingEvaluation["challenge"];
  if (target) {
    alignment = alignWords(target, data.transcript);
    scores.accuracy = alignment.accuracy;
  }
  if (ex.kind === "twister" && target) {
    const wps = tm.words / Math.max(audio.va.spanMs / 1000, 0.5);
    // ~3 words/s is fast and clear for a twister; speed only counts when the words are right.
    scores.speed = Math.round(Math.min(100, (wps / 3) * 100) * Math.min(1, (alignment?.accuracy ?? 0) / 80));
    if (mode?.limit) {
      const limit = challengeSeconds(item.target!, mode.reps);
      const taken = Math.round(audio.va.spanMs / 100) / 10;
      challenge = { limit, taken, passed: taken <= limit && (alignment?.accuracy ?? 0) >= 80 };
    }
  }
  if (!EXACT.has(ex.kind) && typeof scores.fluency === "number") {
    scores.fluency = Math.round(scores.fluency * 0.5 + deliveryScore(tm, audio.va) * 0.5);
  }
  const weights: Record<string, number> = ex.kind === "twister" && mode?.strict ? { accuracy: 2, pronunciation: 2, clarity: 1, speed: 0.5 } : {};
  const keys = ex.dims.map((d) => d.key).filter((k) => typeof scores[k] === "number");
  const total = keys.reduce((n, k) => n + (weights[k] ?? 1), 0);
  const overall = Math.round(keys.reduce((n, k) => n + scores[k] * (weights[k] ?? 1), 0) / Math.max(total, 1));

  return {
    kind: "ok",
    transcript: data.transcript,
    evaluation: { scores, overall, feedback: data.feedback, corrections: data.corrections, words: data.words, tips: data.tips, better: data.better, alignment, challenge },
    metrics: { ...tm, speechMs: audio.va.speechMs, spanMs: audio.va.spanMs, longPauses: audio.va.longPauses, longestPauseMs: audio.va.longestPauseMs },
    aiMs: Math.round(ms),
  };
}

/** Where the next attempt may go: retry the current item, or move to the next. */
export function nextPosition(config: SpeakingConfig, state: SpeakingState, pos: number) {
  if (pos === state.cursor && state.attempts < MAX_ATTEMPTS_PER_ITEM) return { ok: true as const, attempts: state.attempts + 1 };
  if (pos === state.cursor + 1 && pos < config.items.length && state.attempts > 0) return { ok: true as const, attempts: 1 };
  return { ok: false as const };
}

// ───────────── report ─────────────

type DoneTurn = { itemId: string | null; transcript: string; evaluation: SpeakingEvaluation; metrics: Record<string, unknown> | null };

export async function buildSpeakingReport(config: SpeakingConfig, turns: DoneTurn[], durationS: number): Promise<{ report: PracticeReport; scores: Record<string, number>; overall: number }> {
  const ex = exerciseByKind(config.kind)!;
  // Best attempt per item counts, so retrying in practice mode never lowers the score.
  const best = new Map<string, DoneTurn>();
  for (const t of turns) { const k = t.itemId ?? ""; const cur = best.get(k); if (!cur || t.evaluation.overall >= cur.evaluation.overall) best.set(k, t); }
  const kept = [...best.values()];
  const scores = Object.fromEntries(ex.dims.map((d) => [d.key, mean(kept.map((t) => t.evaluation.scores[d.key]).filter((v) => typeof v === "number"))]));
  const overall = mean(kept.map((t) => t.evaluation.overall));
  const num = (t: DoneTurn, k: string) => (typeof t.metrics?.[k] === "number" ? (t.metrics[k] as number) : 0);
  const wpm = mean(kept.map((t) => num(t, "wpm")).filter(Boolean));
  const fillers = kept.reduce((n, t) => n + num(t, "fillerCount"), 0);
  const pauses = kept.reduce((n, t) => n + num(t, "longPauses"), 0);
  const stats = [
    { label: "Items", value: String(kept.length) },
    { label: "Attempts", value: String(turns.length) },
    { label: "Practice time", value: `${Math.max(1, Math.round(durationS / 60))} min` },
    ...(EXACT.has(ex.kind) ? [{ label: "Word accuracy", value: `${scores.accuracy ?? 0}%` }] : [{ label: "Average pace", value: wpm ? `${wpm} wpm` : "—" }, { label: "Filler words", value: String(fillers) }, { label: "Long pauses", value: String(pauses) }]),
  ];
  if (ex.kind === "twister" && config.mode === "challenge") stats.push({ label: "Challenges passed", value: `${kept.filter((t) => t.evaluation.challenge?.passed).length}/${kept.length}` });

  const corrections = kept.flatMap((t) => t.evaluation.corrections).slice(0, 6);
  const weakWords = kept.flatMap((t) => t.evaluation.words).filter((w) => w.score < 80).sort((a, b) => a.score - b.score).slice(0, 8);
  const tips = [...new Set(kept.flatMap((t) => t.evaluation.tips))].slice(0, 5);
  const missed = [...new Set(kept.flatMap((t) => t.evaluation.alignment?.missing ?? []))].slice(0, 10);
  const ranked = ex.dims.map((d) => ({ ...d, score: scores[d.key] ?? 0 })).sort((a, b) => b.score - a.score);

  let summary = `${band(overall)} (${overall}/100). Strongest: ${ranked[0].label} (${ranked[0].score}). Work next on ${ranked[ranked.length - 1].label} (${ranked[ranked.length - 1].score}).`;
  let plan = ["Repeat this exercise tomorrow and aim to beat today's score.", "Spend 10 minutes a day on your weakest dimension.", "Record yourself once a day and listen back for the same issues."];
  let ai = false;
  try {
    const digest = kept.map((t, i) => `#${i + 1} ${itemById(t.itemId ?? "")?.display ?? ""}\nSaid: ${t.transcript.slice(0, 600)}\nScore ${t.evaluation.overall}; ${t.evaluation.feedback}`).join("\n\n");
    const { data } = await generateJson({
      kind: "speaking_report",
      system: `You are an English speaking coach summarising a ${ex.title} practice session for an Indian student preparing for IT jobs. Overall score already computed: ${overall}/100 (${JSON.stringify(scores)}).\n${RUBRIC}`,
      parts: [{ text: `Attempts:\n${digest}\n\nMeasured: pace ${wpm || "n/a"} wpm, ${fillers} filler words, ${pauses} long pauses.` }],
      schema: S.obj({ summary: S.str("3 specific sentences"), plan: S.arr(S.str(), "4-5 step practice plan with minutes per day") }),
      parse: (v) => { const r = asRecord(v); return typeof r.summary === "string" ? { summary: asText(r.summary, 900), plan: asList(r.plan, 5) } : null; },
      timeoutMs: 25_000,
    });
    summary = data.summary || summary;
    if (data.plan.length) plan = data.plan;
    ai = true;
  } catch {
    // Code-built summary stands in.
  }

  const items: QaItem[] = kept.map((t) => {
    const item = itemById(t.itemId ?? "");
    const extra = t.evaluation.challenge ? ` Challenge: ${t.evaluation.challenge.taken}s / ${t.evaluation.challenge.limit}s — ${t.evaluation.challenge.passed ? "passed" : "not passed"}.` : "";
    return { q: item?.display ?? "", a: t.transcript, feedback: `${t.evaluation.feedback}${extra}`, score: t.evaluation.overall, better: t.evaluation.better || undefined };
  });

  const report: PracticeReport = {
    version: 1,
    module: "SPEAKING",
    title: speakingTitle(config),
    subtitle: ex.short,
    overall,
    level: band(overall),
    dimensions: ex.dims.map((d) => ({ key: d.key, label: d.label, score: scores[d.key] ?? 0 })),
    stats,
    summary,
    sections: [
      ...(weakWords.length ? [{ kind: "table" as const, title: "Pronunciation focus", columns: ["Word", "Your pronunciation", "What to fix"], rows: weakWords.map((w) => [w.word, `${w.score}%`, w.issue || "—"]) }] : []),
      ...(missed.length ? [{ kind: "list" as const, title: "Words you missed", items: missed.map((w) => `"${w}"`), tone: "warn" as const }] : []),
      ...(corrections.length ? [{ kind: "pairs" as const, title: "Grammar & wording corrections", pairs: corrections }] : []),
      ...(tips.length ? [{ kind: "list" as const, title: "Tips", items: tips, tone: "good" as const }] : []),
      { kind: "list", title: "Practice plan", items: plan, tone: "plan" },
      { kind: "qa", title: "Attempt review", items },
    ],
    aiSummary: ai,
  };
  return { report, scores, overall };
}

export { EXERCISES };
