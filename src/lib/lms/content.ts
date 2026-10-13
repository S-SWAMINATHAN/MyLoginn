/**
 * Course content format (what admins import/export and what seed files author) plus the
 * publish-readiness rules. Pure: no database access, so it is unit-testable and shared by the
 * importer, the admin "Publish" button and the CLI.
 */
import { z } from "zod";

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;

export const slugify = (value: string) => value.toLowerCase().trim().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const questionSchema = z.object({
  prompt: z.string().trim().min(8).max(600),
  options: z.array(z.string().trim().min(1).max(300)).min(2).max(6),
  /** Index (or indexes, for multiple-answer) into `options`. */
  answer: z.union([z.number().int().min(0), z.array(z.number().int().min(0)).min(1)]),
  explanation: z.string().trim().min(10).max(800),
  points: z.number().int().min(1).max(10).default(1),
});
export type QuestionContent = z.infer<typeof questionSchema>;

const challengeSchema = z.object({
  title: z.string().trim().min(3).max(120),
  language: z.string().trim().min(1).max(30),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  statement: z.string().trim().min(30).max(4000),
  starterCode: z.string().max(8000).default(""),
  tests: z.array(z.object({ input: z.string().max(2000).default(""), expected: z.string().max(2000), hidden: z.boolean().default(false) })).min(1).max(30),
  checks: z.array(z.object({ label: z.string().min(3).max(160), pattern: z.string().min(1).max(300), flags: z.string().max(4).optional() })).max(20).default([]),
  hints: z.array(z.string().min(3).max(400)).max(5).default([]),
  solutionCode: z.string().max(8000).optional(),
  solutionExplanation: z.string().max(2000).optional(),
  points: z.number().int().min(0).max(500).default(20),
});

const assignmentSchema = z.object({
  title: z.string().trim().min(3).max(140),
  brief: z.string().trim().min(40).max(5000),
  rubric: z.string().trim().max(2000).optional(),
  kind: z.enum(["assignment", "project"]).default("assignment"),
  required: z.boolean().default(false),
});

const rulesSchema = z.object({
  read: z.boolean().optional(), video: z.boolean().optional(), quiz: z.boolean().optional(), code: z.boolean().optional(), assignment: z.boolean().optional(),
});

const explainerSchema = z.object({
  simple: z.string().trim().min(20).max(500),
  analogy: z.string().trim().min(20).max(500),
  nodes: z.array(z.object({ label: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(80), detail: z.string().trim().max(240).optional() })).length(3),
  summary: z.string().trim().min(10).max(300),
  steps: z.array(z.object({ code: z.string().max(400), explanation: z.string().trim().min(5).max(300) })).max(10).default([]),
  output: z.string().max(400).default(""),
  takeaways: z.array(z.string().trim().min(5).max(200)).min(2).max(4),
  mistake: z.string().trim().min(10).max(300),
});
export type ExplainerContent = z.infer<typeof explainerSchema>;

const lessonSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: z.string().trim().max(80).optional(),
  summary: z.string().trim().max(300).optional(),
  minutes: z.number().int().min(1).max(240).default(10),
  content: z.string().max(60_000),
  videoUrl: z.string().url().max(500).optional(),
  /** Script for the narrated, animated explainer video shown when there is no videoUrl. */
  explainer: explainerSchema.optional(),
  videoDurationSeconds: z.number().int().min(5).max(21_600).optional(),
  required: z.boolean().default(true),
  rules: rulesSchema.optional(),
  quiz: z.object({ passPercent: z.number().int().min(1).max(100).default(60), questions: z.array(questionSchema).min(1).max(40) }).optional(),
  challenge: challengeSchema.optional(),
  assignment: assignmentSchema.optional(),
});
export type LessonContent = z.infer<typeof lessonSchema>;

