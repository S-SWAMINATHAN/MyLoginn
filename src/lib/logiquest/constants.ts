export const LQ_CATEGORIES = [
  { id: "CODING", slug: "coding", label: "Coding", desc: "Programming and data-structure challenges with a real IDE.", live: true },
  { id: "PROBLEM_SOLVING", slug: "problem-solving", label: "Problem Solving", desc: "Scenario analysis, debugging and optimisation.", live: true },
  { id: "LOGIC", slug: "logic", label: "Logic", desc: "Patterns, sequences, puzzles and deduction.", live: true },
  { id: "MATH", slug: "math", label: "Math", desc: "Aptitude and interview mathematics.", live: true },
  { id: "COMMUNICATION", slug: "communication", label: "Communication", desc: "Workplace and interview communication.", live: true },
  { id: "KNOWLEDGE", slug: "knowledge", label: "Knowledge", desc: "How the IT industry works.", live: true },
] as const;

export const DIFFICULTIES = ["EASY", "MEDIUM", "HARD"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIFFICULTY_XP: Record<Difficulty, number> = { EASY: 10, MEDIUM: 20, HARD: 40 };

/** Each hint used costs 10% of the solve XP, capped at 30%. */
export const HINT_XP_PENALTY = 0.1;
export const MAX_HINT_PENALTY = 0.3;

/** Languages the platform knows. `piston` is the runtime name expected by the execution service. */
export const LANGUAGES: Record<string, { label: string; piston: string; file: string }> = {
  python: { label: "Python", piston: "python", file: "main.py" },
  javascript: { label: "JavaScript", piston: "javascript", file: "main.js" },
  java: { label: "Java", piston: "java", file: "Main.java" },
  c: { label: "C", piston: "c", file: "main.c" },
  cpp: { label: "C++", piston: "c++", file: "main.cpp" },
  csharp: { label: "C#", piston: "csharp", file: "Main.cs" },
  go: { label: "Go", piston: "go", file: "main.go" },
  php: { label: "PHP", piston: "php", file: "main.php" },
  kotlin: { label: "Kotlin", piston: "kotlin", file: "Main.kt" },
};

export const MAX_SOURCE_BYTES = 30_000;
/** Max sandbox executions (run or submit) per learner per minute. */
export const SUBMISSIONS_PER_MINUTE = 12;

/** The official solution unlocks after a solve, or this many attempts. */
export const SOLUTION_UNLOCK_ATTEMPTS = 3;
