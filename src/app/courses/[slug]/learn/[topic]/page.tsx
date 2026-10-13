import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildTutorialLesson, toTopicSlug } from "@/lib/freeCourseTutorial";
import { CourseTutorial } from "@/components/courses/CourseTutorial";
import { flattenCourseModules, getCourseModules } from "@/lib/freeCourseCurriculum";
import { getCourseDisplayTitle } from "@/lib/freeCourseTitles";
import { LmsLessonView } from "@/components/lms/LmsPages";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CourseTopicPage({ params }: { params: Promise<{ slug: string; topic: string }> }) {
  const { slug, topic } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (course?.engine === "lms") return <LmsLessonView slug={slug} lessonSlug={topic} />;
  if (!course || course.price !== 0) notFound();

  const syllabus = flattenCourseModules(getCourseModules(course.slug, JSON.parse(course.syllabus) as string[]));
  if (!syllabus.length) redirect(`/courses/${slug}`);
  const index = syllabus.findIndex((title) => toTopicSlug(title) === topic);
  if (index < 0) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, select: { id: true } });
  if (!enrollment) redirect(`/courses/${slug}`);
  const completedTopics = await prisma.courseTopicProgress.findMany({ where: { userId: user.id, courseId: course.id, challengePassed: true }, select: { topicSlug: true } });
  const activeTopicSlugs = new Set(syllabus.map(toTopicSlug));
  const completedTopicSlugs = completedTopics.map((item) => item.topicSlug).filter((topicSlug) => activeTopicSlugs.has(topicSlug));
  const completedSet = new Set(completedTopicSlugs);
  let unlockedIndex = 0;
  while (unlockedIndex < syllabus.length && (completedSet.has(toTopicSlug(syllabus[unlockedIndex])) || !buildTutorialLesson(slug, syllabus[unlockedIndex], unlockedIndex).requiresCodeChallenge)) unlockedIndex += 1;
  if (index > unlockedIndex) redirect(`/courses/${slug}/learn/${toTopicSlug(syllabus[unlockedIndex])}`);
  const progress = syllabus.length ? Math.round((completedTopicSlugs.length / syllabus.length) * 100) : 0;

  return <CourseTutorial courseTitle={getCourseDisplayTitle(course.slug, course.title)} courseSlug={course.slug} learnerName={user.name.trim() || "MyLoginn"} topics={syllabus} index={index} completedTopicSlugs={completedTopicSlugs} courseProgress={progress} />;
}