export const courseContentSchema = z.object({
  slug: z.string().trim().min(3).max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "slug must be lowercase letters, numbers and hyphens"),
  title: z.string().trim().min(3).max(120),
  category: z.string().trim().min(2).max(60),
  track: z.string().trim().max(60).optional(),
  languageTag: z.string().trim().max(30).optional(),
  level: z.enum(LEVELS),
  description: z.string().trim().max(500),
  longDescription: z.string().trim().max(5000).optional(),
  instructor: z.string().trim().min(2).max(80).default("MyLoginn Learning Team"),
  instructorTitle: z.string().trim().max(80).optional(),
  durationWeeks: z.number().int().min(1).max(52),
  /** Whole rupees. 0 = free. Never hard-coded: set per course by the administrator. */
  price: z.number().int().min(0).max(1_000_000).default(0),
  originalPrice: z.number().int().min(1).optional(),
  validityDays: z.number().int().min(1).max(3650).nullable().optional(),
  renewalPrice: z.number().int().min(0).nullable().optional(),
  passPercent: z.number().int().min(1).max(100).default(60),
  aiCoachEnabled: z.boolean().default(true),
  sequential: z.boolean().default(true),
  audience: z.string().trim().max(400).optional(),
  prerequisitesText: z.string().trim().max(400).optional(),
  objectives: z.array(z.string().trim().min(5).max(200)).max(12).default([]),
  prerequisiteSlugs: z.array(z.string()).max(12).default([]),
  relatedSlugs: z.array(z.string()).max(12).default([]),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  imageColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#2563eb"),
  modules: z.array(z.object({
    title: z.string().trim().min(3).max(140),
    summary: z.string().trim().max(400).optional(),
    required: z.boolean().default(true),
    lessons: z.array(lessonSchema).min(1).max(60),
  })).max(40),
  finalAssessment: z.object({
    title: z.string().trim().max(140).default("Final assessment"),
    questionCount: z.number().int().min(1).max(200).optional(),
    timeLimitMinutes: z.number().int().min(5).max(300).optional(),
    maxAttempts: z.number().int().min(1).max(50).optional(),
    cooldownMinutes: z.number().int().min(0).max(10_080).default(0),
    questions: z.array(questionSchema).max(300),
  }).optional(),
  /** Course-level capstone projects (reviewed by an administrator). */
  projects: z.array(assignmentSchema).max(5).default([]),
});
export type CourseContent = z.infer<typeof courseContentSchema>;
export type CourseContentInput = z.input<typeof courseContentSchema>;

