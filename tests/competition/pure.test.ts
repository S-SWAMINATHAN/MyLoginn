import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeBank, assignOne, assignmentSeed, newEngineState, rngFromSeed, setHashOf, type PoolQuestion } from "../../src/lib/competition/assignment";
import { attemptDeadline, canStartAttempt, canTransition, nextAutomaticStatus, scheduleProblems } from "../../src/lib/competition/state";
import { computeResult, outputsMatch, questionScore, rankEntries } from "../../src/lib/competition/scoring";
import { DEFAULT_POLICY, EMPTY_COUNTS, decide, monitoringRisk, parsePolicy } from "../../src/lib/competition/policy";
import { analyzeQuestion, normalizedTokens } from "../../src/lib/competition/similarity";
import type { BlueprintSlot, Difficulty } from "../../src/lib/competition/types";

// ───────── assignment ─────────
const BP: BlueprintSlot[] = [
  { difficulty: "EASY", count: 1, marks: 20 },
  { difficulty: "MEDIUM", count: 1, marks: 30 },
  { difficulty: "HARD", count: 1, marks: 50 },
];
function pool(perSlot: number): PoolQuestion[] {
  const out: PoolQuestion[] = [];
  const base: Record<Difficulty, number> = { EASY: 10, MEDIUM: 25, HARD: 40 };
  for (const d of ["EASY", "MEDIUM", "HARD"] as Difficulty[])
    for (let i = 0; i < perSlot; i++) out.push({ id: `${d}-${i}`, family: `${d}-f${i}`, difficulty: d, topic: `t${i % 4}`, expectedMinutes: base[d] + (i % 3) - 1 });
  return out;
}

test("assignment follows the blueprint and never repeats a family", () => {
  const p = pool(8);
  p.push({ id: "EASY-variant", family: "EASY-f0", difficulty: "EASY", topic: "t0", expectedMinutes: 10 });
  const state = newEngineState();
  for (let i = 0; i < 200; i++) {
    const r = assignOne(BP, p, assignmentSeed("c1", `r${i}`, "salt"), 0.15, state);
    assert.deepEqual(r.picks.map((x) => x.difficulty), ["EASY", "MEDIUM", "HARD"]);
    assert.deepEqual(r.picks.map((x) => x.marks), [20, 30, 50]);
    const fams = r.picks.map((x) => p.find((q) => q.id === x.questionId)!.family);
    assert.equal(new Set(fams).size, fams.length);
    assert.ok(r.balanced);
  }
});

test("assignment gives distinct sets while combinations remain, and spreads exposure", () => {
  const p = pool(8); // 512 combinations
  const state = newEngineState();
  const hashes = new Set<string>();
  for (let i = 0; i < 300; i++) hashes.add(assignOne(BP, p, assignmentSeed("c1", `r${i}`, "s"), 0.15, state).setHash);
  assert.equal(hashes.size, 300);
  const counts = [...state.exposure.values()];
  assert.ok(Math.max(...counts) - Math.min(...counts) <= 4, `exposure spread ${Math.min(...counts)}..${Math.max(...counts)}`);
});

test("assignment is reproducible from the seed and the same candidate order", () => {
  const p = pool(6);
  const run = () => {
    const st = newEngineState();
    return Array.from({ length: 50 }, (_, i) => assignOne(BP, p, assignmentSeed("c9", `r${i}`, "x"), 0.15, st).setHash);
  };
  assert.deepEqual(run(), run());
  assert.equal(rngFromSeed("ab".repeat(16))(), rngFromSeed("ab".repeat(16))());
  assert.equal(setHashOf(["b", "a"]), setHashOf(["a", "b"]));
});

test("time balance excludes sets far from the target", () => {
  const p = pool(4);
  p.push({ id: "HARD-slow", family: "slow", difficulty: "HARD", topic: "x", expectedMinutes: 120 });
  const st = newEngineState();
  for (let i = 0; i < 60; i++) {
    const r = assignOne(BP, p, assignmentSeed("c", `r${i}`, "s"), 0.15, st);
    if (r.picks.some((x) => x.questionId === "HARD-slow")) assert.fail("unbalanced outlier question was assigned");
  }
});

