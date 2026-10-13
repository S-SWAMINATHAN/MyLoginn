/**
 * Reward values and idempotency keys. Pure. Values are suggestions that an administrator
 * can override (LmsSetting "rewards"); nothing here is a fixed business rule.
 */

export type RewardConfig = {
  lesson: number;
  quiz: number;
  challenge: number;
  module: number;
  course: number;
  /** Extra points for each daily-streak milestone; keys are streak lengths. Empty = use the platform defaults. */
  streakMilestones: Record<string, number>;
  dailyLogin: number | null;
};

export const DEFAULT_REWARDS: RewardConfig = {
  lesson: 10,
  quiz: 15,
  challenge: 20,
  module: 50,
  course: 100,
  streakMilestones: {},
  dailyLogin: null,
};

const MAX_REWARD = 100_000;

const sanitizeInt = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_REWARD ? value : fallback;

/** Merge stored admin JSON over the defaults, discarding anything malformed. */
export function resolveRewards(stored: unknown): RewardConfig {
  const s = (stored && typeof stored === "object" ? stored : {}) as Record<string, unknown>;
  const milestones: Record<string, number> = {};
  if (s.streakMilestones && typeof s.streakMilestones === "object") {
    for (const [days, pts] of Object.entries(s.streakMilestones as Record<string, unknown>)) {
      if (/^\d{1,4}$/.test(days) && Number(days) > 0) milestones[days] = sanitizeInt(pts, 0);
    }
  }
  return {
    lesson: sanitizeInt(s.lesson, DEFAULT_REWARDS.lesson),
    quiz: sanitizeInt(s.quiz, DEFAULT_REWARDS.quiz),
    challenge: sanitizeInt(s.challenge, DEFAULT_REWARDS.challenge),
    module: sanitizeInt(s.module, DEFAULT_REWARDS.module),
    course: sanitizeInt(s.course, DEFAULT_REWARDS.course),
    streakMilestones: milestones,
    dailyLogin: s.dailyLogin === null || s.dailyLogin === undefined ? null : sanitizeInt(s.dailyLogin, 0),
  };
}

/**
 * One key per (user, thing, kind). The ledger has a unique index on this key, so a repeated
 * submission, a double click or a retried request can never award twice.
 */
export const rewardKey = {
  lesson: (userId: string, lessonId: string) => `lesson:${userId}:${lessonId}`,
  quiz: (userId: string, quizId: string) => `quiz:${userId}:${quizId}`,
  challenge: (userId: string, challengeId: string) => `challenge:${userId}:${challengeId}`,
  module: (userId: string, moduleId: string) => `module:${userId}:${moduleId}`,
  course: (userId: string, courseId: string) => `course:${userId}:${courseId}`,
  badge: (userId: string, badgeKey: string) => `badge:${userId}:${badgeKey}`,
};

export type BadgeRule = { type: "lessons_completed" | "courses_completed" | "streak" | "points" | "perfect_quiz"; threshold: number };

export type LearnerStats = { lessonsCompleted: number; coursesCompleted: number; longestStreak: number; points: number; perfectQuizzes: number };

export function badgeEarned(rule: BadgeRule, stats: LearnerStats): boolean {
  if (!Number.isFinite(rule.threshold) || rule.threshold <= 0) return false;
  switch (rule.type) {
    case "lessons_completed": return stats.lessonsCompleted >= rule.threshold;
    case "courses_completed": return stats.coursesCompleted >= rule.threshold;
    case "streak": return stats.longestStreak >= rule.threshold;
    case "points": return stats.points >= rule.threshold;
    case "perfect_quiz": return stats.perfectQuizzes >= rule.threshold;
    default: return false;
  }
}

/** Starter badges seeded once; an administrator can edit or disable them. */
export const DEFAULT_BADGES: { key: string; name: string; description: string; icon: string; rule: BadgeRule }[] = [
  { key: "first-lesson", name: "First Step", description: "Completed your first lesson.", icon: "footprints", rule: { type: "lessons_completed", threshold: 1 } },
  { key: "ten-lessons", name: "On a Roll", description: "Completed 10 lessons.", icon: "flame", rule: { type: "lessons_completed", threshold: 10 } },
  { key: "fifty-lessons", name: "Dedicated Learner", description: "Completed 50 lessons.", icon: "book-open", rule: { type: "lessons_completed", threshold: 50 } },
  { key: "first-course", name: "Course Complete", description: "Earned your first course certificate.", icon: "graduation-cap", rule: { type: "courses_completed", threshold: 1 } },
  { key: "three-courses", name: "Triple Certified", description: "Earned 3 course certificates.", icon: "award", rule: { type: "courses_completed", threshold: 3 } },
  { key: "week-streak", name: "7-Day Streak", description: "Learned 7 days in a row.", icon: "calendar-check", rule: { type: "streak", threshold: 7 } },
  { key: "month-streak", name: "30-Day Streak", description: "Learned 30 days in a row.", icon: "trophy", rule: { type: "streak", threshold: 30 } },
  { key: "perfect-quiz", name: "Perfect Score", description: "Scored 100% on a quiz or assessment.", icon: "star", rule: { type: "perfect_quiz", threshold: 1 } },
];