export function parseCourseContent(raw: unknown): { ok: true; data: CourseContent } | { ok: false; errors: string[] } {
  const res = courseContentSchema.safeParse(raw);
  if (res.success) return { ok: true, data: res.data };
  return { ok: false, errors: res.error.issues.slice(0, 12).map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`) };
}

// ----------------------------------------------------------------------------------------------------------------
// Publish readiness
// ----------------------------------------------------------------------------------------------------------------

/** Languages the learner's browser can execute today (Pyodide / a Web Worker). */
export const BROWSER_LANGUAGES = ["python", "javascript"];

export const PUBLISH_MIN = { description: 60, lessonChars: 400, objectives: 3, finalQuestions: 10 } as const;

const answerIndexes = (q: QuestionContent) => (Array.isArray(q.answer) ? q.answer : [q.answer]);

export function questionProblems(q: QuestionContent, where: string): string[] {
  const problems: string[] = [];
  const idx = answerIndexes(q);
  if (idx.some((i) => i >= q.options.length)) problems.push(`${where}: an answer index points past the options`);
  if (new Set(idx).size !== idx.length) problems.push(`${where}: duplicate answer indexes`);
  if (new Set(q.options.map((o) => o.toLowerCase())).size !== q.options.length) problems.push(`${where}: duplicate options`);
  return problems;
}

/**
 * Everything that must be true before a course may be published. A course with missing content
 * stays a draft; the list below is shown to the administrator verbatim.
 */
export function publishProblems(c: CourseContent): string[] {
  const p: string[] = [];
  if (c.description.length < PUBLISH_MIN.description) p.push(`Description must be at least ${PUBLISH_MIN.description} characters.`);
  if (!c.audience) p.push("Intended audience is missing.");
  if (!c.prerequisitesText) p.push("Prerequisites text is missing (write 'None' if there are none).");
  if (c.objectives.length < PUBLISH_MIN.objectives) p.push(`Add at least ${PUBLISH_MIN.objectives} learning objectives.`);
  if (c.level === "Advanced" && c.price === 0) p.push("Advanced courses must be paid: set a price greater than 0.");
  if (c.price > 0 && c.renewalPrice === 0) p.push("Renewal price cannot be 0 for a paid course (leave it empty to reuse the course price).");
  if (c.originalPrice !== undefined && c.originalPrice <= c.price) p.push("Original price must be greater than the course price.");
  if (c.modules.length === 0) p.push("The course has no modules.");

  const slugs = new Set<string>();
  let quizzes = 0;
  let practical = 0;
  c.modules.forEach((m, mi) => {
    if (m.lessons.length === 0) p.push(`Module ${mi + 1} "${m.title}" has no lessons.`);
    m.lessons.forEach((l, li) => {
      const where = `Module ${mi + 1}, lesson ${li + 1} "${l.title}"`;
      const slug = l.slug || slugify(l.title);
      if (slugs.has(slug)) p.push(`${where}: duplicate lesson slug "${slug}".`);
      slugs.add(slug);
      if (l.content.trim().length < PUBLISH_MIN.lessonChars) p.push(`${where}: lesson content is too short (needs at least ${PUBLISH_MIN.lessonChars} characters).`);
      const rules = l.rules ?? {};
      if (rules.quiz && !l.quiz) p.push(`${where}: requires a quiz but has none.`);
      if (rules.code && !l.challenge) p.push(`${where}: requires a coding exercise but has none.`);
      if (rules.assignment && !l.assignment) p.push(`${where}: requires an assignment but has none.`);
      if (rules.video && !l.videoUrl) p.push(`${where}: requires a video but has no video URL.`);
      if (!l.videoUrl && !l.explainer) p.push(`${where}: has no video: add a videoUrl or an explainer script.`);
      if (l.quiz) { quizzes += 1; l.quiz.questions.forEach((q, qi) => p.push(...questionProblems(q, `${where}, quiz question ${qi + 1}`))); }
      if (l.challenge) {
        practical += 1;
        if (!BROWSER_LANGUAGES.includes(l.challenge.language.toLowerCase())) p.push(`${where}: coding challenges currently run in the browser, so the language must be one of ${BROWSER_LANGUAGES.join(", ")} (others need a server sandbox).`);
        if (!l.challenge.solutionCode) p.push(`${where}: coding challenge has no reference solution.`);
        if (!l.challenge.tests.some((t) => !t.hidden)) p.push(`${where}: coding challenge needs at least one visible test.`);
      }
      if (l.assignment) practical += 1;
    });
  });
  c.projects.forEach(() => { practical += 1; });
  if (c.modules.length > 0 && quizzes === 0) p.push("At least one lesson needs a quiz.");
  if (c.modules.length > 0 && practical === 0) p.push("Add at least one practical exercise: a coding challenge, an assignment or a project.");

  const f = c.finalAssessment;
  if (!f) p.push("The final assessment is missing.");
  else {
    if (f.questions.length < PUBLISH_MIN.finalQuestions) p.push(`The final assessment needs at least ${PUBLISH_MIN.finalQuestions} questions (has ${f.questions.length}).`);
    if (f.questionCount && f.questionCount > f.questions.length) p.push("The final assessment draws more questions than the bank contains.");
    f.questions.forEach((q, qi) => p.push(...questionProblems(q, `Final question ${qi + 1}`)));
    const prompts = f.questions.map((q) => q.prompt.toLowerCase());
    if (new Set(prompts).size !== prompts.length) p.push("The final assessment has duplicate questions.");
  }
  return p;
}

/** Derives the effective completion rules for a lesson from what it contains (admin overrides win). */
export function effectiveRules(l: LessonContent) {
  return {
    read: l.rules?.read ?? true,
    video: l.rules?.video ?? false,
    quiz: l.rules?.quiz ?? Boolean(l.quiz),
    code: l.rules?.code ?? Boolean(l.challenge),
    // An assignment gates completion only when it is marked required: it needs a human reviewer, so optional is the safe default.
    assignment: l.rules?.assignment ?? Boolean(l.assignment?.required),
  };
}

export const optionId = (index: number) => String.fromCharCode(97 + index); // 0 -> "a"
