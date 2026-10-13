import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { effectiveRules, optionId, publishProblems, slugify, type CourseContent, type QuestionContent } from "./content";

export type ImportResult = {
  slug: string;
  status: string;
  lessons: number;
  questions: number;
  problems: string[];
  created: boolean;
};

const storedOptions = (q: QuestionContent) => q.options.map((text, i) => ({ id: optionId(i), text }));
const storedCorrect = (q: QuestionContent) => (Array.isArray(q.answer) ? q.answer : [q.answer]).map(optionId);
const questionType = (q: QuestionContent) => (Array.isArray(q.answer) && q.answer.length > 1 ? "multiple" : q.options.length === 2 && /^(true|yes)$/i.test(q.options[0]) ? "truefalse" : "single");

/** Syncs a question bank: matches by prompt, updates in place, creates new, archives removed (attempts keep their history). */
async function syncQuestions(quizId: string, questions: QuestionContent[]) {
  const existing = await prisma.quizQuestion.findMany({ where: { quizId } });
  const byPrompt = new Map(existing.map((q) => [q.prompt, q]));
  const keep = new Set<string>();
  const toCreate: { quizId: string; type: string; prompt: string; options: never; correct: never; explanation: string; points: number; position: number }[] = [];
  for (const [position, q] of questions.entries()) {
    const data = { type: questionType(q), prompt: q.prompt, options: storedOptions(q) as never, correct: storedCorrect(q) as never, explanation: q.explanation, points: q.points, position, archivedAt: null };
    const match = byPrompt.get(q.prompt);
    if (match) { keep.add(match.id); await prisma.quizQuestion.update({ where: { id: match.id }, data }); }
    else toCreate.push({ quizId, ...data, archivedAt: undefined } as never);
  }
  if (toCreate.length) await prisma.quizQuestion.createMany({ data: toCreate.map(({ ...row }) => row) });
  const stale = existing.filter((q) => !keep.has(q.id) && !q.archivedAt).map((q) => q.id);
  if (stale.length) await prisma.quizQuestion.updateMany({ where: { id: { in: stale } }, data: { archivedAt: new Date() } });
}

async function upsertQuiz(courseId: string, where: { lessonId?: string; kind: string }, data: { title: string; passPercent: number; questionCount?: number | null; timeLimitMinutes?: number | null; maxAttempts?: number | null; cooldownMinutes?: number }, questions: QuestionContent[]) {
  const found = await prisma.quiz.findFirst({ where: { courseId, kind: where.kind, ...(where.lessonId ? { lessonId: where.lessonId } : { lessonId: null }) }, orderBy: { createdAt: "asc" } });
  const payload = { title: data.title, passPercent: data.passPercent, questionCount: data.questionCount ?? null, timeLimitMinutes: data.timeLimitMinutes ?? null, maxAttempts: data.maxAttempts ?? null, cooldownMinutes: data.cooldownMinutes ?? 0, archivedAt: null };
  const quiz = found
    ? await prisma.quiz.update({ where: { id: found.id }, data: payload })
    : await prisma.quiz.create({ data: { courseId, lessonId: where.lessonId ?? null, kind: where.kind, ...payload } });
  await syncQuestions(quiz.id, questions);
}

/**
 * Idempotent import. Matches modules by title and lessons by slug, so re-importing an edited
 * course updates it in place. Anything no longer present is archived, never deleted, so learner
 * progress, attempts, payments and certificates are untouched.
 *
 * `publish` only takes effect when the content passes every publish rule; otherwise the course
 * is saved as a draft and the unmet rules are returned.
 */
