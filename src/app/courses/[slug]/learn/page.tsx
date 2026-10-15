import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildTutorialLesson, toTopicSlug } from "@/lib/freeCourseTutorial";
import { flattenCourseModules, getCourseModules, isStepByStepCourse } from "@/lib/freeCourseCurriculum";

export default async function CourseLearnIndex({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug }, select: { id: true, slug: true, price: true, syllabus: true, engine: true, status: true } });
  if (!course || course.status !== "published" || !isStepByStepCourse(course)) notFound();
  const topics = flattenCourseModules(getCourseModules(slug, JSON.parse(course.syllabus) as string[]));
  if (!topics.length) redirect(`/courses/${slug}`);
  // Lessons are for enrolled learners only; everyone else goes back to the course page to enroll.
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/courses/${slug}`)}`);
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, select: { id: true } });
  if (!enrollment) redirect(`/courses/${slug}`);
  // Resume at the first topic the learner has not completed; fall back to the start for new or finished learners.
  const done = new Set((await prisma.courseTopicProgress.findMany({ where: { userId: user.id, courseId: course.id, challengePassed: true }, select: { topicSlug: true } })).map((item) => item.topicSlug));
  // Same rule as the lesson page: lessons without a code challenge are never marked done, so skip past them.
  const nextIndex = topics.findIndex((topic, i) => !done.has(toTopicSlug(topic)) && buildTutorialLesson(slug, topic, i).requiresCodeChallenge);
  const next = nextIndex >= 0 ? topics[nextIndex] : topics[0];
  redirect(`/courses/${slug}/learn/${toTopicSlug(next)}`);
}
