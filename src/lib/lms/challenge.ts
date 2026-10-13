/**
 * Coding-challenge evaluation (pure).
 *
 * IMPORTANT LIMITATION: learner code is executed in the learner's own browser (Pyodide / sql.js /
 * preview), exactly as for the existing courses. The server therefore verifies the OUTPUT the
 * browser reports for each visible test plus source-level requirement checks. It cannot run
 * hidden tests, and a determined learner could forge reported output. Hidden tests are stored
 * and never sent to clients, but they are only enforced once a server-side sandbox is attached.
 */

export type ChallengeTest = { input: string; expected: string; hidden: boolean };
export type ChallengeCheck = { label: string; pattern: string; flags?: string };

export type PublicChallengeTest = { index: number; input: string; expected: string };

export const normalizeOutput = (value: string) =>
  value.replace(/\r\n/g, "\n").split("\n").map((line) => line.replace(/\s+$/g, "")).join("\n").trim();

/** Only visible tests are ever returned to a client. Hidden rows keep their stored index so reports can't be mixed up. */
export function publicTests(tests: ChallengeTest[]): PublicChallengeTest[] {
  return tests.flatMap((t, index) => (t.hidden ? [] : [{ index, input: t.input, expected: t.expected }]));
}

export type ChallengeVerdict = {
  passed: boolean;
  testResults: { index: number; passed: boolean }[];
  failedChecks: string[];
  hiddenTestsEvaluated: boolean;
  feedback: string;
};

export function evaluateChallenge(tests: ChallengeTest[], checks: ChallengeCheck[], source: string, reported: { index: number; output: string }[]): ChallengeVerdict {
  const byIndex = new Map(reported.map((r) => [r.index, r.output]));
  const testResults = tests.flatMap((t, index) =>
    t.hidden ? [] : [{ index, passed: byIndex.has(index) && normalizeOutput(byIndex.get(index) ?? "") === normalizeOutput(t.expected) }],
  );
  const failedChecks = checks.filter((c) => !runCheck(c, source)).map((c) => c.label);
  const testsOk = testResults.length > 0 ? testResults.every((r) => r.passed) : checks.length > 0;
  const passed = testsOk && failedChecks.length === 0;
  const feedback = passed
    ? "All visible tests and requirements passed."
    : failedChecks.length
      ? `Requirement not met: ${failedChecks[0]}.`
      : `Test ${(testResults.find((r) => !r.passed)?.index ?? 0) + 1} did not produce the expected output.`;
  return { passed, testResults, failedChecks, hiddenTestsEvaluated: false, feedback };
}

function runCheck(check: ChallengeCheck, source: string): boolean {
  if (check.pattern.length > 300) return false;
  try {
    return new RegExp(check.pattern, (check.flags ?? "").replace(/[^imsu]/g, "")).test(source);
  } catch {
    return false;
  }
}
