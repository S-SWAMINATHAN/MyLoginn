import type { CourseContentInput } from "../../src/lib/lms/content";

/** Multiple-choice question: options as strings, `answer` = index (or indexes) of the correct option(s). */
export const q = (prompt: string, options: string[], answer: number | number[], explanation: string, points = 1) => {
  // A very short note ("Blocked.") becomes a useful explanation that names the correct option(s).
  const correct = (Array.isArray(answer) ? answer : [answer]).map((i) => options[i]).join("; ");
  const text = explanation.trim().length >= 12 ? explanation : `The correct answer is: ${correct}. ${explanation}`.trim();
  const stem = prompt.trim().length >= 12 ? prompt : `Choose the best answer: ${prompt}`;
  return { prompt: stem, options, answer, explanation: text, points };
};

type Node = [label: string, value: string, detail: string];

/** Script for the narrated, animated lesson video. */
export const video = (simple: string, analogy: string, nodes: [Node, Node, Node], summary: string, takeaways: [string, string, ...string[]], mistake: string, steps: { code: string; explanation: string }[] = [], output = "") => ({
  simple, analogy, nodes: nodes.map(([label, value, detail]) => ({ label, value, detail })), summary, takeaways, mistake, steps, output,
});

export type Lesson = NonNullable<CourseContentInput["modules"]>[number]["lessons"][number];
export type Course = CourseContentInput;

// ------------------------------------------------------------------------------------------------
// Compact builders: keep each course file focused on content, not boilerplate.
// ------------------------------------------------------------------------------------------------
type Q = ReturnType<typeof q>;
type VideoArgs = Parameters<typeof video>;

/** Placeholder price (rupees) for Advanced courses until the administrator sets the real one. */
export const ADVANCED_DEFAULT_PRICE = 10000;

export const TRACK_COLOR: Record<string, string> = {
  "essential-it-skills": "#2563eb", "software-testing": "#0ea5e9", programming: "#7c3aed", "web-development": "#059669",
  mobile: "#db2777", data: "#d97706", ai: "#6d28d9", "cloud-devops": "#0891b2", cybersecurity: "#dc2626", enterprise: "#475569",
};

/** One lesson: markdown body + 3 quiz questions + the narrated explainer script. */
export const L = (title: string, minutes: number, content: string, quiz: [Q, Q, Q], v: VideoArgs, extra: Partial<Lesson> = {}): Lesson => ({
  title, minutes, content, explainer: video(...v), quiz: { passPercent: 60, questions: quiz }, ...extra,
});

type Meta = {
  slug: string; title: string; category: string; track: string; level?: "Beginner" | "Intermediate" | "Advanced"; price?: number;
  description: string; audience: string; prereq?: string; objectives: [string, string, string, ...string[]]; tags: string[];
  weeks?: number; language?: string; prerequisiteSlugs?: string[]; relatedSlugs?: string[];
  modules: { title: string; summary?: string; lessons: Lesson[] }[];
  final: Q[];
  project: { title: string; brief: string; rubric?: string };
};

/** Assembles a full course with the platform defaults (60% pass, 10 questions drawn from the bank, optional capstone). */
export const mk = (m: Meta): Course => ({
  slug: m.slug, title: m.title, category: m.category, track: m.track, level: m.level ?? "Beginner", description: m.description,
  instructor: "MyLoginn Learning Team", durationWeeks: m.weeks ?? 2, price: m.price ?? (m.level === "Advanced" ? ADVANCED_DEFAULT_PRICE : 0), tags: m.tags, imageColor: TRACK_COLOR[m.track] ?? "#2563eb",
  audience: m.audience, prerequisitesText: m.prereq ?? "None. Curiosity and basic computer skills are enough.", objectives: m.objectives,
  languageTag: m.language, prerequisiteSlugs: m.prerequisiteSlugs ?? [], relatedSlugs: m.relatedSlugs ?? [],
  modules: m.modules,
  finalAssessment: { title: `${m.title}: final assessment`, timeLimitMinutes: 25, questionCount: 10, cooldownMinutes: 0, questions: m.final },
  projects: [{ title: m.project.title, brief: m.project.brief, rubric: m.project.rubric ?? "Complete, accurate, well explained and original work.", kind: "project", required: false }],
});

