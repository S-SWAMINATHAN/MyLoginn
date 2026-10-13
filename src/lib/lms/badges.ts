import { prisma } from "@/lib/prisma";
import { badgeEarned, DEFAULT_BADGES, type BadgeRule, type LearnerStats } from "./rewards";
import { isUniqueViolation } from "./points";

/** Idempotent: creates the starter badge set the first time it runs. An admin can edit or disable them afterwards. */
export async function ensureDefaultBadges() {
  const count = await prisma.badge.count();
  if (count > 0) return;
  await prisma.badge.createMany({
    data: DEFAULT_BADGES.map((b) => ({ key: b.key, name: b.name, description: b.description, icon: b.icon, rule: b.rule as never })),
    skipDuplicates: true,
  });
}

export async function loadLearnerStats(userId: string): Promise<LearnerStats> {
  const [user, lessonsCompleted, coursesCompleted, perfectQuizzes] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { points: true, longestStreak: true } }),
    prisma.lessonProgress.count({ where: { userId, completedAt: { not: null } } }),
    prisma.certificate.count({ where: { userId } }),
    prisma.quizAttempt.count({ where: { userId, status: "submitted", percent: 100, maxPoints: { gt: 0 } } }),
  ]);
  return { lessonsCompleted, coursesCompleted, longestStreak: user?.longestStreak ?? 0, points: user?.points ?? 0, perfectQuizzes };
}

/** Awards every active badge whose rule the learner now meets. Safe to call after any progress event. */
export async function awardEarnedBadges(userId: string): Promise<string[]> {
  await ensureDefaultBadges();
  const [badges, owned, stats] = await Promise.all([
    prisma.badge.findMany({ where: { active: true } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    loadLearnerStats(userId),
  ]);
  const ownedIds = new Set(owned.map((o) => o.badgeId));
  const awarded: string[] = [];
  for (const badge of badges) {
    if (ownedIds.has(badge.id) || !badgeEarned(badge.rule as unknown as BadgeRule, stats)) continue;
    try {
      await prisma.$transaction([
        prisma.userBadge.create({ data: { userId, badgeId: badge.id } }),
        prisma.notification.create({ data: { userId, title: `Badge earned: ${badge.name}`, body: badge.description } }),
      ]);
      awarded.push(badge.name);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  return awarded;
}
