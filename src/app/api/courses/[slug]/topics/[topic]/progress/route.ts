import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTutorialLesson, toTopicSlug } from "@/lib/freeCourseTutorial";
import { flattenCourseModules, getCourseModules } from "@/lib/freeCourseCurriculum";
import { comparePracticeSql } from "@/lib/freeCoursePracticeDb";
import { deriveChecks, evaluateChecks } from "@/lib/challengeChecks";

type RouteContext = { params: Promise<{ slug: string; topic: string }> };

async function updateTopicProgress(request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to update learning progress." }, { status: 401 });

  const { slug, topic } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || course.price !== 0) return NextResponse.json({ error: "Free course not found." }, { status: 404 });
  const topics = flattenCourseModules(getCourseModules(course.slug, JSON.parse(course.syllabus) as string[]));
  const topicTitle = topics.find((item) => toTopicSlug(item) === topic);
  if (!topicTitle) return NextResponse.json({ error: "Topic not found." }, { status: 404 });

  const lesson = buildTutorialLesson(slug, topicTitle, topics.indexOf(topicTitle));
  const body = await request.json().catch(() => null) as { source?: unknown; output?: unknown; lessonComplete?: unknown } | null;
  if (lesson.requiresCodeChallenge) {
    if (typeof body?.source !== "string" || typeof body.output !== "string" || body.source.length > 20000 || body.output.length > 5000) {
      return NextResponse.json({ error: "Run the lesson challenge before continuing." }, { status: 400 });
    }
    const normalizedSource = (value: string) => value.replace(/\r\n/g, "\n").trim();
    let outputMatches = body.output.trim() === lesson.challengeOutput.trim();
    // Requirement checks: the code must meet every requirement derived from the reference solution, not copy it verbatim.
    const sourceMatches = evaluateChecks(slug, deriveChecks(slug, lesson.challengeCode, lesson.kind), body.source).passed;
    const pythonRunnable = slug === "python-fundamentals" && lesson.kind !== "packages";
    let acceptedSource = pythonRunnable ? normalizedSource(body.source) !== normalizedSource(lesson.challengeStarter) : sourceMatches;
    if (slug === "sql-fundamentals" || slug === "mysql-fundamentals") {
      try {
        const result = await comparePracticeSql(body.source, lesson.challengeCode);
        outputMatches = result.output === body.output.trim();
        acceptedSource = result.passed;
      } catch {
        outputMatches = false;
        acceptedSource = false;
      }
    }
    if (!outputMatches || !acceptedSource) {
      return NextResponse.json({ error: "Challenge not passed yet. Check your code and its result, then try again." }, { status: 422 });
    }
  } else if (body?.lessonComplete !== true) {
    return NextResponse.json({ error: "Confirm that you have reviewed this lesson to continue." }, { status: 400 });
  }
  const topicIndex = topics.indexOf(topicTitle);
  const requiredPriorChallengeSlugs = topics.slice(0, topicIndex)
    .filter((title, index) => buildTutorialLesson(slug, title, index).requiresCodeChallenge)
    .map(toTopicSlug);
  const priorChallengesPassed = await prisma.courseTopicProgress.count({
    where: { userId: user.id, courseId: course.id, challengePassed: true, topicSlug: { in: requiredPriorChallengeSlugs } },
  });
  if (priorChallengesPassed !== requiredPriorChallengeSlugs.length) {
    return NextResponse.json({ error: "Pass the earlier required code challenges before continuing." }, { status: 403 });
  }

  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, select: { id: true, completedAt: true } });
  if (!enrollment) return NextResponse.json({ error: "Enroll in this course to update progress." }, { status: 403 });

  const result = await prisma.$transaction(async (tx) => {
    let pointsEarned = 0;
    const existing = await tx.courseTopicProgress.findUnique({
        where: { userId_courseId_topicSlug: { userId: user.id, courseId: course.id, topicSlug: topic } },
        select: { id: true, challengePassed: true },
      });
    if (!existing?.challengePassed) {
      if (existing) await tx.courseTopicProgress.update({ where: { id: existing.id }, data: { challengePassed: true } });
      else await tx.courseTopicProgress.create({ data: { userId: user.id, courseId: course.id, topicSlug: topic, challengePassed: true } });
      await tx.user.update({ where: { id: user.id }, data: { points: { increment: 10 } } });
      await tx.pointsTransaction.create({
        data: { userId: user.id, amount: 10, reason: lesson.requiresCodeChallenge ? "course_challenge" : "course_lesson", label: `${course.title}: ${topicTitle}` },
      });
      pointsEarned = 10;
    }
    const activeTopicSlugs = topics.map(toTopicSlug);
    const completedTopics = await tx.courseTopicProgress.count({ where: { userId: user.id, courseId: course.id, challengePassed: true, topicSlug: { in: activeTopicSlugs } } });
    const progress = topics.length ? Math.round((completedTopics / topics.length) * 100) : 0;
    await tx.enrollment.update({ where: { id: enrollment.id }, data: { progress, status: progress === 100 ? "completed" : "active", ...(progress === 100 && !enrollment.completedAt ? { completedAt: new Date() } : {}) } });
    return { completedTopics, totalTopics: topics.length, progress, pointsEarned };
  });

  return NextResponse.json({ ...result, completed: true });
}

export async function POST(_request: Request, context: RouteContext) {
  return updateTopicProgress(_request, context);
}
