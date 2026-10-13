import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCourseLearner, requireLessonLearner } from "@/lib/lms/guard";
import { startQuizAttempt } from "@/lib/lms/quizService";

export async function POST(_request: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { course: { select: { slug: true } } } });
  if (!quiz || quiz.archivedAt || quiz.kind === "module") return NextResponse.json({ error: "Quiz not found." }, { status: 404 });

  // Lesson quizzes need their lesson unlocked; the final assessment needs every required lesson done (checked in the service).
  const guard = quiz.kind === "lesson" && quiz.lessonId
    ? await requireLessonLearner(quiz.lessonId, { write: true })
    : await requireCourseLearner(quiz.course.slug, { write: true });
  if (!guard.ok) return guard.response;

  const result = await startQuizAttempt(guard.ctx.user.id, guard.ctx.structure, quiz);
  if (!result.ok) return NextResponse.json({ error: result.error, reason: result.reason, retryAt: result.retryAt }, { status: result.status });
  return NextResponse.json(result.payload);
}
