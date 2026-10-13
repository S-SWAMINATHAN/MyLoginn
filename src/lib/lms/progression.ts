/**
 * Lesson unlocking, completion and certificate eligibility. Pure functions over plain data.
 *
 * Defaults (all admin-configurable per course / lesson):
 *  - lessons unlock sequentially across the whole course;
 *  - optional lessons and optional modules never block anything after them;
 *  - explicit prerequisites always apply, even when `sequential` is off;
 *  - the final assessment unlocks when every required lesson is complete;
 *  - the certificate needs the final assessment passed at >= passPercent (default 60).
 */

export type LessonRules = {
  read?: boolean;
  video?: boolean;
  quiz?: boolean;
  code?: boolean;
  assignment?: boolean;
};

export type LessonDef = {
  id: string;
  moduleId: string;
  title: string;
  position: number;
  required: boolean;
  rules: LessonRules;
  videoMinPercent: number;
  prerequisiteIds: string[];
};

export type ModuleDef = {
  id: string;
  title: string;
  position: number;
  required: boolean;
};

export type LessonProgressState = {
  readAt?: Date | string | null;
  videoPercent?: number | null;
  quizPassedAt?: Date | string | null;
  codePassedAt?: Date | string | null;
  assignmentApprovedAt?: Date | string | null;
  completedAt?: Date | string | null;
};

export type LessonStatus = "locked" | "available" | "in_progress" | "completed";

export type LessonView = {
  id: string;
  moduleId: string;
  status: LessonStatus;
  /** Why it is locked, in learner-facing words. Empty unless status is "locked". */
  lockReason: string;
  /** What is still missing for an unlocked, unfinished lesson. */
  missing: string[];
};

export type ModuleView = {
  id: string;
  required: boolean;
  completed: boolean;
  /** Required lessons done / required lessons total (0..100). */
  percent: number;
  locked: boolean;
};

export type CourseView = {
  lessons: LessonView[];
  modules: ModuleView[];
  requiredTotal: number;
  requiredDone: number;
  percent: number;
  nextLessonId: string | null;
  allRequiredLessonsDone: boolean;
  finalUnlocked: boolean;
  finalLockReason: string;
  finalPassed: boolean;
  projectsDone: boolean;
  certificateEligible: boolean;
  certificateLockReason: string;
};

export type CourseInput = {
  modules: ModuleDef[];
  lessons: LessonDef[];
  sequential: boolean;
  progress: Record<string, LessonProgressState | undefined>;
  hasFinal: boolean;
  /** Best submitted final-assessment percentage, or null if never attempted. */
  finalBestPercent: number | null;
  passPercent: number;
  /** Required course-level projects (no lesson attached) and whether each is approved. */
  requiredProjects: { id: string; title: string; approved: boolean }[];
};

const has = (value: unknown) => value !== null && value !== undefined && value !== false;

/** Rules default to "read the lesson" when an admin sets none. */
export function normalizeRules(rules: LessonRules | null | undefined): Required<LessonRules> {
  const r = rules ?? {};
  const any = Boolean(r.read || r.video || r.quiz || r.code || r.assignment);
  return { read: any ? Boolean(r.read) : true, video: Boolean(r.video), quiz: Boolean(r.quiz), code: Boolean(r.code), assignment: Boolean(r.assignment) };
}

/** What is still missing for this lesson under its own completion rules. */
export function missingRequirements(lesson: Pick<LessonDef, "rules" | "videoMinPercent">, p: LessonProgressState | undefined): string[] {
  const rules = normalizeRules(lesson.rules);
  const missing: string[] = [];
  if (rules.read && !has(p?.readAt)) missing.push("Read the lesson");
  if (rules.video && (p?.videoPercent ?? 0) < lesson.videoMinPercent) missing.push(`Watch at least ${lesson.videoMinPercent}% of the video`);
  if (rules.quiz && !has(p?.quizPassedAt)) missing.push("Pass the lesson quiz");
  if (rules.code && !has(p?.codePassedAt)) missing.push("Pass the coding exercise");
  if (rules.assignment && !has(p?.assignmentApprovedAt)) missing.push("Get the assignment approved");
  return missing;
}

export function isLessonSatisfied(lesson: Pick<LessonDef, "rules" | "videoMinPercent">, p: LessonProgressState | undefined): boolean {
  return missingRequirements(lesson, p).length === 0;
}

/** A lesson counts as completed once `completedAt` was recorded, even if rules changed later. */
export const isLessonCompleted = (p: LessonProgressState | undefined) => has(p?.completedAt);

export function orderLessons(modules: ModuleDef[], lessons: LessonDef[]): LessonDef[] {
  const modulePos = new Map(modules.map((m) => [m.id, m.position]));
  return [...lessons]
    .filter((l) => modulePos.has(l.moduleId))
    .sort((a, b) => (modulePos.get(a.moduleId)! - modulePos.get(b.moduleId)!) || a.position - b.position);
}

