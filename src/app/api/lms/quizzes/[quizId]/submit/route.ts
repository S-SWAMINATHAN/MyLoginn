import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJson, requireCourseLearner, requireLessonLearner } from "@/lib/lms/guard";
import { submitQuizAttempt } from "@/lib/lms/quizService";

export async function POST(request: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { course: { select: { slug: true } } } });
  if (!quiz || quiz.archivedAt) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  const guard = quiz.kind === "lesson" && quiz.lessonId
    ? await requireLessonLearner(quiz.lessonId, { write: true })
    : await requireCourseLearner(quiz.course.slug, { write: true });
  if (!guard.ok) return guard.response;

  const body = await readJson<{ attemptId?: unknown; answers?: unknown }>(request);
  if (!body || typeof body.attemptId !== "string" || typeof body.answers !== "object" || body.answers === null) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const result = await submitQuizAttempt(guard.ctx.user, guard.ctx.structure, quiz, body.attemptId, body.answers as Record<string, unknown>);
  if (!result.ok) return NextResponse.json({ error: result.error, reason: result.reason }, { status: result.status });
  return NextResponse.json(result.payload);
}