test("bank analysis reports blocking errors and capacity warnings", () => {
  const small = analyzeBank(BP, pool(2), 1000, 0.15);
  assert.ok(small.ok);
  assert.equal(small.combinations, 8);
  assert.ok(small.warnings.some((w) => w.includes("identical set")));
  const missing = analyzeBank([...BP, { difficulty: "HARD", count: 3, marks: 10 }], pool(2), 10, 0.15);
  assert.ok(!missing.ok);
  assert.ok(analyzeBank([], pool(3), 10, 0.15).errors.length > 0);
  const big = analyzeBank(BP, pool(12), 1000, 0.15);
  assert.equal(big.combinations, 1728);
  assert.ok(!big.warnings.some((w) => w.includes("identical set")));
});

// ───────── lifecycle ─────────
const T0 = new Date("2026-12-01T04:30:00Z");
const min = (m: number) => new Date(T0.getTime() + m * 60_000);
const SCHED = { registrationOpensAt: min(-10000), registrationClosesAt: min(-60), startsAt: T0, endsAt: min(15 + 90), durationMinutes: 90, lateJoinMinutes: 15, resultsPublishAt: min(3000) };

test("schedule validation", () => {
  assert.deepEqual(scheduleProblems(SCHED), []);
  assert.ok(scheduleProblems({ ...SCHED, endsAt: min(90) }).length === 1);
  assert.ok(scheduleProblems({ ...SCHED, registrationClosesAt: min(5) }).length >= 1);
  assert.ok(scheduleProblems({ ...SCHED, resultsPublishAt: min(10) }).length === 1);
});

test("deadline is server-side and capped by the window end", () => {
  assert.equal(attemptDeadline(T0, SCHED).getTime(), min(90).getTime());
  assert.equal(attemptDeadline(min(15), SCHED).getTime(), min(105).getTime());
  assert.equal(attemptDeadline(min(30), SCHED).getTime(), min(105).getTime());
});

test("start rules: no early start, late-join window, not after end", () => {
  assert.deepEqual(canStartAttempt("SCHEDULED", SCHED, min(-1)), { ok: false, reason: "TOO_EARLY" });
  assert.deepEqual(canStartAttempt("LIVE", SCHED, min(1)), { ok: true });
  assert.deepEqual(canStartAttempt("LIVE", SCHED, min(15)), { ok: false, reason: "LATE_JOIN_CLOSED" });
  assert.deepEqual(canStartAttempt("SCHEDULED", SCHED, min(1)), { ok: false, reason: "NOT_LIVE" });
  assert.deepEqual(canStartAttempt("LIVE", SCHED, min(200)), { ok: false, reason: "ENDED" });
});

test("automatic transitions follow the clock and completed work", () => {
  const f = { now: min(0), activeAttempts: 0, pendingEvaluations: 0, resultsApproved: false };
  assert.equal(nextAutomaticStatus("REGISTRATION_OPEN", SCHED, f), "REGISTRATION_CLOSED");
  assert.equal(nextAutomaticStatus("SCHEDULED", SCHED, f), "LIVE");
  assert.equal(nextAutomaticStatus("REGISTRATION_CLOSED", SCHED, f), null, "an unscheduled competition never goes live by itself");
  assert.equal(nextAutomaticStatus("LIVE", SCHED, { ...f, now: min(104) }), null);
  assert.equal(nextAutomaticStatus("LIVE", SCHED, { ...f, now: min(105) }), "SUBMISSION_CLOSED");
  assert.equal(nextAutomaticStatus("SUBMISSION_CLOSED", SCHED, { ...f, activeAttempts: 3 }), null);
  assert.equal(nextAutomaticStatus("EVALUATION", SCHED, { ...f, pendingEvaluations: 1 }), null);
  assert.equal(nextAutomaticStatus("UNDER_REVIEW", SCHED, { ...f, now: min(4000) }), null, "never publishes unapproved results");
  assert.equal(nextAutomaticStatus("UNDER_REVIEW", SCHED, { ...f, now: min(2999), resultsApproved: true }), null, "never publishes early");
  assert.equal(nextAutomaticStatus("UNDER_REVIEW", SCHED, { ...f, now: min(3000), resultsApproved: true }), "RESULTS_PUBLISHED");
  assert.ok(canTransition("DRAFT", "REGISTRATION_OPEN"));
  assert.ok(!canTransition("UNDER_REVIEW", "RESULTS_PUBLISHED"), "publishing goes through the results service only");
  assert.ok(!canTransition("LIVE", "DRAFT"));
});