export async function importCourse(content: CourseContent, options: { publish?: boolean } = {}): Promise<ImportResult> {
  const clash = await prisma.course.findUnique({ where: { slug: content.slug }, select: { engine: true, id: true, status: true } });
  if (clash && clash.engine !== "lms") {
    throw new Error(`A legacy course already uses the slug "${content.slug}". Choose a different slug; legacy courses are never overwritten.`);
  }

  const problems = publishProblems(content);
  const wantPublish = Boolean(options.publish) && problems.length === 0;
  const lessonTitles = content.modules.flatMap((m) => m.lessons.map((l) => l.title));

  const base = {
    title: content.title, category: content.category, level: content.level, description: content.description, longDescription: content.longDescription ?? null,
    instructor: content.instructor, instructorTitle: content.instructorTitle ?? null, durationWeeks: content.durationWeeks, price: content.price, originalPrice: content.originalPrice ?? null,
    imageColor: content.imageColor, tags: JSON.stringify(content.tags), syllabus: JSON.stringify(lessonTitles),
    engine: "lms", track: content.track ?? null, languageTag: content.languageTag ?? null, validityDays: content.validityDays ?? null, renewalPrice: content.renewalPrice ?? null,
    passPercent: content.passPercent, aiCoachEnabled: content.aiCoachEnabled, sequential: content.sequential, audience: content.audience ?? null,
    prerequisitesText: content.prerequisitesText ?? null, objectives: content.objectives as never, prerequisiteSlugs: content.prerequisiteSlugs as never, relatedSlugs: content.relatedSlugs as never,
  };
  // Publishing needs every rule met. A re-import never silently changes the status of an existing course
  // (live stays live, archived stays archived); only an explicit, passing publish request promotes a draft.
  const status = wantPublish ? "published" : clash?.status ?? "draft";
  const course = clash
    ? await prisma.course.update({ where: { id: clash.id }, data: { ...base, status } })
    : await prisma.course.create({ data: { slug: content.slug, ...base, status } });

  const [existingModules, existingLessons] = await Promise.all([
    prisma.courseModule.findMany({ where: { courseId: course.id } }),
    prisma.lesson.findMany({ where: { courseId: course.id } }),
  ]);
  const moduleByTitle = new Map(existingModules.map((m) => [m.title, m]));
  const lessonBySlug = new Map(existingLessons.map((l) => [l.slug, l]));
  const keepModules = new Set<string>();
  const keepLessons = new Set<string>();
  const usedSlugs = new Set<string>();
  let questions = 0;

  for (const [mi, m] of content.modules.entries()) {
    const modData = { title: m.title, summary: m.summary ?? null, position: mi + 1, required: m.required, archivedAt: null };
    const mod = moduleByTitle.get(m.title)
      ? await prisma.courseModule.update({ where: { id: moduleByTitle.get(m.title)!.id }, data: modData })
      : await prisma.courseModule.create({ data: { courseId: course.id, ...modData } });
    keepModules.add(mod.id);

    for (const [li, l] of m.lessons.entries()) {
      let slug = l.slug || slugify(l.title);
      for (let n = 2; usedSlugs.has(slug); n++) slug = `${l.slug || slugify(l.title)}-${n}`;
      usedSlugs.add(slug);
      const data = {
        moduleId: mod.id, title: l.title, summary: l.summary ?? null, position: li + 1, contentMd: l.content, videoUrl: l.videoUrl ?? null, explainer: (l.explainer ?? Prisma.DbNull) as never,
        videoDurationSeconds: l.videoDurationSeconds ?? null, estimatedMinutes: l.minutes, required: l.required, rules: effectiveRules(l) as never, archivedAt: null,
      };
      const found = lessonBySlug.get(slug);
      const lesson = found
        ? await prisma.lesson.update({ where: { id: found.id }, data })
        : await prisma.lesson.create({ data: { courseId: course.id, slug, ...data } });
      keepLessons.add(lesson.id);

      // Lesson quiz
      const existingQuiz = await prisma.quiz.findFirst({ where: { lessonId: lesson.id, kind: "lesson" } });
      if (l.quiz) {
        await upsertQuiz(course.id, { lessonId: lesson.id, kind: "lesson" }, { title: `${l.title}: quiz`, passPercent: l.quiz.passPercent }, l.quiz.questions);
        questions += l.quiz.questions.length;
      } else if (existingQuiz && !existingQuiz.archivedAt) {
        await prisma.quiz.update({ where: { id: existingQuiz.id }, data: { archivedAt: new Date() } });
      }

      // Coding challenge (one per lesson, matched by lesson)
      const existingChallenge = await prisma.codingChallenge.findFirst({ where: { lessonId: lesson.id } });
      if (l.challenge) {
        const c = l.challenge;
        const cData = {
          title: c.title, language: c.language, difficulty: c.difficulty, statement: c.statement, starterCode: c.starterCode, tests: c.tests as never, checks: c.checks as never,
          hints: c.hints as never, solutionCode: c.solutionCode ?? null, solutionExplanation: c.solutionExplanation ?? null, points: c.points, required: effectiveRules(l).code, position: li, archivedAt: null,
        };
        if (existingChallenge) await prisma.codingChallenge.update({ where: { id: existingChallenge.id }, data: cData });
        else await prisma.codingChallenge.create({ data: { courseId: course.id, lessonId: lesson.id, ...cData } });
      } else if (existingChallenge && !existingChallenge.archivedAt) {
        await prisma.codingChallenge.update({ where: { id: existingChallenge.id }, data: { archivedAt: new Date() } });
      }

      // Assignment (one per lesson)
      const existingAssignment = await prisma.courseAssignment.findFirst({ where: { lessonId: lesson.id } });
      if (l.assignment) {
        const a = l.assignment;
        const aData = { kind: a.kind, title: a.title, brief: a.brief, rubric: a.rubric ?? null, required: effectiveRules(l).assignment && a.required, position: li, archivedAt: null };
        if (existingAssignment) await prisma.courseAssignment.update({ where: { id: existingAssignment.id }, data: aData });
        else await prisma.courseAssignment.create({ data: { courseId: course.id, lessonId: lesson.id, ...aData } });
      } else if (existingAssignment && !existingAssignment.archivedAt) {
        await prisma.courseAssignment.update({ where: { id: existingAssignment.id }, data: { archivedAt: new Date() } });
      }
    }
  }

  const staleModules = existingModules.filter((m) => !keepModules.has(m.id) && !m.archivedAt).map((m) => m.id);
  const staleLessons = existingLessons.filter((l) => !keepLessons.has(l.id) && !l.archivedAt).map((l) => l.id);
  if (staleModules.length) await prisma.courseModule.updateMany({ where: { id: { in: staleModules } }, data: { archivedAt: new Date() } });
  if (staleLessons.length) await prisma.lesson.updateMany({ where: { id: { in: staleLessons } }, data: { archivedAt: new Date() } });

  // Final assessment
  const finalQuiz = await prisma.quiz.findFirst({ where: { courseId: course.id, kind: "final" } });
  if (content.finalAssessment) {
    const f = content.finalAssessment;
    await upsertQuiz(course.id, { kind: "final" }, { title: f.title, passPercent: content.passPercent, questionCount: f.questionCount ?? null, timeLimitMinutes: f.timeLimitMinutes ?? null, maxAttempts: f.maxAttempts ?? null, cooldownMinutes: f.cooldownMinutes }, f.questions);
    questions += f.questions.length;
  } else if (finalQuiz && !finalQuiz.archivedAt) {
    await prisma.quiz.update({ where: { id: finalQuiz.id }, data: { archivedAt: new Date() } });
  }

  // Course-level projects (no lesson), matched by title
  const existingProjects = await prisma.courseAssignment.findMany({ where: { courseId: course.id, lessonId: null } });
  const keepProjects = new Set<string>();
  for (const [i, p] of content.projects.entries()) {
    const data = { kind: p.kind, title: p.title, brief: p.brief, rubric: p.rubric ?? null, required: p.required, position: i, archivedAt: null };
    const found = existingProjects.find((e) => e.title === p.title);
    if (found) { keepProjects.add(found.id); await prisma.courseAssignment.update({ where: { id: found.id }, data }); }
    else keepProjects.add((await prisma.courseAssignment.create({ data: { courseId: course.id, lessonId: null, ...data } })).id);
  }
  const staleProjects = existingProjects.filter((p) => !keepProjects.has(p.id) && !p.archivedAt).map((p) => p.id);
  if (staleProjects.length) await prisma.courseAssignment.updateMany({ where: { id: { in: staleProjects } }, data: { archivedAt: new Date() } });

  return { slug: course.slug, status, lessons: keepLessons.size, questions, problems, created: !clash };
}
