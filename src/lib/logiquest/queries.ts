import type { LqDifficulty, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { dayKey } from "./progress";

export const PAGE_SIZE = 20;

export const listSelect = {
  id: true, slug: true, title: true, difficulty: true, topic: true, subtopic: true, tags: true, style: true,
  estimatedMinutes: true, xp: true, access: true, languages: true, attemptCount: true, solvedCount: true,
} satisfies Prisma.LqChallengeSelect;

export type ListItem = Prisma.LqChallengeGetPayload<{ select: typeof listSelect }> & {
  status: "solved" | "attempted" | "new";
  bookmarked: boolean;
  successRate: number | null;
};

export type ListFilters = {
  q?: string;
  difficulty?: string;
  topic?: string;
  language?: string;
  state?: string; // solved | unsolved | attempted | new | bookmarked
  page?: number;
};

const DIFFS = ["EASY", "MEDIUM", "HARD"];

/** Server-side filtering + pagination: the full question bank is never loaded at once. */
export async function listChallenges(filters: ListFilters, userId: string | null) {
  const page = Math.max(1, filters.page ?? 1);
  const and: Prisma.LqChallengeWhereInput[] = [{ status: "PUBLISHED" }, { category: "CODING" }];
  if (filters.q?.trim()) {
    const q = filters.q.trim().slice(0, 80);
    and.push({ OR: [
      { title: { contains: q, mode: "insensitive" } },
      { topic: { contains: q, mode: "insensitive" } },
      { subtopic: { contains: q, mode: "insensitive" } },
      { tags: { has: q.toLowerCase() } },
    ] });
  }
  if (filters.difficulty && DIFFS.includes(filters.difficulty)) and.push({ difficulty: filters.difficulty as LqDifficulty });
  if (filters.topic) and.push({ topic: filters.topic });
  if (filters.language) and.push({ languages: { has: filters.language } });
  if (userId) {
    if (filters.state === "solved") and.push({ progress: { some: { userId, solved: true } } });
    else if (filters.state === "unsolved") and.push({ progress: { none: { userId, solved: true } } });
    else if (filters.state === "attempted") and.push({ progress: { some: { userId, solved: false, attempts: { gt: 0 } } } });
    else if (filters.state === "new") and.push({ progress: { none: { userId, attempts: { gt: 0 } } } });
    else if (filters.state === "bookmarked") and.push({ bookmarks: { some: { userId } } });
  }
  const where: Prisma.LqChallengeWhereInput = { AND: and };

  const [total, rows] = await Promise.all([
    prisma.lqChallenge.count({ where }),
    prisma.lqChallenge.findMany({
      where, select: listSelect, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
      orderBy: [{ difficulty: "asc" }, { publishedAt: "desc" }, { title: "asc" }],
    }),
  ]);

  const ids = rows.map((r) => r.id);
  const [progress, marks] = userId && ids.length
    ? await Promise.all([
        prisma.lqProgress.findMany({ where: { userId, challengeId: { in: ids } }, select: { challengeId: true, solved: true, attempts: true } }),
        prisma.lqBookmark.findMany({ where: { userId, challengeId: { in: ids } }, select: { challengeId: true } }),
      ])
    : [[], []];
  const progressById = new Map(progress.map((p) => [p.challengeId, p]));
  const marked = new Set(marks.map((m) => m.challengeId));

  const items: ListItem[] = rows.map((r) => {
    const p = progressById.get(r.id);
    return {
      ...r,
      status: p?.solved ? "solved" : p && p.attempts > 0 ? "attempted" : "new",
      bookmarked: marked.has(r.id),
      successRate: r.attemptCount ? Math.round((r.solvedCount / r.attemptCount) * 100) : null,
    };
  });
  return { items, total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

export async function listTopics() {
  const rows = await prisma.lqChallenge.groupBy({ by: ["topic"], where: { status: "PUBLISHED", category: "CODING" }, _count: { _all: true }, orderBy: { topic: "asc" } });
  return rows.map((r) => ({ topic: r.topic, count: r._count._all }));
}

/** One deterministic challenge per calendar day (IST), so every learner sees the same Daily Challenge. */
export async function getDailyChallenge() {
  const total = await prisma.lqChallenge.count({ where: { status: "PUBLISHED", category: "CODING" } });
  if (!total) return null;
  const n = Number(dayKey().replace(/-/g, ""));
  const [row] = await prisma.lqChallenge.findMany({
    where: { status: "PUBLISHED", category: "CODING" }, select: listSelect,
    orderBy: { slug: "asc" }, skip: n % total, take: 1,
  });
  return row ?? null;
}

/**
 * Rule-based recommendations: the unsolved challenges in the learner's weakest topics (lowest pass rate over
 * their own attempts), then the next difficulty up from what they already solve, then easy starters.
 */
export async function getRecommendations(userId: string, take = 3) {
  const subs = await prisma.lqSubmission.findMany({
    where: { userId }, select: { verdict: true, challenge: { select: { topic: true } } },
    orderBy: { createdAt: "desc" }, take: 300,
  });
  const solvedIds = (await prisma.lqProgress.findMany({ where: { userId, solved: true }, select: { challengeId: true, challenge: { select: { difficulty: true } } } }));
  const solvedSet = solvedIds.map((s) => s.challengeId);

  const byTopic = new Map<string, { ok: number; all: number }>();
  for (const s of subs) {
    const t = byTopic.get(s.challenge.topic) ?? { ok: 0, all: 0 };
    t.all++; if (s.verdict === "ACCEPTED") t.ok++;
    byTopic.set(s.challenge.topic, t);
  }
  const weak = [...byTopic.entries()].filter(([, v]) => v.all >= 2 && v.ok / v.all < 0.6).sort((a, b) => a[1].ok / a[1].all - b[1].ok / b[1].all).map(([t]) => t);

  const base: Prisma.LqChallengeWhereInput = { status: "PUBLISHED", category: "CODING", id: { notIn: solvedSet } };
  const picks: (Awaited<ReturnType<typeof prisma.lqChallenge.findMany<{ select: typeof listSelect }>>>[number] & { reason: string })[] = [];
  const seen = new Set<string>();
  const push = (rows: typeof picks, reason: string) => { for (const r of rows) if (picks.length < take && !seen.has(r.id)) { seen.add(r.id); picks.push({ ...r, reason }); } };

  if (weak.length) {
    const rows = await prisma.lqChallenge.findMany({ where: { ...base, topic: { in: weak }, difficulty: "EASY" }, select: listSelect, take });
    push(rows as typeof picks, `Strengthen ${weak[0]}`);
  }
  const solvedMedium = solvedIds.filter((s) => s.challenge.difficulty === "EASY").length >= 3;
  const next = await prisma.lqChallenge.findMany({ where: { ...base, difficulty: solvedMedium ? "MEDIUM" : "EASY" }, select: listSelect, orderBy: { solvedCount: "desc" }, take });
  push(next as typeof picks, solvedMedium ? "Next level up" : "Good place to start");
  return picks;
}

export async function getUserOverview(userId: string) {
  const [stat, solvedProgress, subTotals, accepted, recent, days] = await Promise.all([
    prisma.lqUserStat.findUnique({ where: { userId } }),
    prisma.lqProgress.count({ where: { userId, solved: true } }),
    prisma.lqSubmission.count({ where: { userId } }),
    prisma.lqSubmission.count({ where: { userId, verdict: "ACCEPTED" } }),
    prisma.lqProgress.findMany({
      where: { userId, solved: false, attempts: { gt: 0 } }, orderBy: { updatedAt: "desc" }, take: 3,
      select: { attempts: true, bestPassed: true, challenge: { select: listSelect } },
    }),
    prisma.lqSubmission.findMany({ where: { userId, createdAt: { gte: new Date(Date.now() - 120 * 24 * 3600_000) } }, select: { createdAt: true } }),
  ]);
  const heat = new Map<string, number>();
  for (const d of days) heat.set(dayKey(d.createdAt), (heat.get(dayKey(d.createdAt)) ?? 0) + 1);
  const today = dayKey();
  const live = stat && (stat.lastActiveDay === today || stat.lastActiveDay === dayKey(new Date(Date.now() - 24 * 3600_000)));
  return {
    xp: stat?.xp ?? 0,
    solved: solvedProgress,
    streak: live ? stat!.currentStreak : 0,
    longestStreak: stat?.longestStreak ?? 0,
    accuracy: subTotals ? Math.round((accepted / subTotals) * 100) : null,
    submissions: subTotals,
    inProgress: recent,
    activity: Object.fromEntries(heat),
    hideProfile: stat?.hideProfile ?? false,
  };
}

export async function getChallengeForPage(slug: string, userId: string) {
  const challenge = await prisma.lqChallenge.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true, slug: true, title: true, category: true, difficulty: true, topic: true, subtopic: true, tags: true, style: true,
      statement: true, scenario: true, constraints: true, inputFormat: true, outputFormat: true, notes: true, examples: true,
      estimatedMinutes: true, xp: true, access: true, languages: true, starterCode: true, attemptCount: true, solvedCount: true,
      // Hints are NOT selected here: they are released one at a time by the hint API.
      hints: false,
    },
  });
  if (!challenge) return null;
  const [hintCount, progress, drafts, note, bookmarks, history, publicCases] = await Promise.all([
    prisma.lqChallenge.findUnique({ where: { id: challenge.id }, select: { hints: true, videoUrl: true, solution: true } }),
    prisma.lqProgress.findUnique({ where: { userId_challengeId: { userId, challengeId: challenge.id } } }),
    prisma.lqDraft.findMany({ where: { userId, challengeId: challenge.id }, select: { language: true, source: true } }),
    prisma.lqNote.findUnique({ where: { userId_challengeId: { userId, challengeId: challenge.id } }, select: { body: true } }),
    prisma.lqBookmark.findMany({ where: { userId, challengeId: challenge.id }, select: { kind: true } }),
    prisma.lqSubmission.findMany({ where: { userId, challengeId: challenge.id }, orderBy: { createdAt: "desc" }, take: 20, select: { id: true, language: true, verdict: true, passed: true, total: true, timeMs: true, attemptNo: true, xpAwarded: true, createdAt: true } }),
    prisma.lqTestCase.findMany({ where: { challengeId: challenge.id, isPublic: true }, orderBy: { position: "asc" }, select: { id: true, input: true, expected: true, label: true } }),
  ]);
  return {
    challenge,
    hintTotal: hintCount?.hints.length ?? 0,
    hintsUsed: progress?.hintsUsed ?? 0,
    // Hints already opened stay visible when the learner returns.
    openedHints: (hintCount?.hints ?? []).slice(0, progress?.hintsUsed ?? 0),
    hasSolution: Boolean(hintCount?.solution),
    hasVideo: Boolean(hintCount?.videoUrl),
    solved: progress?.solved ?? false,
    attempts: progress?.attempts ?? 0,
    drafts: Object.fromEntries(drafts.map((d) => [d.language, d.source])),
    note: note?.body ?? "",
    bookmarks: bookmarks.map((b) => b.kind),
    history,
    publicCases,
  };
}

/** Fisher–Yates shuffle (returns a new array). Used to vary practice sessions. */
export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
