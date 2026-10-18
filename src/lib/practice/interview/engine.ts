import "server-only";
import { randomInt } from "node:crypto";
import { ALL_PROBLEMS } from "@/lib/logiquest/coding/problems";
import { NO_HALLUCINATION, RUBRIC, S, asList, asObjects, asRecord, asText, clampScore, generateJson } from "../ai";
import { deliveryScore, transcriptMetrics, type VoiceActivity } from "../speech";
import { mean, readinessLevel, weightedScore, type Pair, type PracticeReport, type QaItem } from "../report";
import {
  DIFFICULTIES, INTERVIEW_DIMENSIONS, LENGTHS, MAX_RESUME_CHARS, PERSONAS, STAGE_LABEL, personaById, stagePlan, typeById,
  type InterviewConfig, type InterviewDimension, type Stage,
} from "./config";

export type InterviewState = {
  plan: Stage[];
  /** Questions asked so far; the current question is number `asked`. */
  asked: number;
  current: string;
  /** Rolling notes about the candidate, so long interviews never resend the full transcript. */
  memory: string;
  recent: { q: string; a: string }[];
  done: boolean;
};

export type TurnScores = Record<InterviewDimension, number>;
export type TurnEvaluation = {
  scores: TurnScores;
  overall: number;
  feedback: string;
  struggled: boolean;
  betterAnswer: string;
  grammarFixes: Pair[];
  missingConcepts: string[];
  stage: Stage;
};

const WEIGHTS: Record<InterviewDimension, number> = {
  communication: 0.14, content: 0.2, technical: 0.18, problemSolving: 0.1, structure: 0.1, confidence: 0.06,
  fluency: 0.06, grammar: 0.05, vocabulary: 0.03, pronunciation: 0.03, professionalism: 0.05,
};

/** Validates setup choices; anything unknown falls back to a safe default. */
export function normalizeConfig(input: Record<string, unknown>): InterviewConfig | null {
  const type = typeById(String(input.type ?? ""));
  if (!type) return null;
  const difficulty = DIFFICULTIES.some((d) => d.id === input.difficulty) ? String(input.difficulty) : "intermediate";
  const persona = PERSONAS.some((p) => p.id === input.persona) ? String(input.persona) : "professional";
  const length = LENGTHS.some((l) => l.id === input.length) ? String(input.length) : "standard";
  const resume = asText(input.resume, MAX_RESUME_CHARS).replace(/[<>]/g, "");
  const role = asText(input.role, 80).replace(/[<>]/g, "");
  const config: InterviewConfig = { type: type.id, difficulty, persona, length, ...(resume ? { resume } : {}), ...(role ? { role } : {}) };
  if (type.id === "coding") {
    const pool = ALL_PROBLEMS.filter((p) => p.kind === "io" && (difficulty === "beginner" ? p.difficulty === "Easy" : difficulty === "expert" || difficulty === "advanced" ? p.difficulty !== "Easy" : p.difficulty === "Medium" || p.difficulty === "Easy"));
    const pick = pool[randomInt(pool.length)];
    if (pick) config.coding = { slug: pick.slug, title: pick.title, statement: pick.statement.slice(0, 1500) };
  }
  return config;
}

