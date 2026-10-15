// TEMPORARY dev-only preview for responsive/audio testing. Delete before committing.
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseTutorial } from "@/components/courses/CourseTutorial";
import { flattenCourseModules, getCourseModules } from "@/lib/freeCourseCurriculum";
import { getCourseDisplayTitle } from "@/lib/freeCourseTitles";

export default async function Page({ searchParams }: { searchParams: Promise<{ c?: string; i?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { c = "python-fundamentals", i = "2" } = await searchParams;
  const course = await prisma.course.findUnique({ where: { slug: c } });
  if (!course) notFound();
  const topics = flattenCourseModules(getCourseModules(course.slug, JSON.parse(course.syllabus) as string[]));
  return <CourseTutorial courseTitle={getCourseDisplayTitle(course.slug, course.title)} courseSlug={course.slug} learnerName="Preview" topics={topics} index={Math.min(Number(i), topics.length - 1)} completedTopicSlugs={[]} courseProgress={0} />;
}
