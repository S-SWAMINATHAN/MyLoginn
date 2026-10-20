/**
 * Deterministic scoring and ranking. Marks come only from hidden-test results; integrity analysis and AI output never
 * change a score. Manual changes arrive as recorded adjustments (server/review.ts).
 */
import { round2 } from "./types";

/** Compares program output with the expected output using a question's comparator. */
export function outputsMatch(actual: string, expected: string, comparator = "trim") {
  if (comparator === "exact") return actual === expected;
  const lines = (s: string) => s.replace(/\r\n?/g, "\n").split("\n").map((l) => l.trimEnd()).join("\n").replace(/\n+$/, "");
  if (comparator.startsWith("float:")) {
    const tol = Number(comparator.slice(6)) || 1e-6;
    const a = lines(actual).split(/\s+/).filter(Boolean);
    const e = lines(expected).split(/\s+/).filter(Boolean);
    if (a.length !== e.length) return false;
    return a.every((tok, i) => {
      const x = Number(tok);
      const y = Number(e[i]);
      if (Number.isFinite(x) && Number.isFinite(y) && /^[-+]?[\d.eE+-]+$/.test(tok)) return Math.abs(x - y) <= tol * Math.max(1, Math.abs(y));
      return tok === e[i];
    });
  }
  return lines(actual) === lines(expected);
}

export type TestOutcome = { weight: number; passed: boolean };

/** Marks for one question: the slot's marks scaled by the weighted share of scored tests passed. */
export function questionScore(marks: number, tests: TestOutcome[]) {
  const scored = tests.filter((t) => t.weight > 0);
  const total = scored.reduce((s, t) => s + t.weight, 0);
  const passed = scored.filter((t) => t.passed).reduce((s, t) => s + t.weight, 0);
  return { passedWeight: passed, totalWeight: total, score: total ? round2((marks * passed) / total) : 0 };
}

export type ItemResult = {
  marks: number;
  hard: boolean;
  answered: boolean;
  score: number;
  testsPassed: number;
  testsTotal: number;
  submittedAt: Date | null;
};
export type Adjustment = { kind: string; delta: number };

export function computeResult(items: ItemResult[], negativeMarkPerWrong: number, adjustments: Adjustment[]) {
  const rawScore = round2(items.reduce((s, i) => s + i.score, 0));
  const hardScore = round2(items.filter((i) => i.hard).reduce((s, i) => s + i.score, 0));
  const maxScore = round2(items.reduce((s, i) => s + i.marks, 0));
  const negativeMarks = round2(negativeMarkPerWrong * items.filter((i) => i.answered && i.score === 0).length);
  const adj = round2(adjustments.filter((a) => a.kind === "PENALTY" || a.kind === "CORRECTION").reduce((s, a) => s + a.delta, 0));
  const disqualified = adjustments.some((a) => a.kind === "DISQUALIFY");
  const finalScore = disqualified ? 0 : round2(Math.min(maxScore, Math.max(0, rawScore - negativeMarks + adj)));
  const scoring = items.filter((i) => i.score > 0 && i.submittedAt).map((i) => i.submittedAt!.getTime());
  return {
    rawScore,
    hardScore,
    maxScore,
    negativeMarks,
    adjustments: adj,
    finalScore,
    disqualified,
    questionsAttempted: items.filter((i) => i.answered).length,
    testsPassed: items.reduce((s, i) => s + i.testsPassed, 0),
    testsTotal: items.reduce((s, i) => s + i.testsTotal, 0),
    lastScoringSubmitAt: scoring.length ? new Date(Math.max(...scoring)) : null,
  };
}

export type Rankable = { key: string; candidateId: string; finalScore: number; hardScore: number; lastScoringSubmitAt: Date | null };

/**
 * Published tie-breaking policy:
 *   1. Higher final score.
 *   2. Higher score on HARD questions.
 *   3. (if enabled) Earlier last scoring submission. Candidates with no scoring submission come last.
 * Candidates still equal share the rank (1, 2, 2, 4). Display order inside a shared rank is by candidate ID, which
 * never affects the rank itself. Scores are compared at 2 decimals so floating-point noise cannot split a tie.
 */
export function rankEntries<T extends Rankable>(entries: T[], useSubmitTime: boolean): (T & { rank: number })[] {
  const t = (e: Rankable) => (e.lastScoringSubmitAt ? e.lastScoringSubmitAt.getTime() : Number.MAX_SAFE_INTEGER);
  const cmp = (a: Rankable, b: Rankable) => {
    const s = round2(b.finalScore) - round2(a.finalScore);
    if (s !== 0) return s;
    const h = round2(b.hardScore) - round2(a.hardScore);
    if (h !== 0) return h;
    if (useSubmitTime) return t(a) - t(b);
    return 0;
  };
  const sorted = [...entries].sort((a, b) => cmp(a, b) || (a.candidateId < b.candidateId ? -1 : a.candidateId > b.candidateId ? 1 : 0));
  const out: (T & { rank: number })[] = [];
  sorted.forEach((e, i) => {
    const rank = i > 0 && cmp(sorted[i - 1], e) === 0 ? out[i - 1].rank : i + 1;
    out.push({ ...e, rank });
  });
  return out;
}

export function describeTieBreak(useSubmitTime: boolean) {
  return [
    "Higher final score ranks higher.",
    "If tied, the higher score on hard questions ranks higher.",
    ...(useSubmitTime ? ["If still tied, the earlier final scoring submission ranks higher."] : []),
    "Candidates who remain exactly equal share the rank.",
  ];
}
