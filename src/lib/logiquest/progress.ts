import { prisma } from "@/lib/prisma";
import { HINT_XP_PENALTY, MAX_HINT_PENALTY } from "./constants";
import type { JudgeReport } from "./judge";

/** Calendar day in India Standard Time, so a learner's streak rolls over at local midnight. */
export function dayKey(date = new Date()) {
  return new Date(date.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

function previousDay(day: string) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function solveXp(baseXp: number, hintsUsed: number) {
  const penalty = Math.min(MAX_HINT_PENALTY, hintsUsed * HINT_XP_PENALTY);
  return Math.max(1, Math.round(baseXp * (1 - penalty)));
}

const STREAK_BONUS: Record<number, number> = { 3: 10, 7: 25, 14: 40, 30: 100, 100: 300 };

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Shared by every LogiQuest category: credits first-solve XP exactly once (idempotent on `eventKey`), counts the solve,
 * and advances the daily streak (with milestone bonuses) when the learner had a successful result today.
 */
export async function applyActivity(tx: Tx, args: { userId: string; accepted: boolean; xp: number; eventKey: string; challengeId?: string }) {
  const { userId, accepted, xp, eventKey, challengeId } = args;
  const today = dayKey();
  const stat = await tx.lqUserStat.upsert({ where: { userId }, create: { userId }, update: {} });
  let streak = stat.currentStreak;
  let streakBonus = 0;
  let xpGranted = 0;
  let credited = false;
  const data: { xp?: { increment: number }; solved?: { increment: number }; currentStreak?: number; longestStreak?: number; lastActiveDay?: string } = {};

  if (accepted && stat.lastActiveDay !== today) {
    streak = stat.lastActiveDay === previousDay(today) ? stat.currentStreak + 1 : 1;
    data.currentStreak = streak;
    data.longestStreak = Math.max(stat.longestStreak, streak);
    data.lastActiveDay = today;
    const bonus = STREAK_BONUS[streak];
    if (bonus) {
      const made = await tx.lqXpEvent.createMany({ data: [{ userId, amount: bonus, reason: "STREAK_MILESTONE", eventKey: `streak:${userId}:${streak}:${today}` }], skipDuplicates: true });
      if (made.count) streakBonus = bonus;
    }
  }
  if (xp > 0) {
    const made = await tx.lqXpEvent.createMany({ data: [{ userId, amount: xp, reason: "FIRST_SOLVE", challengeId, eventKey }], skipDuplicates: true });
    if (made.count) { data.solved = { increment: 1 }; xpGranted = xp; credited = true; }
  }
  if (xpGranted + streakBonus) data.xp = { increment: xpGranted + streakBonus };
  if (Object.keys(data).length) await tx.lqUserStat.update({ where: { userId }, data });
  return { streak, streakBonus, xpGranted, credited };
}

export type RecordResult = { attemptNo: number; xpAwarded: number; firstSolve: boolean; streak: number; streakBonus: number; submissionId: string };

/**
 * Persists one graded submission and, on the first accepted solve of a challenge, awards XP exactly once
 * (idempotent via LqXpEvent.eventKey) and advances the daily streak. Scores are computed here, never in the browser.
 */
export async function recordSubmission(args: {
  userId: string;
  challenge: { id: string; xp: number };
  language: string;
  source: string;
  report: JudgeReport;
}): Promise<RecordResult> {
  const { userId, challenge, language, source, report } = args;
  const accepted = report.verdict === "ACCEPTED";

  return prisma.$transaction(async (tx) => {
    const progress = await tx.lqProgress.upsert({
      where: { userId_challengeId: { userId, challengeId: challenge.id } },
      create: { userId, challengeId: challenge.id, attempts: 1, bestPassed: report.passed },
      update: { attempts: { increment: 1 } },
    });
    const firstSolve = accepted && !progress.solved;
    const xpAwarded = firstSolve ? solveXp(challenge.xp, progress.hintsUsed) : 0;

    const submission = await tx.lqSubmission.create({
      data: {
        userId, challengeId: challenge.id, language, source, verdict: report.verdict,
        passed: report.passed, total: report.total, timeMs: report.timeMs, attemptNo: progress.attempts, xpAwarded,
      },
    });

    await tx.lqProgress.update({
      where: { id: progress.id },
      data: {
        bestPassed: Math.max(progress.bestPassed, report.passed),
        ...(firstSolve ? { solved: true, solvedAt: new Date() } : {}),
      },
    });
    await tx.lqChallenge.update({
      where: { id: challenge.id },
      data: { attemptCount: { increment: 1 }, ...(firstSolve ? { solvedCount: { increment: 1 } } : {}) },
    });

    const credit = await applyActivity(tx, { userId, accepted, xp: firstSolve ? xpAwarded : 0, eventKey: `solve:${userId}:${challenge.id}`, challengeId: challenge.id });

    return { attemptNo: progress.attempts, xpAwarded: credit.xpGranted, firstSolve: firstSolve && credit.credited, streak: credit.streak, streakBonus: credit.streakBonus, submissionId: submission.id };
  });
}

/** Run (public tests only) is recorded as an attempt-free dry run: nothing is persisted. */
export async function countRecentExecutions(userId: string, windowMs = 60_000) {
  return prisma.lqSubmission.count({ where: { userId, createdAt: { gte: new Date(Date.now() - windowMs) } } });
}

/**
 * Grades one multiple-choice answer. Only the learner's FIRST answer to a question can earn XP, so seeing the
 * correct option after a wrong answer cannot be farmed.
 */
export async function recordAnswer(args: { userId: string; question: { id: string; xp: number; correctIndex: number }; selected: number }) {
  const { userId, question, selected } = args;
  const correct = selected === question.correctIndex;
  return prisma.$transaction(async (tx) => {
    const existing = await tx.lqQuestionProgress.findUnique({ where: { userId_questionId: { userId, questionId: question.id } } });
    const first = !existing;
    await tx.lqQuestionProgress.upsert({
      where: { userId_questionId: { userId, questionId: question.id } },
      create: { userId, questionId: question.id, attempts: 1, firstCorrect: correct, everCorrect: correct },
      update: { attempts: { increment: 1 }, ...(correct ? { everCorrect: true } : {}) },
    });
    await tx.lqQuestion.update({ where: { id: question.id }, data: { attemptCount: { increment: 1 }, ...(first && correct ? { solvedCount: { increment: 1 } } : {}) } });
    const credit = await applyActivity(tx, { userId, accepted: correct, xp: first && correct ? question.xp : 0, eventKey: `q:${userId}:${question.id}` });
    return { correct, xpAwarded: credit.xpGranted, scored: first, streak: credit.streak, streakBonus: credit.streakBonus };
  });
}
