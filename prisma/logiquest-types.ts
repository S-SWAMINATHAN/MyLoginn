export type Cat = "LOGIC" | "MATH" | "PROBLEM_SOLVING" | "COMMUNICATION" | "KNOWLEDGE" | "CODING";
/** Beginner = EASY, Intermediate = MEDIUM, Advanced (and Expert challenges) = HARD. */
export type Diff = "EASY" | "MEDIUM" | "HARD";

/**
 * [category, difficulty, topic, prompt, options, correct option index, explanation, check?]
 *
 * `check` makes the answer machine-verified when the seed runs (see validate-questions.ts):
 *   "2*3+1"          a Python expression; its numeric value must equal the number in the correct option
 *   "py:print(1+1)"  Python code; its stdout must equal the text of the correct option exactly
 */
export type QSeed = [Cat, Diff, string, string, string[], number, string, string?];