// ───────── scoring ─────────
test("output comparison", () => {
  assert.ok(outputsMatch("3\r\n4  \n\n", "3\n4"));
  assert.ok(!outputsMatch("3 4", "3\n4"));
  assert.ok(!outputsMatch("3\n", "3", "exact"));
  assert.ok(outputsMatch("0.3333334", "0.333333", "float:1e-5"));
  assert.ok(!outputsMatch("0.34", "0.333333", "float:1e-5"));
});

test("question score uses weighted scored tests only", () => {
  assert.deepEqual(questionScore(30, [{ weight: 0, passed: false }, { weight: 1, passed: true }, { weight: 2, passed: false }]), { passedWeight: 1, totalWeight: 3, score: 10 });
  assert.equal(questionScore(30, []).score, 0);
});

test("result: negative marking, adjustments, disqualification, clamping", () => {
  const items = [
    { marks: 20, hard: false, answered: true, score: 20, testsPassed: 5, testsTotal: 5, submittedAt: new Date(1000) },
    { marks: 30, hard: false, answered: true, score: 0, testsPassed: 0, testsTotal: 5, submittedAt: new Date(2000) },
    { marks: 50, hard: true, answered: false, score: 0, testsPassed: 0, testsTotal: 5, submittedAt: null },
  ];
  const r = computeResult(items, 2, [{ kind: "PENALTY", delta: -5 }, { kind: "CLEAR", delta: 0 }]);
  assert.equal(r.rawScore, 20);
  assert.equal(r.negativeMarks, 2);
  assert.equal(r.finalScore, 13);
  assert.equal(r.questionsAttempted, 2);
  assert.equal(r.lastScoringSubmitAt?.getTime(), 1000);
  assert.equal(computeResult(items, 0, [{ kind: "DISQUALIFY", delta: 0 }]).finalScore, 0);
  assert.equal(computeResult(items, 0, [{ kind: "CORRECTION", delta: 500 }]).finalScore, 100);
  assert.equal(computeResult(items, 0, [{ kind: "PENALTY", delta: -500 }]).finalScore, 0);
});

test("ranking: deterministic tie-breaks and shared ranks", () => {
  const e = (key: string, finalScore: number, hardScore: number, at: number | null) => ({ key, candidateId: key, finalScore, hardScore, lastScoringSubmitAt: at === null ? null : new Date(at) });
  const entries = [e("D", 80, 30, 50), e("A", 90, 10, 100), e("B", 80, 40, 90), e("C", 80, 30, 40), e("E", 80, 30, 40), e("F", 0, 0, null)];
  const ranked = rankEntries(entries, true);
  assert.deepEqual(ranked.map((r) => [r.key, r.rank]), [["A", 1], ["B", 2], ["C", 3], ["E", 3], ["D", 5], ["F", 6]]);
  const shuffled = rankEntries([...entries].reverse(), true);
  assert.deepEqual(shuffled.map((r) => r.key), ranked.map((r) => r.key), "input order never changes the ranking");
  const noTime = rankEntries(entries, false);
  assert.deepEqual(noTime.filter((r) => r.rank === 3).map((r) => r.key), ["C", "D", "E"]);
  assert.equal(rankEntries([e("X", 0.1 + 0.2, 0, null), e("Y", 0.3, 0, null)], false)[1].rank, 1, "float noise does not split ties");
});

// ───────── policy ─────────
test("policy: short focus losses ignored, warnings then risk then flag; share stop pauses", () => {
  const p = DEFAULT_POLICY;
  let c = EMPTY_COUNTS;
  assert.equal(decide("TAB_HIDDEN", { durationMs: 500 }, c, p).action, "NONE");
  const actions: string[] = [];
  for (let i = 0; i < p.flagAfterFocusLosses; i++) {
    const r = decide("WINDOW_BLUR", { durationMs: 10_000 }, c, p);
    actions.push(r.action);
    c = r.counts;
  }
  assert.equal(actions[0], "WARNING");
  assert.equal(actions[1], "RISK");
  assert.equal(actions.at(-1), "FLAG");
  assert.equal(decide("SCREEN_SHARE_ENDED", {}, EMPTY_COUNTS, p).action, "PAUSE");
  assert.equal(decide("LARGE_PASTE", { chars: 50 }, EMPTY_COUNTS, p).action, "NONE");
  assert.ok(monitoringRisk(c, p) >= 35);
  assert.equal(monitoringRisk(EMPTY_COUNTS, p), 0);
  assert.equal(parsePolicy({ flagAfterFocusLosses: "9", bogus: 1, largePasteChars: -4 }).flagAfterFocusLosses, 9);
  assert.equal(parsePolicy({ largePasteChars: -4 }).largePasteChars, DEFAULT_POLICY.largePasteChars);
});

