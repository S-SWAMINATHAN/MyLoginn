import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildTutorialLesson, toTopicSlug } from "@/lib/freeCourseTutorial";
import { flattenCourseModules, getCourseModules } from "@/lib/freeCourseCurriculum";
import { LmsLearnHub } from "@/components/lms/LmsPages";

export default async function CourseLearnIndex({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug }, select: { id: true, price: true, syllabus: true, engine: true } });
  if (course?.engine === "lms") return <LmsLearnHub slug={slug} />;
  if (!course || course.price !== 0) notFound();
  const topics = flattenCourseModules(getCourseModules(slug, JSON.parse(course.syllabus) as string[]));
  if (!topics.length) redirect(`/courses/${slug}`);
  // Resume at the first topic the learner has not completed; fall back to the start for new or finished learners.
  const user = await getCurrentUser();
  const done = user ? new Set((await prisma.courseTopicProgress.findMany({ where: { userId: user.id, courseId: course.id, challengePassed: true }, select: { topicSlug: true } })).map((item) => item.topicSlug)) : new Set<string>();
  // Same rule as the lesson page: lessons without a code challenge are never marked done, so skip past them.
  const nextIndex = topics.findIndex((topic, i) => !done.has(toTopicSlug(topic)) && buildTutorialLesson(slug, topic, i).requiresCodeChallenge);
  const next = nextIndex >= 0 ? topics[nextIndex] : topics[0];
  redirect(`/courses/${slug}/learn/${toTopicSlug(next)}`);
}
