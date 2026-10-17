/** Questions per practice page (as on IndiaBix). */
export const PAGE_SIZE = 5;

/** XP for a correct FIRST answer, by question level. */
export const LEVEL_XP: Record<1 | 2 | 3, number> = { 1: 5, 2: 10, 3: 15 };
export const LEVEL_LABEL: Record<1 | 2 | 3, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };

/** XP per correct answer in an online test (first attempt of a test per day only). */
export const TEST_XP_PER_CORRECT = 2;

export const TEST_SIZE = 20;
export const TEST_MINUTES = 30;
/** Extra seconds accepted after the timer runs out (network latency, auto-submit). */
export const TEST_GRACE_SECONDS = 90;

export const REPORT_REASONS = [
  { id: "WRONG_ANSWER", label: "The answer is wrong" },
  { id: "WRONG_EXPLANATION", label: "The explanation is wrong or unclear" },
  { id: "TYPO", label: "Typo or formatting problem" },
  { id: "UNCLEAR", label: "The question is ambiguous" },
  { id: "OTHER", label: "Something else" },
] as const;

export const MAX_COMMENT_LENGTH = 2000;