/** Browser-runnable Python exercise. */
export const pyChallenge = (title: string, statement: string, starterCode: string, tests: { input: string; expected: string; hidden?: boolean }[], hints: string[], solutionCode: string, solutionExplanation: string) => ({
  title, language: "python", difficulty: "easy" as const, statement, starterCode,
  tests: tests.map((t) => ({ input: t.input, expected: t.expected, hidden: Boolean(t.hidden) })), checks: [], hints, solutionCode, solutionExplanation, points: 20,
});

// ------------------------------------------------------------------------------------------------
// Topic lessons: compact, syllabus-style lessons so a course can cover 80 to 120 topics, like the
// platform's existing courses. Each topic is a short explanation + key points + example + mistake.
// The narrated explainer script is generated from the same fields.
// ------------------------------------------------------------------------------------------------
/** [title, explanation, keyPoints (3), example?, commonMistake?] */
export type Topic = [title: string, explain: string, points: [string, string, string, ...string[]], example?: string, mistake?: string];

const clip = (text: string, max: number) => (text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`);
const firstSentence = (text: string) => (text.match(/^.*?[.!?](\s|$)/)?.[0] ?? text).trim();

export function topicLesson(t: Topic): Lesson {
  const [title, explain, rawPoints, example, mistake] = t;
  const points = rawPoints.map((p) => (p.trim().length >= 6 ? p : `Remember: ${p}`)) as typeof rawPoints;
  const content = [
    `## ${title}`, "", explain, "", "### Key points", ...points.map((p) => `- ${p}`),
    ...(example ? ["", "### Example", "", example] : []),
    ...(mistake ? ["", "### Common mistake", "", mistake] : []),
    "", "### Check yourself", "", `Explain **${title}** in your own words and give one example of where you would use it.`,
  ].join("\n");
  return {
    title, minutes: 4, content,
    explainer: {
      simple: clip(explain, 480).padEnd(20, "."),
      analogy: clip(`Remember the core idea: ${points[0]}`, 480),
      nodes: points.slice(0, 3).map((p, i) => ({ label: `Point ${i + 1}`, value: clip(p, 78), detail: clip(p, 230) })),
      summary: clip(`${title}: ${firstSentence(explain)}`, 290),
      steps: [], output: "",
      takeaways: points.slice(0, 3).map((p) => clip(p, 190)),
      mistake: clip(mistake ?? `Memorising ${title} without trying it on a real example.`, 290),
    },
  } as Lesson;
}

/** A module of topic lessons that ends with a graded review quiz (5 or more questions). */
export function topics(title: string, summary: string, items: Topic[], review: Q[]): { title: string; summary: string; lessons: Lesson[] } {
  const list = items.map((t) => `- ${t[0]}`).join("\n");
  const reviewLesson: Lesson = {
    title: `Review: ${title}`, minutes: 8,
    content: `## Review: ${title}\n\nBefore moving on, recall the topics in this module. For each one, try to explain it aloud in a sentence and recall an example. Then take the review quiz below.\n\n### Topics covered\n\n${list}\n\n### How to use this review\n\nIf a question surprises you, reopen the matching topic above, read the key points again and retry the quiz. The quiz can be repeated as often as you like.`,
    explainer: {
      simple: `This review checks the main ideas of ${title}.`.padEnd(20, "."),
      analogy: "A review is like a short revision test before the next chapter of a textbook.",
      nodes: [{ label: "Recall", value: "Explain each topic", detail: "Say it aloud in one sentence" }, { label: "Apply", value: "Think of an example", detail: "Where would you use it" }, { label: "Check", value: "Take the quiz", detail: "Retry until confident" }],
      summary: `Revise ${title} and confirm you can answer the quiz.`, steps: [], output: "",
      takeaways: ["Recall before you reread", "Retry the quiz as often as needed"], mistake: "Skipping the review and carrying gaps into the next module.",
    },
    quiz: { passPercent: 60, questions: review },
  } as Lesson;
  return { title, summary, lessons: [...items.map(topicLesson), reviewLesson] };
}
