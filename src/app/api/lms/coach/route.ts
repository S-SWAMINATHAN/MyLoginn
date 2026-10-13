import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GeminiError, isGeminiConfigured, streamGeminiReply } from "@/lib/gemini";
import { readJson, requireLessonLearner } from "@/lib/lms/guard";
import { buildCoachSystemPrompt, coachRateLimit, isCoachMode, type CoachLanguage, type CoachLevel } from "@/lib/lms/coach";
import { getAiLimits } from "@/lib/lms/settings";

export const runtime = "nodejs";

const LEVELS: CoachLevel[] = ["beginner", "intermediate", "advanced"];

/**
 * AI Teaching Coach. The model key stays on the server, the context is the approved lesson only,
 * and every failure returns a clean error so lessons, quizzes and exercises keep working without it.
 */
export async function POST(req: Request) {
  const body = await readJson<{ lessonId?: unknown; mode?: unknown; message?: unknown; code?: unknown; language?: unknown; level?: unknown; topics?: unknown }>(req, 20_000);
  if (!body || typeof body.lessonId !== "string" || !isCoachMode(body.mode)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  // Same gate as the lesson itself: logged in, entitled and the lesson unlocked. Previewing admins may use it too.
  const guard = await requireLessonLearner(body.lessonId);
  if (!guard.ok) return guard.response;
  const { user, structure } = guard.ctx;
  if (!structure.course.aiCoachEnabled) return NextResponse.json({ error: "The AI Coach is turned off for this course." }, { status: 403 });
  if (!isGeminiConfigured()) return NextResponse.json({ error: "The AI Coach is not available right now. Your lessons, quizzes and exercises still work." }, { status: 503 });

  const limits = await getAiLimits();
  const message = typeof body.message === "string" ? body.message.trim().slice(0, limits.maxQuestionChars) : "";
  const code = typeof body.code === "string" ? body.code.slice(0, 4000) : "";
  const topics = Array.isArray(body.topics) ? body.topics.filter((t): t is string => typeof t === "string").slice(0, 8).map((t) => t.slice(0, 120)) : [];
  if ((body.mode === "ask" || body.mode === "why_wrong" || body.mode === "debug") && !message && !code) {
    return NextResponse.json({ error: "Type your question or paste your code first." }, { status: 400 });
  }
  const language: CoachLanguage = body.language === "ta" ? "ta" : "en";
  const level: CoachLevel = LEVELS.includes(body.level as CoachLevel) ? (body.level as CoachLevel) : structure.course.level === "Advanced" ? "advanced" : structure.course.level === "Intermediate" ? "intermediate" : "beginner";

  const recent = await prisma.aiCoachUsage.findMany({ where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 86_400_000) } }, select: { createdAt: true } });
  const limited = coachRateLimit(recent.map((r) => r.createdAt), limits, new Date());
  if (limited) return NextResponse.json({ error: limited.message, retryAfterSeconds: limited.retryAfterSeconds }, { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } });

  const lesson = await prisma.lesson.findUnique({ where: { id: body.lessonId }, select: { title: true, contentMd: true, module: { select: { title: true } } } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  const idx = structure.lessons.findIndex((l) => l.id === body.lessonId);
  const next = structure.lessons[idx + 1];

  const system = buildCoachSystemPrompt({
    courseTitle: structure.course.title, courseLevel: structure.course.level, moduleTitle: lesson.module.title, lessonTitle: lesson.title, lessonText: lesson.contentMd,
    syllabus: structure.lessons.map((l) => l.title), nextEligibleLesson: next?.title ?? null,
  }, body.mode, language, level);

  const userTurn = [
    message && `Learner message:\n${message}`,
    code && `Learner code:\n\`\`\`\n${code}\n\`\`\``,
    topics.length && `Topics the learner struggled with: ${topics.join("; ")}`,
  ].filter(Boolean).join("\n\n") || "Please help with this lesson.";

  await prisma.aiCoachUsage.create({ data: { userId: user.id, courseId: structure.course.id, lessonId: body.lessonId, mode: body.mode, language } });
  try {
    const { stream } = await streamGeminiReply(system, [{ role: "user", content: userTurn }], req.signal);
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("AI coach error", error instanceof GeminiError ? error.kind : error);
    return NextResponse.json({ error: "The AI Coach is temporarily unavailable. Your lessons, quizzes and exercises still work." }, { status: 502 });
  }
}
