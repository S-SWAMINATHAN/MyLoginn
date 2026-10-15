import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildTutorialLesson } from "@/lib/freeCourseTutorial";
import { getCourseModules, isStepByStepCourse } from "@/lib/freeCourseCurriculum";
import { getCourseDisplayTitle } from "@/lib/freeCourseTitles";
import type { CourseMaterial } from "@/lib/createCourseMaterialPdf";

type RouteContext = { params: Promise<{ slug: string }> };

/** Full course study material (every module and lesson) for enrolled learners, used to build the downloadable PDF. */
export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to download the course materials." }, { status: 401 });
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || course.status !== "published" || !isStepByStepCourse(course)) return NextResponse.json({ error: "Course not found." }, { status: 404 });
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: course.id } }, select: { id: true } });
  if (!enrollment) return NextResponse.json({ error: "Enroll in this course to download its materials." }, { status: 403 });

  let index = 0;
  const modules = getCourseModules(course.slug, JSON.parse(course.syllabus) as string[]).map((module) => ({
    title: module.title,
    lessons: module.topics.map((title) => {
      const lesson = buildTutorialLesson(course.slug, title, index++);
      return {
        title,
        definition: lesson.definition,
        overview: lesson.overview,
        explanation: lesson.explanation,
        takeaways: lesson.takeaways,
        exampleTitle: lesson.exampleTitle,
        code: lesson.code,
        output: lesson.output,
        challenge: lesson.requiresCodeChallenge ? lesson.challenge : undefined,
      };
    }),
  }));

  const material: CourseMaterial = {
    courseTitle: getCourseDisplayTitle(course.slug, course.title),
    description: course.longDescription ?? course.description,
    modules,
  };
  return NextResponse.json(material, { headers: { "Cache-Control": "private, no-store" } });
}
