import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toTopicSlug } from "@/lib/freeCourseTutorial";

export default async function CourseLearnIndex({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug }, select: { price: true, syllabus: true } });
  if (!course || course.price !== 0) notFound();
  const topics = JSON.parse(course.syllabus) as string[];
  if (!topics.length) redirect(`/courses/${slug}`);
  redirect(`/courses/${slug}/learn/${toTopicSlug(topics[0])}`);
}
