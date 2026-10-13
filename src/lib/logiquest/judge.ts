import { executeOnce, type ExecResult } from "./executor";

export type JudgeCase = { id: string; input: string; expected: string; isPublic: boolean; isEdge: boolean; label: string | null };
export type CaseOutcome = { id: string; passed: boolean; isPublic: boolean; isEdge: boolean; label: string | null; timeMs: number; verdict: string };
export type JudgeVerdict = "ACCEPTED" | "WRONG_ANSWER" | "RUNTIME_ERROR" | "TIME_LIMIT" | "COMPILE_ERROR";

/** Trailing whitespace on each line and at the end of the output is not significant. */
export function normalize(text: string) {
  return text.replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
}

function classify(r: ExecResult, expected: string): JudgeVerdict {
  if (r.compileError) return "COMPILE_ERROR";
  if (r.timedOut) return "TIME_LIMIT";
  if (!r.ok) return "RUNTIME_ERROR";
  return normalize(r.stdout) === normalize(expected) ? "ACCEPTED" : "WRONG_ANSWER";
}

export type JudgeReport = {
  verdict: JudgeVerdict;
  passed: number;
  total: number;
  timeMs: number;
  outcomes: CaseOutcome[];
  /** Stderr of the first failing public case, or of a compile error. Never contains hidden test data. */
  message: string | null;
  /** Only for a failed PUBLIC case: what the program printed. */
  firstFailure: { input: string; expected: string; actual: string } | null;
};

/** Runs every case server-side (a few at a time) and returns a report that is safe to send to the browser. */
export async function judge(language: string, source: string, cases: JudgeCase[]): Promise<JudgeReport> {
  const results: { c: JudgeCase; r: ExecResult }[] = [];
  const CONCURRENCY = 4;
  for (let i = 0; i < cases.length; i += CONCURRENCY) {
    const batch = cases.slice(i, i + CONCURRENCY);
    results.push(...(await Promise.all(batch.map(async (c) => ({ c, r: await executeOnce(language, source, c.input) })))));
    // A compile error repeats identically for every case.
    if (results.some(({ r }) => r.compileError)) break;
  }

  const outcomes: CaseOutcome[] = results.map(({ c, r }) => {
    const verdict = classify(r, c.expected);
    return { id: c.id, passed: verdict === "ACCEPTED", isPublic: c.isPublic, isEdge: c.isEdge, label: c.label, timeMs: r.timeMs, verdict };
  });
  const passed = outcomes.filter((o) => o.passed).length;
  const compile = results.find(({ r }) => r.compileError);
  const firstBad = results.find(({ c, r }) => classify(r, c.expected) !== "ACCEPTED");

  let verdict: JudgeVerdict = "ACCEPTED";
  if (compile) verdict = "COMPILE_ERROR";
  else if (firstBad) verdict = classify(firstBad.r, firstBad.c.expected);

  const firstPublicBad = results.find(({ c, r }) => c.isPublic && classify(r, c.expected) !== "ACCEPTED");
  return {
    verdict,
    passed,
    total: cases.length,
    timeMs: outcomes.reduce((m, o) => Math.max(m, o.timeMs), 0),
    outcomes,
    message: compile ? compile.r.stderr.slice(0, 2000) : firstPublicBad ? firstPublicBad.r.stderr.slice(0, 2000) || null : null,
    firstFailure: firstPublicBad ? { input: firstPublicBad.c.input, expected: firstPublicBad.c.expected, actual: firstPublicBad.r.stdout.slice(0, 2000) } : null,
  };
}
