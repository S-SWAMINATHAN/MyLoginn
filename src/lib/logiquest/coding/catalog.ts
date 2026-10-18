import "server-only";
import { ALL_PROBLEMS } from "./problems";
import TESTS from "./tests.generated.json";
import type { CodingProblemDef, IoTest, ProblemSummary, PublicProblem } from "./types";

const BY_SLUG = new Map(ALL_PROBLEMS.map((p) => [p.slug, p]));
const IO_TESTS = TESTS as Record<string, IoTest[]>;

export const STARTERS = {
  python: "import sys\n\n\ndef main():\n    data = sys.stdin.read().split()\n    # Write your solution here and print the answer\n\n\nmain()\n",
  javascript: "// readLine() returns the next input line (or null); console.log() prints.\nconst lines = [];\nfor (let line = readLine(); line !== null; line = readLine()) lines.push(line);\n\n// Write your solution here and console.log the answer\n",
  sql: "-- Write your query below\nSELECT\n",
};

export function getProblemDef(slug: string): CodingProblemDef | null {
  return BY_SLUG.get(slug) ?? null;
}

export function problemSummaries(): ProblemSummary[] {
  return ALL_PROBLEMS.map((p) => ({ slug: p.slug, title: p.title, difficulty: p.difficulty, tracks: p.tracks, tags: p.tags, kind: p.kind }));
}

export function ioTests(slug: string): IoTest[] {
  return IO_TESTS[slug] ?? [];
}

/** Everything the problem page shows. Hidden tests are not included; they are fetched on Submit. */
export function publicProblem(slug: string): PublicProblem | null {
  const p = getProblemDef(slug);
  if (!p) return null;
  if (p.kind === "sql") {
    return {
      kind: "sql", slug: p.slug, title: p.title, difficulty: p.difficulty, tracks: p.tracks, tags: p.tags, statement: p.statement,
      examples: [], languages: ["sql"], starter: { sql: STARTERS.sql }, hints: p.hints, editorial: p.editorial, schema: p.schema,
      solution: { sql: p.ref }, testCount: 1,
    };
  }
  const tests = ioTests(slug);
  const samples = Math.min(p.samples ?? 2, tests.length);
  const languages = p.languages ?? ["python", "javascript"];
  return {
    kind: "io", slug: p.slug, title: p.title, difficulty: p.difficulty, tracks: p.tracks, tags: p.tags, statement: p.statement,
    inputFormat: p.inputFormat, outputFormat: p.outputFormat, constraints: p.constraints,
    examples: tests.slice(0, samples).map((t, i) => ({ ...t, explanation: p.explain?.[i] })),
    languages, starter: Object.fromEntries(languages.map((l) => [l, p.starter?.[l] ?? STARTERS[l]])), hints: p.hints, editorial: p.editorial,
    solution: { python: p.ref, ...(p.refJs ? { javascript: p.refJs } : {}) }, testCount: tests.length,
  };
}
