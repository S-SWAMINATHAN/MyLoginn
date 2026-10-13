import type { CourseContentInput } from "../../src/lib/lms/content";

/** Multiple-choice question: options as strings, `answer` = index (or indexes) of the correct option(s). */
export const q = (prompt: string, options: string[], answer: number | number[], explanation: string, points = 1) => ({ prompt, options, answer, explanation, points });

type Node = [label: string, value: string, detail: string];

/** Script for the narrated, animated lesson video. */
export const video = (simple: string, analogy: string, nodes: [Node, Node, Node], summary: string, takeaways: [string, string, ...string[]], mistake: string, steps: { code: string; explanation: string }[] = [], output = "") => ({
  simple, analogy, nodes: nodes.map(([label, value, detail]) => ({ label, value, detail })), summary, takeaways, mistake, steps, output,
});

export type Lesson = NonNullable<CourseContentInput["modules"]>[number]["lessons"][number];
export type Course = CourseContentInput;