// ───────── similarity ─────────
const solutionA = `
import sys
def solve(nums, target):
    seen = {}
    for idx, value in enumerate(nums):
        need = target - value
        if need in seen:
            return [seen[need], idx]
        seen[value] = idx
    return [-1, -1]
data = sys.stdin.read().split()
n = int(data[0]); target = int(data[1]); nums = list(map(int, data[2:2+n]))
print(*solve(nums, target))
`;
// Same program with renamed identifiers and comments: structurally a copy.
const renamed = solutionA.replace(/seen/g, "memo").replace(/need/g, "want").replace(/nums/g, "arr").replace(/idx/g, "i") + "\n# my own work\n";
function distinct(i: number) {
  // Independent, different but valid approaches.
  const bodies = [
    "arr = sorted(range(n), key=lambda k: nums[k])\nlo, hi = 0, n - 1\nwhile lo < hi:\n    s = nums[arr[lo]] + nums[arr[hi]]\n    if s == target:\n        print(min(arr[lo], arr[hi]), max(arr[lo], arr[hi])); break\n    elif s < target:\n        lo += 1\n    else:\n        hi -= 1\nelse:\n    print(-1, -1)",
    "found = False\nfor a in range(n):\n    for b in range(a + 1, n):\n        if nums[a] + nums[b] == target and not found:\n            print(a, b)\n            found = True\nif not found:\n    print(-1, -1)",
    "pos = {}\nans = (-1, -1)\nfor k in range(n - 1, -1, -1):\n    pos.setdefault(nums[k], []).append(k)\nfor k in range(n):\n    other = pos.get(target - nums[k], [])\n    cand = [o for o in other if o > k]\n    if cand:\n        ans = (k, min(cand)); break\nprint(ans[0], ans[1])",
    "import itertools\nres = next(((x, y) for x, y in itertools.combinations(range(n), 2) if nums[x] + nums[y] == target), (-1, -1))\nprint(res[0], res[1])",
  ];
  return `import sys\ntokens = sys.stdin.read().split()\nn = int(tokens[0])\ntarget = int(tokens[1])\nnums = [int(t) for t in tokens[2:2 + n]]\n${bodies[i % bodies.length]}\n`;
}

test("similarity flags a renamed copy but not different legitimate solutions", () => {
  const subs = [
    { attemptId: "orig", language: "python", source: solutionA },
    { attemptId: "copy", language: "python", source: renamed },
    ...Array.from({ length: 8 }, (_, i) => ({ attemptId: `d${i}`, language: "python", source: distinct(i) + `\n# v${i}\nextra_${i} = ${i}\n` })),
  ];
  const findings = analyzeQuestion(subs, []);
  const pair = findings.find((f) => [f.a, f.b].sort().join() === "copy,orig");
  assert.ok(pair, "renamed copy should be reported");
  assert.ok(pair!.similarity >= 0.8);
  assert.ok(!findings.some((f) => f.a.startsWith("d") && f.b.startsWith("d") && !f.verbatim && f.similarity < 0.99 && f.a.slice(1) !== f.b.slice(1) && Number(f.a.slice(1)) % 4 !== Number(f.b.slice(1)) % 4), "distinct approaches are not reported");
  assert.equal(normalizedTokens("x = 10 # hi", "python").join(" "), "v = 0");
});

test("similarity ignores tiny programs and the starter template", () => {
  const tiny = [{ attemptId: "a", language: "python", source: "print(int(input())*2)" }, { attemptId: "b", language: "python", source: "print(int(input())*2)" }];
  assert.equal(analyzeQuestion(tiny).length, 0);
  const starter = solutionA;
  const both = [{ attemptId: "a", language: "python", source: solutionA + "\nz = 1\n" }, { attemptId: "b", language: "python", source: solutionA + "\nw = 2\n" }];
  const withTemplate = analyzeQuestion(both, [{ language: "python", source: starter }]);
  assert.ok(withTemplate.every((f) => !f.verbatim && f.similarity < 0.8), "code identical to the starter is not evidence");
});
