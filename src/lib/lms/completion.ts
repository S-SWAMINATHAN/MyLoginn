import { prisma } from "@/lib/prisma";
import { recordDailyActivity } from "@/lib/streak";
import { awardOnce } from "./points";
import { getRewardConfig } from "./settings";
import { rewardKey } from "./rewards";
import { isLessonSatisfied, minReadSeconds } from "./progression";
import { loadLearnerState, type CourseStructure } from "./state";
import { applyVideoReport, type VideoReport } from "./video";
import { awardEarnedBadges } from "./badges";

export type CompletionResult = {
  ok: boolean;
  error?: string;
  retryAfterSeconds?: number;
  lessonCompleted: boolean;
  newlyCompleted: boolean;
  pointsAwarded: number;
  moduleCompleted: boolean;
  percent: number;
};

const empty = (over: Partial<CompletionResult> = {}): CompletionResult => ({ ok: true, lessonCompleted: false, newlyCompleted: false, pointsAwarded: 0, moduleCompleted: false, percent: 0, ...over });

export async function ensureLessonProgress(userId: string, courseId: string, lessonId: string) {
  return prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {},
    create: { userId, courseId, lessonId },
  });
}

/**
 * Re-evaluates a lesson against its completion rules and, the first time it is satisfied,
 * records completion and grants rewards. Everything is guarded by a conditional update and
 * idempotency keys, so concurrent or repeated calls cannot complete or reward twice.
 */
export async function finalizeLesson(userId: string, structure: CourseStructure, lessonId: string): Promise<CompletionResult> {
  const lesson = structure.lessons.find((l) => l.id === lessonId);
  if (!lesson) return empty({ ok: false, error: "Lesson not found." });
  const row = await ensureLessonProgress(userId, structure.course.id, lessonId);

  let newlyCompleted = false;
  if (!row.completedAt && isLessonSatisfied(lesson, row)) {
    const res = await prisma.lessonProgress.updateMany({ where: { id: row.id, completedAt: null }, data: { completedAt: new Date() } });
    newlyCompleted = res.count === 1;
  }

  let pointsAwarded = 0;
  let moduleCompleted = false;
  if (newlyCompleted) {
    const rewards = await getRewardConfig();
    if (lesson.required && (await awardOnce(userId, rewardKey.lesson(userId, lessonId), rewards.lesson, "lms_lesson", `${structure.course.title}: ${lesson.title}`))) {
      pointsAwarded += rewards.lesson;
    }
    await recordDailyActivity(userId).catch((e) => console.error("streak update failed", e));

    const state = await loadLearnerState(userId, structure);
    const moduleView = state.view.modules.find((m) => m.id === lesson.moduleId);
    if (moduleView?.completed) {
      moduleCompleted = true;
      const mod = structure.modules.find((m) => m.id === lesson.moduleId);
      if (await awardOnce(userId, rewardKey.module(userId, lesson.moduleId), rewards.module, "lms_module", `${structure.course.title}: finished module "${mod?.title ?? ""}"`)) {
        pointsAwarded += rewards.module;
      }
    }
    await prisma.enrollment.updateMany({ where: { userId, courseId: structure.course.id }, data: { progress: Math.min(99, state.view.percent) } });
    await awardEarnedBadges(userId).catch((e) => console.error("badge award failed", e));
    return empty({ lessonCompleted: true, newlyCompleted, pointsAwarded, moduleCompleted, percent: state.view.percent });
  }

  return empty({ lessonCompleted: Boolean(row.completedAt) || newlyCompleted });
}

