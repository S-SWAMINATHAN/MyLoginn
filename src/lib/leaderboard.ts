import { prisma } from "./prisma";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  /** First name plus last initial only, so other learners never see full names. */
  name: string;
  avatarColor: string;
  avatarUrl: string | null;
  points: number;
  /** Current login streak in days, shown as the learner's subtitle. */
  streak: number;
  isYou: boolean;
};

export type LeaderboardData = { top: LeaderboardEntry[]; me: LeaderboardEntry | null; totalLearners: number };

function publicName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "Learner";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

/**
 * Ranks students by reward points *earned* (positive ledger entries), so spending points on solutions never drops
 * anyone down the board. `windowDays` limits the window (7 for the weekly board); omit it for all time.
 */
export async function getLeaderboard(currentUserId: string, windowDays?: number, size = 10): Promise<LeaderboardData> {
  const since = windowDays ? new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000) : undefined;
  const sums = await prisma.pointsTransaction.groupBy({
    by: ["userId"],
    where: { amount: { gt: 0 }, ...(since ? { createdAt: { gte: since } } : {}) },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 300,
  });
  if (sums.length === 0) return { top: [], me: null, totalLearners: 0 };

  const users = await prisma.user.findMany({
    where: { id: { in: sums.map((s) => s.userId) }, role: "STUDENT" },
    select: { id: true, name: true, avatarColor: true, avatarUrl: true, currentStreak: true },
  });
  const byId = new Map(users.map((u) => [u.id, u]));

  const ranked: LeaderboardEntry[] = [];
  for (const s of sums) {
    const u = byId.get(s.userId);
    if (!u) continue;
    ranked.push({
      rank: ranked.length + 1,
      userId: u.id,
      name: publicName(u.name),
      avatarColor: u.avatarColor,
      avatarUrl: u.avatarUrl,
      points: s._sum.amount ?? 0,
      streak: u.currentStreak,
      isYou: u.id === currentUserId,
    });
  }

  const top = ranked.slice(0, size);
  const me = ranked.find((e) => e.isYou && e.rank > size) ?? null;
  return { top, me, totalLearners: ranked.length };
}
