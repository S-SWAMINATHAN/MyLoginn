import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTutorialLesson, toTopicSlug } from "@/lib/freeCourseTutorial";
import { flattenCourseModules, getCourseModules, isStepByStepCourse } from "@/lib/freeCourseCurriculum";

const SOLUTION_COST = 8;

type RouteContext = { params: Promise<{ slug: string; topic: string }> };

async function resolveChallenge({ params }: RouteContext, userId: string) {
  const { slug, topic } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || !isStepByStepCourse(course)) return null;
  // Paid course solutions are part of the paid content: only enrolled learners may see or unlock them.
  if (course.price > 0 && !(await prisma.enrollment.findUnique({ where: { userId_courseId: { userId, courseId: course.id } }, select: { id: true } }))) return null;
  const topics = flattenCourseModules(getCourseModules(course.slug, JSON.parse(course.syllabus) as string[]));
  const title = topics.find((item) => toTopicSlug(item) === topic);
  if (!title) return null;
  const lesson = buildTutorialLesson(slug, title, topics.indexOf(title));
  if (!lesson.requiresCodeChallenge) return null;
  return { course, topic, lesson };
}

/** Whether this learner has already unlocked the solution, plus their balance. */
export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ loggedIn: false, unlocked: false, cost: SOLUTION_COST, points: 0 });
  const challenge = await resolveChallenge(context, user.id);
  if (!challenge) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });

  const [unlock, fresh] = await Promise.all([
    prisma.solutionUnlock.findUnique({ where: { userId_courseId_topicSlug: { userId: user.id, courseId: challenge.course.id, topicSlug: challenge.topic } } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { points: true } }),
  ]);
  return NextResponse.json({ loggedIn: true, unlocked: Boolean(unlock), cost: SOLUTION_COST, points: fresh?.points ?? 0 });
}

/** Spends reward points to unlock the solution. Already-unlocked topics are never charged again. */
export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to unlock solutions with reward points." }, { status: 401 });
  const challenge = await resolveChallenge(context, user.id);
  if (!challenge) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: challenge.course.id } },
    select: { id: true },
  });
  if (!enrollment) return NextResponse.json({ error: "Enroll in this course to unlock solutions." }, { status: 403 });

  const key = { userId_courseId_topicSlug: { userId: user.id, courseId: challenge.course.id, topicSlug: challenge.topic } };
  const outcome = await prisma.$transaction(async (tx) => {
    if (await tx.solutionUnlock.findUnique({ where: key })) return { charged: false as const };
    // Conditional decrement keeps the balance from going negative under concurrent requests.
    const spent = await tx.user.updateMany({ where: { id: user.id, points: { gte: SOLUTION_COST } }, data: { points: { decrement: SOLUTION_COST } } });
    if (spent.count === 0) return null;
    await tx.solutionUnlock.create({ data: { userId: user.id, courseId: challenge.course.id, topicSlug: challenge.topic, cost: SOLUTION_COST } });
    await tx.pointsTransaction.create({
      data: { userId: user.id, amount: -SOLUTION_COST, reason: "solution_unlock", label: `${challenge.course.title}: solution unlocked` },
    });
    return { charged: true as const };
  });

  const fresh = await prisma.user.findUnique({ where: { id: user.id }, select: { points: true } });
  const points = fresh?.points ?? 0;
  if (!outcome) {
    return NextResponse.json({ error: `You need ${SOLUTION_COST} reward points to unlock this solution. You have ${points}.`, points, cost: SOLUTION_COST }, { status: 402 });
  }
  return NextResponse.json({ unlocked: true, charged: outcome.charged, cost: SOLUTION_COST, points });
}
