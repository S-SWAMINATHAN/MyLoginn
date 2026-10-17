import { prisma } from "@/lib/prisma";
import { LEVEL_XP } from "./constants";
import type { Question } from "./types";

/** Calendar day in India Standard Time, so a learner's streak rolls over at local midnight. */
export function dayKey(date = new Date()) {
  return new Date(date.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);
}

function previousDay(day: string) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

const STREAK_BONUS: Record<number, number> = { 3: 10, 7: 25, 14: 40, 30: 100, 100: 300 };

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Credits XP exactly once per `eventKey`, counts it as a solve when asked, and advances the daily streak (with
 * milestone bonuses) the first time the learner gets something right on a given day.
 */
export async function applyActivity(tx: Tx, args: { userId: string; success: boolean; xp: number; eventKey: string; reason: string; ref?: string; solved?: number }) {
  const { userId, success, xp, eventKey, reason, ref } = args;
  const today = dayKey();
  const stat = await tx.lqUserStat.upsert({ where: { userId }, create: { userId }, update: {} });
  let streak = stat.currentStreak;
  let streakBonus = 0;
  let xpGranted = 0;
  const data: { xp?: { increment: number }; solved?: { increment: number }; currentStreak?: number; longestStreak?: number; lastActiveDay?: string } = {};

  if (success && stat.lastActiveDay !== today) {
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
    const made = await tx.lqXpEvent.createMany({ data: [{ userId, amount: xp, reason, ref, eventKey }], skipDuplicates: true });
    if (made.count) {
      xpGranted = xp;
      if (args.solved) data.solved = { increment: args.solved };
    }
  }
  if (xpGranted + streakBonus) data.xp = { increment: xpGranted + streakBonus };
  if (Object.keys(data).length) await tx.lqUserStat.update({ where: { userId }, data });
  return { streak, streakBonus, xpGranted };
}

/**
 * Records a practice answer. Only the learner's FIRST answer to a question can earn XP, so revealing the answer and
 * then clicking it cannot be farmed.
 */
export async function recordAnswer(userId: string, question: Question, selected: number) {
  const correct = selected === question.a;
  return prisma.$transaction(async (tx) => {
    const existing = await tx.lqAnswer.findUnique({ where: { userId_qid: { userId, qid: question.id } } });
    if (existing) {
      await tx.lqAnswer.update({ where: { id: existing.id }, data: { attempts: { increment: 1 }, ...(correct ? { everCorrect: true } : {}) } });
    } else {
      await tx.lqAnswer.create({ data: { userId, qid: question.id, subject: question.subject, topic: question.topic, firstCorrect: correct, everCorrect: correct } });
    }
    const first = !existing;
    const credit = await applyActivity(tx, {
      userId, success: correct, xp: first && correct ? LEVEL_XP[question.d] : 0,
      eventKey: `q:${userId}:${question.id}`, reason: "FIRST_CORRECT", ref: question.id, solved: 1,
    });
    return { correct, first, xpAwarded: credit.xpGranted, streak: credit.streak, streakBonus: credit.streakBonus };
  });
}

/** Per-topic answered / correct counts for one learner. Keyed "subject/topic". */
export async function topicProgress(userId: string, subject?: string) {
  const rows = await prisma.lqAnswer.groupBy({
    by: ["subject", "topic", "firstCorrect"],
    where: { userId, ...(subject ? { subject } : {}) },
    _count: { _all: true },
  });
  const out: Record<string, { answered: number; correct: number }> = {};
  for (const r of rows) {
    const k = `${r.subject}/${r.topic}`;
    const v = (out[k] ??= { answered: 0, correct: 0 });
    v.answered += r._count._all;
    if (r.firstCorrect) v.correct += r._count._all;
  }
  return out;
}