function greeting() {
  const hour = (new Date().getUTCHours() + 5.5) % 24;
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

/** The first question is fixed, so the interview starts instantly without waiting for the AI. */
export function startState(config: InterviewConfig, candidateName: string): InterviewState {
  const type = typeById(config.type)!;
  const total = LENGTHS.find((l) => l.id === config.length)!.questions;
  const persona = personaById(config.persona);
  const first = candidateName.split(/\s+/)[0] || "there";
  const roleText = config.role ? ` for the ${config.role} role` : "";
  const label = type.label.replace(/ \(.*\)$/, "");
  const what = /interview|round/i.test(label) ? label : `${label} interview`;
  const opener = `${greeting()}, ${first}. I'm ${persona.name}, and I'll be taking your ${what}${roleText} today. Please answer as you would in a real interview. Let's begin. Tell me about yourself.`;
  return { plan: stagePlan(type, total), asked: 1, current: opener, memory: "", recent: [], done: false };
}

const TURN_SCHEMA = S.obj({
  heardSpeech: S.bool("false when the audio has no intelligible human speech"),
  transcript: S.str("verbatim transcript of the candidate's answer"),
  scores: S.obj(Object.fromEntries(INTERVIEW_DIMENSIONS.map((d) => [d.key, S.int()]))),
  feedback: S.str("1-2 specific sentences about THIS answer: what worked and the single most useful improvement"),
  struggled: S.bool("true if the candidate could not answer, was mostly off-topic, or was factually wrong"),
  betterAnswer: S.str("a concise model answer or improved version (max 80 words) in first person"),
  grammarFixes: S.arr(S.obj({ said: S.str(), better: S.str(), why: S.str() }), "up to 3 real spoken grammar mistakes; empty if none"),
  missingConcepts: S.arr(S.str(), "up to 3 important concepts the answer missed; empty if none"),
  memory: S.str("updated interviewer notes about the candidate (skills, projects, claims, weak spots), max 90 words"),
  acknowledgement: S.str("a short natural reaction before the next question, max 14 words; may be empty; never gushing praise"),
  nextQuestion: S.str("the next question to speak, max 45 words; empty if this was the last answer"),
});

type TurnOutput = {
  heardSpeech: boolean;
  transcript: string;
  scores: TurnScores;
  feedback: string;
  struggled: boolean;
  betterAnswer: string;
  grammarFixes: Pair[];
  missingConcepts: string[];
  memory: string;
  acknowledgement: string;
  nextQuestion: string;
};

function parseTurn(raw: unknown): TurnOutput | null {
  const r = asRecord(raw);
  if (typeof r.heardSpeech !== "boolean") return null;
  const s = asRecord(r.scores);
  return {
    heardSpeech: r.heardSpeech,
    transcript: asText(r.transcript, 6000),
    scores: Object.fromEntries(INTERVIEW_DIMENSIONS.map((d) => [d.key, clampScore(s[d.key], 50)])) as TurnScores,
    feedback: asText(r.feedback, 600),
    struggled: r.struggled === true,
    betterAnswer: asText(r.betterAnswer, 800),
    grammarFixes: asObjects(r.grammarFixes, 3).map((g) => ({ said: asText(g.said, 200), better: asText(g.better, 200), why: asText(g.why, 200) })).filter((g) => g.said && g.better),
    missingConcepts: asList(r.missingConcepts, 3, 120),
    memory: asText(r.memory, 900),
    acknowledgement: asText(r.acknowledgement, 140),
    nextQuestion: asText(r.nextQuestion, 400),
  };
}

function systemPrompt(config: InterviewConfig) {
  const type = typeById(config.type)!;
  const persona = personaById(config.persona);
  const difficulty = DIFFICULTIES.find((d) => d.id === config.difficulty)!;
  return `You are ${persona.name}, a real interviewer at an IT company conducting a spoken ${type.label} with a candidate from India.
Persona: ${persona.style}. Always professional and respectful.
Difficulty: ${difficulty.label} (${difficulty.desc}). Coverage: ${type.focus}.

Each request gives you the candidate's recorded answer to your current question. Do all of this, in order:
1. Transcribe the answer. ${NO_HALLUCINATION}
2. Evaluate the complete answer on every dimension (0-100). For an answer with no technical content (e.g. an introduction), score "technical" and "problemSolving" on how well the candidate presents their skills and reasoning. Pronunciation and fluency come from how it sounded.
3. Update your notes about the candidate.
4. Decide the next question for the planned stage, like a human interviewer:
   - React to what the candidate actually said. If they mentioned a skill, project or tool, follow up on it ("You mentioned Selenium — how did you handle dynamic elements?").
   - If the answer was vague or wrong, probe once more on the same point before moving on; if they clearly do not know, move on.
   - Never repeat a question already asked. Ask exactly one question. Keep it short and natural to say aloud: no lists, no markdown, no code.
   - Use the candidate's resume only for facts it states; never invent experience they do not have.
   - Adapt difficulty to performance: simplify after struggles, go deeper after strong answers.

${RUBRIC}`;
}

export type InterviewTurnResult =
  | { kind: "no_speech" }
  | { kind: "ok"; transcript: string; evaluation: TurnEvaluation; metrics: ReturnType<typeof transcriptMetrics> & { delivery: number; speechMs: number; longPauses: number }; reply: string; nextQuestion: string | null; state: InterviewState; aiMs: number };

export async function runInterviewTurn(config: InterviewConfig, state: InterviewState, audio: { base64: string; va: VoiceActivity }): Promise<InterviewTurnResult> {
  const stage = state.plan[state.asked - 1] ?? "closing";
  const isLast = state.asked >= state.plan.length;
  const nextStage = state.plan[state.asked];
  const context = [
    config.role ? `Target role: ${config.role}` : null,
    config.resume ? `Candidate resume (facts you may use):\n${config.resume.slice(0, 1800)}` : "No resume provided: rely only on what the candidate says.",
    config.coding ? `Coding problem under discussion ("${config.coding.title}"), shown to the candidate on screen:\n${config.coding.statement}` : null,
    `Interview plan: ${state.plan.map((s, i) => `${i + 1}.${STAGE_LABEL[s]}`).join(" ")}`,
    `Current question #${state.asked} (stage: ${STAGE_LABEL[stage]}): "${state.current}"`,
    state.memory ? `Your notes so far: ${state.memory}` : null,
    state.recent.length ? `Recent exchanges:\n${state.recent.map((r) => `Q: ${r.q}\nA: ${r.a}`).join("\n")}` : null,
    isLast
      ? "This is the LAST answer: set nextQuestion to an empty string."
      : `Next question #${state.asked + 1} must be a ${STAGE_LABEL[nextStage!]} question${nextStage === "closing" ? ' (a closing question such as "Why should we hire you?" or "Where do you see yourself in five years?")' : ""}${nextStage === "coding" && config.coding ? " about the coding problem (approach, data structures, complexity, edge cases, optimisation — one at a time)" : ""}.`,
  ].filter(Boolean).join("\n\n");

  const { data, ms } = await generateJson({
    kind: "interview_turn",
    system: systemPrompt(config),
    parts: [{ text: context }, { text: "Candidate's recorded answer:" }, { inlineData: { mimeType: "audio/wav", data: audio.base64 } }],
    schema: TURN_SCHEMA,
    parse: parseTurn,
    timeoutMs: 45_000,
    maxOutputTokens: 2000,
  });

  const wordCount = data.transcript.split(/\s+/).filter(Boolean).length;
  if (!data.heardSpeech || wordCount < 2) return { kind: "no_speech" };

  const tm = transcriptMetrics(data.transcript, audio.va.spanMs);
  const delivery = deliveryScore(tm, audio.va);
  // Fluency blends the AI's listening judgement with measured pace/pauses/fillers, which keeps it stable.
  const scores: TurnScores = { ...data.scores, fluency: Math.round(data.scores.fluency * 0.5 + delivery * 0.5) };
  const type = typeById(config.type)!;
  const weights = type.technical ? WEIGHTS : { ...WEIGHTS, technical: 0, problemSolving: 0.04 };
  const evaluation: TurnEvaluation = {
    scores,
    overall: weightedScore(scores, weights),
    feedback: data.feedback,
    struggled: data.struggled,
    betterAnswer: data.betterAnswer,
    grammarFixes: data.grammarFixes,
    missingConcepts: data.missingConcepts,
    stage,
  };

  const recent = [...state.recent, { q: state.current.slice(0, 300), a: data.transcript.slice(0, 500) }].slice(-2);
  let nextQuestion: string | null = null;
  let reply: string;
  if (isLast || !data.nextQuestion) {
    reply = "Thank you. That brings us to the end of the interview. I'm preparing your evaluation now.";
  } else {
    nextQuestion = data.nextQuestion;
    reply = [data.acknowledgement, data.nextQuestion].filter(Boolean).join(" ");
  }
  const next: InterviewState = {
    ...state,
    asked: nextQuestion ? state.asked + 1 : state.asked,
    current: nextQuestion ?? state.current,
    memory: data.memory || state.memory,
    recent,
    done: !nextQuestion,
  };
  return { kind: "ok", transcript: data.transcript, evaluation, metrics: { ...tm, delivery, speechMs: audio.va.speechMs, longPauses: audio.va.longPauses }, reply, nextQuestion, state: next, aiMs: Math.round(ms) };
}

// ───────────── final report ─────────────

type DoneTurn = { prompt: string; transcript: string; evaluation: TurnEvaluation; metrics: { wpm?: number; fillerCount?: number; longPauses?: number; words?: number } | null };

const REPORT_SCHEMA = S.obj({
  summary: S.str("3-4 sentence overall assessment, specific to this candidate"),
  wellDone: S.arr(S.str(), "3-5 specific strengths with evidence"),
  improve: S.arr(S.str(), "3-5 specific improvement areas with evidence"),
  struggled: S.arr(S.obj({ question: S.str(), issue: S.str(), betterAnswer: S.str() }), "questions the candidate struggled with (max 4)"),
  answerStructure: S.str("a suggested structure for this candidate's answers (e.g. STAR / Point-Example-Result), 2-3 sentences"),
  missingConcepts: S.arr(S.str(), "technical concepts to revise (max 6); empty for non-technical interviews"),
  communicationMistakes: S.arr(S.obj({ said: S.str(), better: S.str(), why: S.str() }), "the most important spoken grammar/wording corrections (max 5)"),
  practicePlan: S.arr(S.str(), "a concrete 7-day practice plan, 4-6 steps with durations"),
});

export async function buildInterviewReport(config: InterviewConfig, turns: DoneTurn[], durationS: number): Promise<{ report: PracticeReport; scores: Record<string, number>; overall: number }> {
  const type = typeById(config.type)!;
  const persona = personaById(config.persona);
  const dims = INTERVIEW_DIMENSIONS.filter((d) => type.technical || (d.key !== "technical" && d.key !== "problemSolving"));
  const scores = Object.fromEntries(dims.map((d) => [d.key, mean(turns.map((t) => t.evaluation.scores[d.key]))]));
  const weights = type.technical ? WEIGHTS : { ...WEIGHTS, technical: 0, problemSolving: 0 };
  const overall = weightedScore(scores, weights);

  const qa: QaItem[] = turns.map((t) => ({ q: t.prompt, a: t.transcript, feedback: t.evaluation.feedback, score: t.evaluation.overall, better: t.evaluation.betterAnswer, stage: STAGE_LABEL[t.evaluation.stage] }));
  const words = turns.reduce((n, t) => n + (t.metrics?.words ?? 0), 0);
  const wpm = mean(turns.map((t) => t.metrics?.wpm ?? 0).filter(Boolean));
  const fillers = turns.reduce((n, t) => n + (t.metrics?.fillerCount ?? 0), 0);
  const stats = [
    { label: "Questions answered", value: String(turns.length) },
    { label: "Duration", value: `${Math.max(1, Math.round(durationS / 60))} min` },
    { label: "Words spoken", value: String(words) },
    { label: "Average pace", value: wpm ? `${wpm} wpm` : "—" },
    { label: "Filler words", value: String(fillers) },
    { label: "Interviewer", value: `${persona.name} · ${persona.label}` },
  ];

  let ai: Record<string, unknown> | null = null;
  try {
    const transcript = turns.map((t, i) => `Q${i + 1} [${STAGE_LABEL[t.evaluation.stage]}]: ${t.prompt}\nA${i + 1}: ${t.transcript.slice(0, 900)}\nPer-answer score ${t.evaluation.overall}; note: ${t.evaluation.feedback}`).join("\n\n");
    const { data } = await generateJson({
      kind: "interview_report",
      system: `You are a senior interview assessor writing the final feedback for a ${type.label} (${config.difficulty} level) taken by a candidate preparing for IT jobs in India. Base everything on the transcript; quote or paraphrase the candidate. Overall score already computed: ${overall}/100.\n${RUBRIC}`,
      parts: [{ text: `${config.resume ? `Resume:\n${config.resume.slice(0, 1500)}\n\n` : ""}Interview transcript:\n${transcript}` }],
      schema: REPORT_SCHEMA,
      parse: (v) => { const r = asRecord(v); return typeof r.summary === "string" ? r : null; },
      timeoutMs: 45_000,
      thinking: 1024,
      maxOutputTokens: 6000,
    });
    ai = data;
  } catch {
    // Fall back to a report assembled from per-answer results, so the learner always gets one.
  }

  const struggledFallback = turns.filter((t) => t.evaluation.struggled).map((t) => ({ question: t.prompt, issue: t.evaluation.feedback, betterAnswer: t.evaluation.betterAnswer }));
  const struggled = ai ? asObjects(ai.struggled, 4).map((s) => ({ question: asText(s.question, 300), issue: asText(s.issue, 400), betterAnswer: asText(s.betterAnswer, 700) })) : struggledFallback;
  const grammar: Pair[] = ai
    ? asObjects(ai.communicationMistakes, 5).map((g) => ({ said: asText(g.said, 200), better: asText(g.better, 200), why: asText(g.why, 200) })).filter((g) => g.said && g.better)
    : turns.flatMap((t) => t.evaluation.grammarFixes).slice(0, 5);
  const missing = ai ? asList(ai.missingConcepts, 6, 160) : [...new Set(turns.flatMap((t) => t.evaluation.missingConcepts))].slice(0, 6);
  const ranked = dims.map((d) => ({ ...d, score: scores[d.key] })).sort((a, b) => b.score - a.score);

  const report: PracticeReport = {
    version: 1,
    module: "INTERVIEW",
    title: type.label,
    subtitle: `${DIFFICULTIES.find((d) => d.id === config.difficulty)!.label} level${config.role ? ` · ${config.role}` : ""}`,
    overall,
    level: readinessLevel(overall),
    dimensions: dims.map((d) => ({ key: d.key, label: d.label, score: scores[d.key] })),
    stats,
    summary: ai ? asText(ai.summary, 1200) : `Overall ${overall}/100 across ${turns.length} answers. Strongest: ${ranked[0].label} (${ranked[0].score}). Focus next on ${ranked[ranked.length - 1].label} (${ranked[ranked.length - 1].score}).`,
    sections: [
      { kind: "list", title: "What you did well", items: ai ? asList(ai.wellDone, 5) : ranked.slice(0, 3).map((d) => `${d.label}: ${d.score}/100`), tone: "good" },
      { kind: "list", title: "What needs improvement", items: ai ? asList(ai.improve, 5) : ranked.slice(-3).map((d) => `${d.label}: ${d.score}/100`), tone: "warn" },
      ...(struggled.length ? [{ kind: "qa" as const, title: "Questions you struggled with", items: struggled.map((s) => ({ q: s.question, a: s.issue, better: s.betterAnswer })) }] : []),
      ...(ai && asText(ai.answerStructure) ? [{ kind: "text" as const, title: "Suggested answer structure", text: asText(ai.answerStructure, 600) }] : []),
      ...(missing.length ? [{ kind: "list" as const, title: "Concepts to revise", items: missing }] : []),
      ...(grammar.length ? [{ kind: "pairs" as const, title: "Communication corrections", pairs: grammar }] : []),
      { kind: "list", title: "Recommended practice plan", items: ai ? asList(ai.practicePlan, 6) : ["Re-take this interview type within 3 days.", "Record 60-second answers to your weakest questions daily.", "Use the Speaking Lab grammar exercise for 10 minutes a day."], tone: "plan" },
      { kind: "qa", title: "Question-by-question review", items: qa },
    ],
    aiSummary: Boolean(ai),
  };
  return { report, scores, overall };
}
