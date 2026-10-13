import { prisma } from "@/lib/prisma";
import { computeCourseView, normalizeRules, type CourseView, type LessonDef, type LessonProgressState, type ModuleDef } from "./progression";

export type CourseStructure = {
  course: {
    id: string; slug: string; title: string; status: string; price: number; passPercent: number; sequential: boolean;
    aiCoachEnabled: boolean; validityDays: number | null; renewalPrice: number | null; level: string; engine: string;
  };
  modules: (ModuleDef & { summary: string | null })[];
  lessons: (LessonDef & { slug: string; summary: string | null; estimatedMinutes: number })[];
  finalQuizId: string | null;
};

/** Structure of an LMS course as the progression engine sees it (archived rows excluded). */
export async function loadStructure(slug: string): Promise<CourseStructure | null> {
  const course = await prisma.course.findUnique({
    where: { slug },
    select: {
      id: true, slug: true, title: true, status: true, price: true, passPercent: true, sequential: true, aiCoachEnabled: true,
      validityDays: true, renewalPrice: true, level: true, engine: true,
      modules: { where: { archivedAt: null }, orderBy: { position: "asc" }, select: { id: true, title: true, summary: true, position: true, required: true } },
      lessons: {
        where: { archivedAt: null },
        orderBy: [{ position: "asc" }],
        select: {
          id: true, moduleId: true, slug: true, title: true, summary: true, position: true, required: true, rules: true,
          videoMinPercent: true, estimatedMinutes: true, prerequisites: { select: { requiresLessonId: true } },
        },
      },
      quizzes: { where: { kind: "final", archivedAt: null, questions: { some: { archivedAt: null } } }, select: { id: true }, take: 1 },
    },
  });
  if (!course || course.engine !== "lms") return null;

  const { modules, lessons, quizzes, ...rest } = course;
  // Course order = module position, then lesson position. Every consumer ("next lesson", the outline) relies on this.
  const modulePos = new Map(modules.map((m) => [m.id, m.position]));
  const ordered = lessons
    .filter((l) => modulePos.has(l.moduleId))
    .sort((a, b) => (modulePos.get(a.moduleId)! - modulePos.get(b.moduleId)!) || a.position - b.position);
  return {
    course: rest,
    modules,
    lessons: ordered.map((l) => ({
      id: l.id, moduleId: l.moduleId, slug: l.slug, title: l.title, summary: l.summary, position: l.position, required: l.required,
      rules: normalizeRules(l.rules as never), videoMinPercent: l.videoMinPercent, estimatedMinutes: l.estimatedMinutes,
      prerequisiteIds: l.prerequisites.map((p) => p.requiresLessonId),
    })),
    finalQuizId: quizzes[0]?.id ?? null,
  };
}

export type LearnerState = {
  view: CourseView;
  progress: Record<string, LessonProgressState>;
  finalBestPercent: number | null;
  finalAttempts: number;
};

/** The learner's computed position in a course. This is the single source of truth for every write endpoint. */
export async function loadLearnerState(userId: string, structure: CourseStructure): Promise<LearnerState> {
  const courseId = structure.course.id;
  const [rows, finalAgg, finalAttempts, projects] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId, courseId } }),
    structure.finalQuizId
      ? prisma.quizAttempt.aggregate({ where: { userId, quizId: structure.finalQuizId, status: "submitted" }, _max: { percent: true }, _count: true })
      : Promise.resolve(null),
    structure.finalQuizId ? prisma.quizAttempt.count({ where: { userId, quizId: structure.finalQuizId } }) : Promise.resolve(0),
    prisma.courseAssignment.findMany({
      where: { courseId, lessonId: null, required: true, archivedAt: null },
      select: { id: true, title: true, submissions: { where: { userId, status: "approved" }, select: { id: true } } },
    }),
  ]);

  const progress: Record<string, LessonProgressState> = {};
  for (const r of rows) progress[r.lessonId] = r;

  const finalBestPercent = finalAgg && finalAgg._count > 0 ? finalAgg._max.percent : null;
  const view = computeCourseView({
    modules: structure.modules,
    lessons: structure.lessons,
    sequential: structure.course.sequential,
    progress,
    hasFinal: structure.finalQuizId !== null,
    finalBestPercent,
    passPercent: structure.course.passPercent,
    requiredProjects: projects.map((p) => ({ id: p.id, title: p.title, approved: p.submissions.length > 0 })),
  });
  return { view, progress, finalBestPercent, finalAttempts };
}
