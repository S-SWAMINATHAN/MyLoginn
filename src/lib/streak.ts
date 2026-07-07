import { prisma } from "./prisma";

/**
 * Day keys are calendar dates in Asia/Kolkata (the platform's audience
 * timezone) formatted as "YYYY-MM-DD", so a "day" of activity matches what
 * the student sees on their clock rather than UTC.
 */
const TIME_ZONE = "Asia/Kolkata";

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toDayKey(date: Date = new Date()): string {
  return dayKeyFormat.format(date);
}

export function shiftDayKey(dayKey: string, days: number): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d + days));
  return shifted.toISOString().slice(0, 10);
}

export const DAILY_LOGIN_POINTS = 10;

export const STREAK_MILESTONES: Record<number, number> = {
  3: 25,
  7: 50,
  14: 100,
  30: 250,
  60: 400,
  100: 750,
};

export type PointsAward = { amount: number; reason: string; label: string };

/**
 * Awards points outside the daily-login flow (enrollment, applications, ...).
 * Keeps the ledger and the cached balance on User in sync.
 */
export async function awardPoints(userId: string, award: PointsAward) {
  await prisma.$transaction([
    prisma.pointsTransaction.create({ data: { userId, ...award } }),
    prisma.user.update({ where: { id: userId }, data: { points: { increment: award.amount } } }),
  ]);
}

/**
 * Marks today as active for the user. Idempotent per Asia/Kolkata calendar
 * day: the first call of the day extends/resets the streak and awards the
 * daily-login bonus plus any streak-milestone bonus; later calls are no-ops.
 */
export async function recordDailyActivity(userId: string) {
  const today = toDayKey();

  const already = await prisma.dailyActivity.findUnique({
    where: { userId_dateKey: { userId, dateKey: today } },
  });
  if (already) return null;

  try {
    await prisma.dailyActivity.create({ data: { userId, dateKey: today } });
  } catch {
    // Unique-constraint race with a concurrent request: that request owns the day.
    return null;
  }

  const [user, yesterdayActivity] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.dailyActivity.findUnique({
      where: { userId_dateKey: { userId, dateKey: shiftDayKey(today, -1) } },
    }),
  ]);
  if (!user) return null;

  const currentStreak = yesterdayActivity ? user.currentStreak + 1 : 1;
  const longestStreak = Math.max(currentStreak, user.longestStreak);

  const awards: PointsAward[] = [
    { amount: DAILY_LOGIN_POINTS, reason: "daily_login", label: "Daily login bonus" },
  ];
  const milestoneBonus = STREAK_MILESTONES[currentStreak];
  if (milestoneBonus) {
    awards.push({
      amount: milestoneBonus,
      reason: `streak_${currentStreak}`,
      label: `${currentStreak}-day streak bonus`,
    });
  }
  const earned = awards.reduce((sum, a) => sum + a.amount, 0);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak,
        longestStreak,
        lastActiveAt: new Date(),
        points: { increment: earned },
      },
    }),
    prisma.pointsTransaction.createMany({ data: awards.map((a) => ({ userId, ...a })) }),
    ...(milestoneBonus
      ? [
          prisma.notification.create({
            data: {
              userId,
              title: `🔥 ${currentStreak}-day streak!`,
              body: `You kept your learning streak alive for ${currentStreak} days and earned ${milestoneBonus} bonus points.`,
            },
          }),
        ]
      : []),
  ]);

  return { currentStreak, longestStreak, earned };
}

/**
 * Everything the dashboard needs to render streak, points and the activity
 * calendar. `activeDays` covers the last `days` calendar days.
 */
export async function getStreakSummary(userId: string, days = 186) {
  const since = shiftDayKey(toDayKey(), -days);

  const [user, activities, transactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { points: true, currentStreak: true, longestStreak: true, lastActiveAt: true },
    }),
    prisma.dailyActivity.findMany({
      where: { userId, dateKey: { gte: since } },
      select: { dateKey: true },
      orderBy: { dateKey: "asc" },
    }),
    prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  // A streak is only "current" if it includes today or yesterday.
  const today = toDayKey();
  const activeSet = new Set(activities.map((a) => a.dateKey));
  const streakAlive = activeSet.has(today) || activeSet.has(shiftDayKey(today, -1));

  return {
    points: user?.points ?? 0,
    currentStreak: streakAlive ? user?.currentStreak ?? 0 : 0,
    longestStreak: user?.longestStreak ?? 0,
    activeDays: activities.map((a) => a.dateKey),
    transactions: transactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      label: t.label,
      createdAt: t.createdAt.toISOString(),
    })),
  };
}