export function computeCourseView(input: CourseInput): CourseView {
  const { modules, sequential, progress } = input;
  const ordered = orderLessons(modules, input.lessons);
  const moduleById = new Map(modules.map((m) => [m.id, m]));
  const lessonById = new Map(ordered.map((l) => [l.id, l]));
  const done = (id: string) => isLessonCompleted(progress[id]);
  const blocking = (l: LessonDef) => l.required && (moduleById.get(l.moduleId)?.required ?? true);

  const lessonViews: LessonView[] = [];
  let firstOpenBlocker: LessonDef | null = null; // earliest blocking lesson not yet completed

  for (const lesson of ordered) {
    let lockReason = "";

    // Explicit prerequisites apply regardless of `sequential`.
    for (const reqId of lesson.prerequisiteIds) {
      const req = lessonById.get(reqId);
      if (req && !done(reqId)) {
        lockReason = `Complete the prerequisite lesson "${req.title}" first.`;
        break;
      }
    }

    if (!lockReason && sequential && firstOpenBlocker) {
      const blockerModule = moduleById.get(firstOpenBlocker.moduleId);
      lockReason = firstOpenBlocker.moduleId === lesson.moduleId
        ? `Complete the previous lesson "${firstOpenBlocker.title}" first.`
        : `Finish the module "${blockerModule?.title ?? "before this one"}" first.`;
    }

    const p = progress[lesson.id];
    let status: LessonStatus;
    if (done(lesson.id)) status = "completed";
    else if (lockReason) status = "locked";
    else if (has(p?.readAt) || (p?.videoPercent ?? 0) > 0 || has(p?.quizPassedAt) || has(p?.codePassedAt)) status = "in_progress";
    else status = "available";

    lessonViews.push({
      id: lesson.id,
      moduleId: lesson.moduleId,
      status,
      lockReason: status === "locked" ? lockReason : "",
      missing: status === "completed" || status === "locked" ? [] : missingRequirements(lesson, p),
    });

    if (!done(lesson.id) && blocking(lesson) && !firstOpenBlocker) firstOpenBlocker = lesson;
  }

  // Modules
  const moduleViews: ModuleView[] = [...modules].sort((a, b) => a.position - b.position).map((m) => {
    const required = ordered.filter((l) => l.moduleId === m.id && l.required);
    const doneCount = required.filter((l) => done(l.id)).length;
    const lessonsInModule = lessonViews.filter((l) => l.moduleId === m.id);
    return {
      id: m.id,
      required: m.required,
      completed: required.length > 0 && doneCount === required.length,
      percent: required.length ? Math.floor((doneCount * 100) / required.length) : 0,
      locked: lessonsInModule.length > 0 && lessonsInModule.every((l) => l.status === "locked"),
    };
  });

  const requiredLessons = ordered.filter((l) => l.required && (moduleById.get(l.moduleId)?.required ?? true));
  const requiredDone = requiredLessons.filter((l) => done(l.id)).length;
  const requiredTotal = requiredLessons.length;
  const allRequiredLessonsDone = requiredTotal > 0 && requiredDone === requiredTotal;
  const percent = requiredTotal ? Math.floor((requiredDone * 100) / requiredTotal) : 0;

  const nextLesson = lessonViews.find((v) => v.status === "in_progress") ?? lessonViews.find((v) => v.status === "available") ?? null;

  const finalUnlocked = input.hasFinal && allRequiredLessonsDone;
  const finalLockReason = !input.hasFinal
    ? "This course has no final assessment yet."
    : finalUnlocked
      ? ""
      : `Complete all required lessons to unlock the final assessment (${requiredDone}/${requiredTotal} done).`;
  const finalPassed = input.finalBestPercent !== null && input.finalBestPercent >= input.passPercent;
  const projectsDone = input.requiredProjects.every((project) => project.approved);

  let certificateLockReason = "";
  if (!input.hasFinal) certificateLockReason = "This course has no final assessment, so no certificate can be issued.";
  else if (!allRequiredLessonsDone) certificateLockReason = "Complete all required lessons first.";
  else if (!projectsDone) certificateLockReason = `Get the required project approved: ${input.requiredProjects.find((p) => !p.approved)?.title}.`;
  else if (input.finalBestPercent === null) certificateLockReason = `Take the final assessment and score at least ${input.passPercent}%.`;
  else if (!finalPassed) certificateLockReason = `Your best final score is ${input.finalBestPercent}%. You need at least ${input.passPercent}% to earn the certificate.`;

  return {
    lessons: lessonViews,
    modules: moduleViews,
    requiredTotal,
    requiredDone,
    percent,
    nextLessonId: nextLesson?.id ?? null,
    allRequiredLessonsDone,
    finalUnlocked,
    finalLockReason,
    finalPassed,
    projectsDone,
    certificateEligible: certificateLockReason === "",
    certificateLockReason,
  };
}

/**
 * Guard used by every write endpoint: may this learner act on this lesson right now?
 * Returns the lock reason, or null when the lesson is open.
 */
export function lessonLockReason(view: CourseView, lessonId: string): string | null {
  const lesson = view.lessons.find((l) => l.id === lessonId);
  if (!lesson) return "Lesson not found.";
  return lesson.status === "locked" ? lesson.lockReason : null;
}

/**
 * Minimum time a learner must have had the lesson open before "read" can be recorded.
 * Stops a script from completing a whole course in seconds. 20% of the estimate, 10s..180s.
 */
export function minReadSeconds(estimatedMinutes: number): number {
  const base = Math.round((Number.isFinite(estimatedMinutes) ? estimatedMinutes : 10) * 60 * 0.2);
  return Math.min(180, Math.max(10, base));
}
