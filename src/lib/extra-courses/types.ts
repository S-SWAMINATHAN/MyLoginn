import type { ChallengeEntry } from "@/lib/challengeData";

/**
 * One free tutorial course (W3Schools-style topic list). Everything the shared course engine needs for a new
 * course lives in a single config: catalog entry, curriculum, lesson copy, worked examples and graded challenges.
 */
export type ExtraCourse = {
  slug: string;
  /** Course name shown on cards, e.g. "Bootstrap Foundations". */
  title: string;
  /** Replaces the word "Fundamentals" in the title (see freeCourseTitles). */
  term: string;
  /** Language / technology name used in lesson copy, e.g. "Bootstrap". */
  languageName: string;
  /** Topic-title prefix that is stripped when matching examples, e.g. "bootstrap". */
  prefix: string;
  category: string;
  description: string;
  durationWeeks: number;
  imageColor: string;
  syllabus: string[];
  /** Curriculum as [module title, "Topic A|Topic B|..."] pairs. */
  modules: [string, string][];
  /** Source file extension in the code editor. */
  extension: string;
  /** Comment syntax for starter code and placeholder examples. */
  comment: { open: string; close?: string };
  intro: { definition: string; overview: string; history: string; focus: string };
  setup: { overview: string; commands: string; workflow: string };
  /** Worked examples by lesson kind (hello, variables, function, …). */
  samples: Record<string, { code: string; output: string }>;
  /** Worked examples chosen by topic-title regex (prefix removed, lower-case). */
  examples: [RegExp, { code: string; output: string }][];
  /** Hand-written graded challenges: [topic title, task, solution, expected output]. */
  challenges: ChallengeEntry[];
  /** Fallback challenge for any topic without an authored one. */
  practice: { code: string; output: string; task: string };
  /** Hand-written lesson copy and worked example by exact topic title; topics without one use the generated copy. */
  lessons?: Record<string, ExtraTopicLesson>;
  /** Paid courses only. Omitted means a free beginner course (price 0, level "Fundamentals"). */
  pricing?: { price: number; originalPrice?: number; level: string; instructor?: string };
};

/** A fully written lesson for one topic (same shape the HTML course uses for its topic-specific lessons). */
export type ExtraTopicLesson = {
  definition: string;
  overview: string;
  explanation: string;
  code: string;
  output: string;
  exampleTitle: string;
  takeaways: string[];
  challenge: string;
};

export const entry = (title: string, task: string, code: string, output: string): ChallengeEntry => [title, task, code, output];
