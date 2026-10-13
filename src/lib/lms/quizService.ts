import { prisma } from "@/lib/prisma";
import { awardEarnedBadges } from "./badges";
import { issueCertificateIfEligible } from "./certificates";
import { markQuizPassed } from "./completion";
import { awardOnce } from "./points";
import { canStartAttempt, drawQuestions, gradeAttempt, hasPassed, isAttemptExpired, toClientQuestion, type Answers } from "./quiz";
import { toStored } from "./quizRows";
import { rewardKey } from "./rewards";
import { getRewardConfig } from "./settings";
import { loadLearnerState, type CourseStructure } from "./state";

type Quiz = { id: string; courseId: string; kind: string; lessonId: string | null; title: string; passPercent: number; questionCount: number | null; timeLimitMinutes: number | null; maxAttempts: number | null; cooldownMinutes: number };
type Fail = { ok: false; status: number; error: string; reason?: string; retryAt?: string };

export const passMarkFor = (quiz: Pick<Quiz, "kind" | "passPercent">, structure: CourseStructure) => (quiz.kind === "final" ? structure.course.passPercent : quiz.passPercent);

/** Starts (or resumes) an attempt. Questions are drawn on the server and returned WITHOUT the answer key. */
export async function startQuizAttempt(userId: string, structure: CourseStructure, quiz: Quiz) {
  if (quiz.kind === "final") {
    const state = await loadLearnerState(userId, structure);
    if (!state.view.finalUnlocked) return { ok: false, status: 423, error: state.view.finalLockReason, reason: "locked" } satisfies Fail;
  }

  const attempts = await prisma.quizAttempt.findMany({ where: { userId, quizId: quiz.id }, orderBy: { startedAt: "asc" }, select: { id: true, status: true, startedAt: true, submittedAt: true, questionIds: true } });
  const now = new Date();
  const policy = { maxAttempts: quiz.maxAttempts, cooldownMinutes: quiz.cooldownMinutes, timeLimitMinutes: quiz.timeLimitMinutes };

  const stale = attempts.filter((a) => a.status === "in_progress" && isAttemptExpired(a, policy.timeLimitMinutes, now));
  if (stale.length) {
    await prisma.quizAttempt.updateMany({ where: { id: { in: stale.map((a) => a.id) } }, data: { status: "expired" } });
    for (const a of stale) a.status = "expired";
  }

  const decision = canStartAttempt(attempts, policy, now);
  if (!decision.ok) return { ok: false, status: 429, error: decision.reason, retryAt: decision.retryAt?.toISOString() } satisfies Fail;

  let attemptId: string;
  let questionIds: string[];
  let startedAt: Date;
  if (decision.resume) {
    const open = attempts.find((a) => a.status === "in_progress")!;
    attemptId = open.id; questionIds = open.questionIds as string[]; startedAt = open.startedAt;
  } else {
    const bank = await prisma.quizQuestion.findMany({ where: { quizId: quiz.id, archivedAt: null }, orderBy: { position: "asc" } });
    if (bank.length === 0) return { ok: false, status: 409, error: "This assessment has no questions yet." } satisfies Fail;
    const drawn = drawQuestions(bank, quiz.questionCount);
    questionIds = drawn.map((q) => q.id);
    const created = await prisma.quizAttempt.create({ data: { userId, quizId: quiz.id, courseId: quiz.courseId, questionIds, maxPoints: drawn.reduce((s, q) => s + q.points, 0) } });
    attemptId = created.id; startedAt = created.startedAt;
  }

  const rows = await prisma.quizQuestion.findMany({ where: { id: { in: questionIds } } });
  const byId = new Map(rows.map((r) => [r.id, r]));
  const questions = questionIds.map((id) => byId.get(id)).filter((q): q is NonNullable<typeof q> => Boolean(q)).map((q) => toClientQuestion(toStored(q)));
  return {
    ok: true as const,
    payload: { attemptId, kind: quiz.kind, title: quiz.title, startedAt: startedAt.toISOString(), timeLimitMinutes: quiz.timeLimitMinutes, passPercent: passMarkFor(quiz, structure), questions },
  };
}

/** Grades an attempt on the server, records it once, and applies every consequence (points, lesson completion, certificate). */
export async function submitQuizAttempt(user: { id: string; name: string }, structure: CourseStructure, quiz: Quiz, attemptId: string, rawAnswers: Record<string, unknown>) {
  const attempt = await prisma.quizAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt || attempt.userId !== user.id || attempt.quizId !== quiz.id) return { ok: false, status: 404, error: "Attempt not found." } satisfies Fail;
  if (attempt.status !== "in_progress") return { ok: false, status: 409, error: "This attempt was already submitted." } satisfies Fail;

  const now = new Date();
  if (isAttemptExpired(attempt, quiz.timeLimitMinutes, now)) {
    await prisma.quizAttempt.updateMany({ where: { id: attempt.id, status: "in_progress" }, data: { status: "expired" } });
    return { ok: false, status: 410, error: "Time is up for this attempt.", reason: "expired" } satisfies Fail;
  }

  const rows = await prisma.quizQuestion.findMany({ where: { id: { in: attempt.questionIds as string[] } } });
  const served = rows.map(toStored);
  const answers: Answers = {};
  for (const [id, value] of Object.entries(rawAnswers)) {
    if (typeof value === "string") answers[id] = value;
    else if (Array.isArray(value) && value.every((v) => typeof v === "string")) answers[id] = value as string[];
  }
  const graded = gradeAttempt(served, answers);
  const passMark = passMarkFor(quiz, structure);
  const passed = hasPassed(graded.scorePoints, graded.maxPoints, passMark);

  // Conditional update: exactly one concurrent submit wins.
  const saved = await prisma.quizAttempt.updateMany({
    where: { id: attempt.id, status: "in_progress" },
    data: { status: "submitted", submittedAt: now, answers: answers as never, scorePoints: graded.scorePoints, maxPoints: graded.maxPoints, percent: graded.percent, passed },
  });
  if (saved.count !== 1) return { ok: false, status: 409, error: "This attempt was already submitted." } satisfies Fail;

  let pointsAwarded = 0;
  let certificateSerial: string | null = null;
  if (passed) {
    const rewards = await getRewardConfig();
    if (await awardOnce(user.id, rewardKey.quiz(user.id, quiz.id), rewards.quiz, "lms_quiz", `${structure.course.title}: ${quiz.title}`)) pointsAwarded += rewards.quiz;
    if (quiz.kind === "lesson" && quiz.lessonId) await markQuizPassed(user.id, structure, quiz.lessonId);
    if (quiz.kind === "final") {
      const issued = await issueCertificateIfEligible(user, structure);
      if (issued.ok) certificateSerial = issued.certificate.serial;
    }
  }
  if (graded.percent === 100) await awardEarnedBadges(user.id).catch(() => undefined);

  // Lesson quizzes are practice, so they reveal answers; the final reveals explanations for missed questions only.
  const reveal = quiz.kind === "lesson";
  const results = graded.perQuestion.map((r) => {
    const q = served.find((s) => s.id === r.id)!;
    return { id: r.id, correct: r.correct, explanation: reveal || !r.correct ? q.explanation ?? null : null, ...(reveal ? { correctOptionIds: q.correct } : {}) };
  });
  return {
    ok: true as const,
    payload: {
      percent: graded.percent, scorePoints: graded.scorePoints, maxPoints: graded.maxPoints, passed, passPercent: passMark, pointsAwarded, results, certificateSerial,
      message: passed ? `Passed with ${graded.percent}%.` : `You scored ${graded.percent}%. You need ${passMark}% to pass.`,
    },
  };
}
