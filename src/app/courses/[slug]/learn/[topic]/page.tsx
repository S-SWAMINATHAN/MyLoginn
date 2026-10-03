import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { toTopicSlug } from "@/lib/freeCourseTutorial";
import { CourseTutorial } from "@/components/courses/CourseTutorial";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CourseTopicPage({ params }: { params: Promise<{ slug: string; topic: string }> }) {
  const { slug, topic } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || course.price !== 0) notFound();

  const syllabus = JSON.parse(course.syllabus) as string[];
  if (!syllabus.length) redirect(`/courses/${slug}`);
  const index = syllabus.findIndex((title) => toTopicSlug(title) === topic);
  if (index < 0) notFound();

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, select: { id: true } });
  if (!enrollment) redirect(`/courses/${slug}`);

  return <CourseTutorial courseTitle={course.title} courseSlug={course.slug} topics={syllabus} index={index} />;
}
