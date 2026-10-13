import type { CourseContentInput } from "../../src/lib/lms/content";

const FILLER = "This paragraph explains the idea in plain language, shows why it matters in a real project, and ends with a short example the learner can try. ";
export const longText = (n = 4) => FILLER.repeat(n).trim();

export const explainer = {
  simple: "A simple one-paragraph explanation of the topic for new learners.",
  analogy: "Think of it like organising a kitchen so every tool has a place.",
  nodes: [
    { label: "Idea", value: "Core concept", detail: "What it is" },
    { label: "Use", value: "Where it helps", detail: "When to apply it" },
    { label: "Check", value: "How to verify", detail: "Confirm it works" },
  ],
  summary: "Idea, use and check make the concept stick.",
  steps: [],
  output: "",
  takeaways: ["Remember the core idea", "Apply it in small steps"],
  mistake: "Skipping the verification step is the most common mistake.",
};

export const makeQuestions = (n: number, prefix: string) =>
  Array.from({ length: n }, (_, i) => ({
    prompt: `${prefix} question number ${i + 1}: which option is correct?`,
    options: ["The correct answer", "A wrong answer", "Another wrong answer", "Yet another wrong answer"],
    answer: 0,
    explanation: `Option A is correct for ${prefix} question ${i + 1} because it follows the lesson.`,
    points: 1,
  }));

export function fixtureCourse(slug: string, over: Partial<CourseContentInput> = {}): CourseContentInput {
  return {
    slug,
    title: `Fixture Course ${slug}`,
    category: "Testing",
    level: "Beginner",
    description: "A complete fixture course used by automated tests to exercise the whole learning flow end to end.",
    durationWeeks: 2,
    price: 0,
    audience: "Test learners who want to verify the platform.",
    prerequisitesText: "None",
    objectives: ["Understand the first concept", "Apply the second concept", "Verify the third concept"],
    modules: [
      {
        title: "Module One",
        lessons: [
          { title: "Lesson One", content: longText(), minutes: 5, explainer, quiz: { passPercent: 60, questions: makeQuestions(3, "Lesson one") } },
          { title: "Lesson Two", content: longText(), minutes: 5, explainer },
        ],
      },
      {
        title: "Module Two",
        lessons: [
          {
            title: "Lesson Three", content: longText(), minutes: 5, explainer,
            assignment: { title: "Write a short report", brief: "Write a short report describing what you learned in this module, with at least one example.", kind: "assignment", required: true },
          },
        ],
      },
    ],
    finalAssessment: { title: "Final assessment", questions: makeQuestions(10, "Final") },
    ...over,
  } as CourseContentInput;
}
