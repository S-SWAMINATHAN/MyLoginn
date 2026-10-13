import { prisma } from "@/lib/prisma";

export type Period = "all" | "month" | "week";

export type LqLeaderEntry = {
  rank: number;
  userId: string;
  name: string;
  avatarColor: string | null;
  avatarUrl: string | null;
  xp: number;
  solved: number;
  accuracy: number;
  streak: number;
  score: number;
  isYou: boolean;
};

function publicName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "Learner";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

function since(period: Period) {
  if (period === "all") return undefined;
  return new Date(Date.now() - (period === "week" ? 7 : 30) * 24 * 3600_000);
}

/**
 * Balanced skill score, computed on the server from real activity:
 *   score = XP (difficulty-weighted) + 15 x distinct topics solved (diversity) + accuracy% x 1.5 (only once 5+ submissions)
 * Spamming submissions cannot raise XP (first solve only) or accuracy (wrong attempts lower it).
 */
export function skillScore(xp: number, topics: number, accuracy: number, submissions: number) {
  return Math.round(xp + topics * 15 + (submissions >= 5 ? accuracy * 1.5 : 0));
}

export async function getLogiQuestLeaderboard(currentUserId: string | null, period: Period, size = 25): Promise<{ top: LqLeaderEntry[]; me: LqLeaderEntry | null }> {
  const from = since(period);
  const sums = await prisma.lqXpEvent.groupBy({
    by: ["userId"],
    where: from ? { createdAt: { gte: from } } : {},
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 300,
  });
  if (!sums.length) return { top: [], me: null };
  const ids = sums.map((s) => s.userId);

  const [users, stats, subs, solves] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, avatarColor: true, avatarUrl: true } }),
    prisma.lqUserStat.findMany({ where: { userId: { in: ids } }, select: { userId: true, currentStreak: true, hideProfile: true } }),
    prisma.lqSubmission.groupBy({ by: ["userId", "verdict"], where: { userId: { in: ids }, ...(from ? { createdAt: { gte: from } } : {}) }, _count: { _all: true } }),
    prisma.lqProgress.findMany({ where: { userId: { in: ids }, solved: true, ...(from ? { solvedAt: { gte: from } } : {}) }, select: { userId: true, challenge: { select: { topic: true } } } }),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));
  const statById = new Map(stats.map((s) => [s.userId, s]));
  const counts = new Map<string, { all: number; ok: number }>();
  for (const row of subs) {
    const c = counts.get(row.userId) ?? { all: 0, ok: 0 };
    c.all += row._count._all;
    if (row.verdict === "ACCEPTED") c.ok += row._count._all;
    counts.set(row.userId, c);
  }
  const topics = new Map<string, Set<string>>();
  const solvedCount = new Map<string, number>();
  for (const p of solves) {
    (topics.get(p.userId) ?? topics.set(p.userId, new Set()).get(p.userId)!).add(p.challenge.topic);
    solvedCount.set(p.userId, (solvedCount.get(p.userId) ?? 0) + 1);
  }

  const entries: Omit<LqLeaderEntry, "rank">[] = [];
  for (const s of sums) {
    const u = userById.get(s.userId);
    if (!u) continue;
    const st = statById.get(s.userId);
    const c = counts.get(s.userId) ?? { all: 0, ok: 0 };
    const accuracy = c.all ? Math.round((c.ok / c.all) * 100) : 0;
    const xp = s._sum.amount ?? 0;
    const hidden = st?.hideProfile && u.id !== currentUserId;
    entries.push({
      userId: u.id,
      name: hidden ? "Private learner" : u.id === currentUserId ? u.name : publicName(u.name),
      avatarColor: hidden ? null : u.avatarColor,
      avatarUrl: hidden ? null : u.avatarUrl,
      xp,
      solved: solvedCount.get(s.userId) ?? 0,
      accuracy,
      streak: st?.currentStreak ?? 0,
      score: skillScore(xp, topics.get(s.userId)?.size ?? 0, accuracy, c.all),
      isYou: u.id === currentUserId,
    });
  }
  entries.sort((a, b) => b.score - a.score || b.xp - a.xp);
  const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));
  return { top: ranked.slice(0, size), me: ranked.find((e) => e.isYou) ?? null };
}
