/**
 * Quiz drawing, grading and attempt rules. Pure; the answer key never leaves the server.
 *
 * Pass rule: points * 100 >= passPercent * maxPoints, evaluated in integers (no rounding
 * up), so 59.9% never passes a 60% mark.
 */

export type QuestionType = "single" | "multiple" | "truefalse";

export type StoredQuestion = {
  id: string;
  type: string;
  prompt: string;
  options: { id: string; text: string }[];
  correct: string[];
  explanation?: string | null;
  points: number;
};

export type ClientQuestion = Pick<StoredQuestion, "id" | "type" | "prompt" | "options" | "points">;

/** Strips the answer key and explanation: this is the only shape sent before submission. */
export function toClientQuestion(q: StoredQuestion): ClientQuestion {
  return { id: q.id, type: q.type, prompt: q.prompt, options: q.options.map((o) => ({ id: o.id, text: o.text })), points: q.points };
}

/** Deterministic Fisher-Yates when a seeded rng is passed; Math.random in production. */
export function drawQuestions<T>(bank: T[], count: number | null | undefined, rng: () => number = Math.random): T[] {
  const copy = [...bank];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return count && count > 0 && count < copy.length ? copy.slice(0, count) : copy;
}

export type Answers = Record<string, string[] | string | undefined>;

const asSet = (value: string[] | string | undefined) => new Set(Array.isArray(value) ? value : value ? [value] : []);

export function isAnswerCorrect(q: Pick<StoredQuestion, "correct" | "options">, answer: string[] | string | undefined): boolean {
  const chosen = asSet(answer);
  const valid = new Set(q.options.map((o) => o.id));
  if (chosen.size === 0) return false;
  for (const id of chosen) if (!valid.has(id)) return false; // unknown option id => wrong
  const correct = new Set(q.correct);
  if (chosen.size !== correct.size) return false; // multiple-choice needs the exact set: no partial credit
  for (const id of correct) if (!chosen.has(id)) return false;
  return true;
}

export type GradeResult = {
  scorePoints: number;
  maxPoints: number;
  percent: number; // floor(score*100/max)
  perQuestion: { id: string; correct: boolean }[];
};

export function gradeAttempt(served: StoredQuestion[], answers: Answers): GradeResult {
  let scorePoints = 0;
  let maxPoints = 0;
  const perQuestion = served.map((q) => {
    const points = Math.max(0, Math.floor(q.points));
    maxPoints += points;
    const correct = isAnswerCorrect(q, answers[q.id]);
    if (correct) scorePoints += points;
    return { id: q.id, correct };
  });
  return { scorePoints, maxPoints, percent: maxPoints ? Math.floor((scorePoints * 100) / maxPoints) : 0, perQuestion };
}

export function hasPassed(scorePoints: number, maxPoints: number, passPercent: number): boolean {
  return maxPoints > 0 && scorePoints * 100 >= passPercent * maxPoints;
}

export type AttemptRow = { status: string; startedAt: Date; submittedAt: Date | null };
export type QuizPolicy = { maxAttempts: number | null; cooldownMinutes: number; timeLimitMinutes: number | null };

export type StartDecision =
  | { ok: true; resume: false }
  | { ok: true; resume: true }
  | { ok: false; reason: string; retryAt?: Date };

/** Grace for network latency when a timed attempt is submitted. */
export const TIME_LIMIT_GRACE_MS = 30_000;

export function isAttemptExpired(attempt: Pick<AttemptRow, "startedAt">, timeLimitMinutes: number | null, now: Date) {
  return timeLimitMinutes !== null && now.getTime() > attempt.startedAt.getTime() + timeLimitMinutes * 60_000 + TIME_LIMIT_GRACE_MS;
}

export function canStartAttempt(attempts: AttemptRow[], policy: QuizPolicy, now: Date): StartDecision {
  const open = attempts.find((a) => a.status === "in_progress" && !isAttemptExpired(a, policy.timeLimitMinutes, now));
  if (open) return { ok: true, resume: true };

  const used = attempts.length; // started attempts count, including expired ones (no free retries by abandoning)
  if (policy.maxAttempts !== null && used >= policy.maxAttempts) {
    return { ok: false, reason: `You have used all ${policy.maxAttempts} attempts for this assessment.` };
  }
  const lastDone = attempts
    .map((a) => a.submittedAt ?? (a.status === "expired" ? new Date(a.startedAt.getTime() + (policy.timeLimitMinutes ?? 0) * 60_000) : null))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  if (policy.cooldownMinutes > 0 && lastDone) {
    const retryAt = new Date(lastDone.getTime() + policy.cooldownMinutes * 60_000);
    if (retryAt.getTime() > now.getTime()) return { ok: false, reason: `Please wait before your next attempt.`, retryAt };
  }
  return { ok: true, resume: false };
}