export async function recordRead(userId: string, structure: CourseStructure, lessonId: string): Promise<CompletionResult> {
  const lesson = structure.lessons.find((l) => l.id === lessonId);
  if (!lesson) return empty({ ok: false, error: "Lesson not found." });
  const row = await ensureLessonProgress(userId, structure.course.id, lessonId);
  if (!row.readAt) {
    const needed = minReadSeconds(lesson.estimatedMinutes);
    const elapsed = Math.floor((Date.now() - row.startedAt.getTime()) / 1000);
    if (elapsed < needed) {
      return empty({ ok: false, error: "Take your time with this lesson, then mark it as read.", retryAfterSeconds: needed - elapsed });
    }
    await prisma.lessonProgress.updateMany({ where: { id: row.id, readAt: null }, data: { readAt: new Date() } });
  }
  return finalizeLesson(userId, structure, lessonId);
}

export async function recordVideo(userId: string, structure: CourseStructure, lessonId: string, report: VideoReport): Promise<CompletionResult & { videoPercent: number }> {
  const lesson = structure.lessons.find((l) => l.id === lessonId);
  if (!lesson) return { ...empty({ ok: false, error: "Lesson not found." }), videoPercent: 0 };
  const [row, lessonRow] = await Promise.all([
    ensureLessonProgress(userId, structure.course.id, lessonId),
    prisma.lesson.findUnique({ where: { id: lessonId }, select: { videoDurationSeconds: true, videoUrl: true } }),
  ]);
  if (!lessonRow?.videoUrl) return { ...empty({ ok: false, error: "This lesson has no video to track." }), videoPercent: 0 };

  const now = new Date();
  const update = applyVideoReport({ watchedSeconds: row.videoSeconds, lastReportAt: row.videoLastReportAt }, report, now, lessonRow.videoDurationSeconds);
  if (!update.accepted) return { ...empty({ ok: false, error: "Invalid video report." }), videoPercent: row.videoPercent };

  const videoPercent = Math.max(row.videoPercent, update.percent);
  await prisma.lessonProgress.update({
    where: { id: row.id },
    data: { videoSeconds: Math.max(row.videoSeconds, update.watchedSeconds), videoPercent, videoLastReportAt: now },
  });
  const result = await finalizeLesson(userId, structure, lessonId);
  return { ...result, videoPercent };
}

/** A lesson's quiz requirement is met when its quiz was passed. */
export async function markQuizPassed(userId: string, structure: CourseStructure, lessonId: string) {
  const row = await ensureLessonProgress(userId, structure.course.id, lessonId);
  if (!row.quizPassedAt) await prisma.lessonProgress.updateMany({ where: { id: row.id, quizPassedAt: null }, data: { quizPassedAt: new Date() } });
  return finalizeLesson(userId, structure, lessonId);
}

/** The code requirement is met when every required, active challenge attached to the lesson has a passing submission. */
export async function syncCodeRequirement(userId: string, structure: CourseStructure, lessonId: string) {
  const challenges = await prisma.codingChallenge.findMany({
    where: { lessonId, required: true, archivedAt: null },
    select: { id: true, submissions: { where: { userId, passed: true }, select: { id: true }, take: 1 } },
  });
  const row = await ensureLessonProgress(userId, structure.course.id, lessonId);
  if (challenges.length > 0 && challenges.every((c) => c.submissions.length > 0) && !row.codePassedAt) {
    await prisma.lessonProgress.updateMany({ where: { id: row.id, codePassedAt: null }, data: { codePassedAt: new Date() } });
  }
  return finalizeLesson(userId, structure, lessonId);
}

export async function syncAssignmentRequirement(userId: string, structure: CourseStructure, lessonId: string) {
  const assignments = await prisma.courseAssignment.findMany({
    where: { lessonId, required: true, archivedAt: null },
    select: { id: true, submissions: { where: { userId, status: "approved" }, select: { id: true }, take: 1 } },
  });
  const row = await ensureLessonProgress(userId, structure.course.id, lessonId);
  if (assignments.length > 0 && assignments.every((a) => a.submissions.length > 0) && !row.assignmentApprovedAt) {
    await prisma.lessonProgress.updateMany({ where: { id: row.id, assignmentApprovedAt: null }, data: { assignmentApprovedAt: new Date() } });
  }
  return finalizeLesson(userId, structure, lessonId);
}
