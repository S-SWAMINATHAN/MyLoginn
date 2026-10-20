/**
 * End-to-end lifecycle against a real Postgres database, with real code execution through the judge worker's
 * local executor. Refuses to run unless DATABASE_URL points at localhost (it truncates the competition tables).
 *
 *   JUDGE_ALLOW_UNSAFE_LOCAL=1 npx tsx --require ./tests/setup.cjs --require ./tests/competition/setup.cjs --test tests/competition/lifecycle.test.ts
 */
import { before, test } from "node:test";
import assert from "node:assert/strict";
import type { CcAttempt } from "@prisma/client";
import { prisma } from "../../src/lib/prisma";
import { createQuestion, generateAssignments } from "../../src/lib/competition/server/bank";
import { createCompetition, transition, advance, tick } from "../../src/lib/competition/server/lifecycle";
import { upsertReward, offerAction, respondToOffer } from "../../src/lib/competition/server/rewards";
import { registerNewCandidate } from "../../src/lib/competition/server/registration";
import { arenaState, finalizeAttempt, saveDraft, startOrResume, submitAnswer, sweepExpiredAttempts } from "../../src/lib/competition/server/attempts";
import { claimJobs, completeJob, enqueueRun, runResult } from "../../src/lib/competition/server/judge";
import { recordEvents } from "../../src/lib/competition/server/integrity";
import { approveSnapshot, buildSnapshot, myResult, publicLeaderboard, publishResults } from "../../src/lib/competition/server/results";
import { decide } from "../../src/lib/competition/server/review";
import { verifyCertificate } from "../../src/lib/competition/server/certificates";
import { verifyAuditChain } from "../../src/lib/competition/server/audit";
import { ApiError } from "../../src/lib/competition/server/http";
import { localUnsafeExecutor } from "../../judge-worker/executors.mjs";

const url = process.env.DATABASE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1)[:/]/.test(url)) throw new Error("Refusing to run: DATABASE_URL is not a local database.");
process.env.JUDGE_ALLOW_UNSAFE_LOCAL = "1";

const ADMIN = "test-admin";
const executor = localUnsafeExecutor();
const min = (m: number) => new Date(Date.now() + m * 60_000);

/** Runs the judge until the queue is empty (what judge-worker/worker.mjs does on a sandbox host). */
async function drainJudge() {
  for (let i = 0; i < 200; i++) {
    const jobs = await claimJobs("test-worker", "test", ["python", "javascript"], 8);
    if (!jobs.length) return;
    await Promise.all(jobs.map(async (j) => completeJob("test-worker", j.id, await executor.execute(j))));
  }
  throw new Error("judge did not drain");
}

const SUM_SOLUTION = "import sys\nd=sys.stdin.read().split()\nprint(sum(int(x) for x in d[1:]))\n";
function question(difficulty: "EASY" | "MEDIUM" | "HARD", i: number) {
  const k = { EASY: 1, MEDIUM: 2, HARD: 3 }[difficulty];
  // Each question multiplies the sum by a different factor, so solutions differ per question.
  const factor = k * 10 + i;
  const ref = `import sys\nd=sys.stdin.read().split()\nprint(${factor}*sum(int(x) for x in d[1:]))\n`;
  const tests = [
    { input: "2\n1 2\n", expected: String(3 * factor), isSample: true, weight: 0 },
    ...Array.from({ length: 4 }, (_, t) => ({ input: `3\n${t} ${t + 1} ${t + 2}\n`, expected: String((3 * t + 3) * factor), isSample: false, weight: 1 })),
  ];
  return {
    family: `t-${difficulty.toLowerCase()}-${i}`,
    title: `${difficulty} multiply-sum ${i}`,
    statement: `Read n and then n integers. Print ${factor} times their sum. This statement is long enough to be valid.`,
    inputFormat: "n, then n integers",
    outputFormat: "one integer",
    constraints: "1 <= n <= 1000",
    examples: [{ input: "2\n1 2\n", output: String(3 * factor) }],
    difficulty,
    topic: ["arrays", "math", "loops"][i % 3],
    expectedMinutes: { EASY: 10, MEDIUM: 20, HARD: 35 }[difficulty] + (i % 2),
    timeLimitMs: 1500,
    memoryLimitMb: 128,
    languages: ["python", "javascript"] as ("python" | "javascript")[],
    starterCode: {},
    referenceSolution: ref,
    referenceLanguage: "python" as const,
    comparator: "trim",
    active: true,
    tests,
  };
}
const solutionFor = (factor: number) => `import sys\nd=sys.stdin.read().split()\nprint(${factor}*sum(int(x) for x in d[1:]))\n`;

let competitionId = "";

before(async () => {
  await prisma.$executeRawUnsafe(`TRUNCATE "CcAuditLog","CcRateLimit","CcJudgeWorker","CcCertificateVerification","CcCertificate","CcInternshipOffer","CcInternshipReward","CcLeaderboardSnapshot","CcAppeal","CcResult","CcScoreAdjustment","CcIntegrityReport","CcIntegrityEvent","CcTestResult","CcEvaluation","CcJudgeJob","CcSubmission","CcDraft","CcAttempt","CcAssignmentItem","CcAssignment","CcTestCase","CcQuestion","CcRegistration","Competition" CASCADE`);
  await prisma.notification.deleteMany({ where: { user: { email: { endsWith: "@cc-test.dev" } } } });
  await prisma.user.deleteMany({ where: { email: { endsWith: "@cc-test.dev" } } });
});

test("full competition lifecycle", { timeout: 600_000 }, async (t) => {
  // ── bank + competition ─────────────────────────────────────────────
  for (const d of ["EASY", "MEDIUM", "HARD"] as const) for (let i = 0; i < 3; i++) await createQuestion(question(d, i), ADMIN);
  const c = await createCompetition(
    {
      slug: "test-cup",
      title: "MyLoginn Test Coding Cup",
      description: "Integration test",
      eligibility: "Students",
      rules: "Be fair.",
      timezone: "Asia/Kolkata",
      registrationOpensAt: min(-60).toISOString(),
      registrationClosesAt: min(60).toISOString(),
      startsAt: min(120).toISOString(),
      endsAt: min(120 + 10 + 60).toISOString(),
      durationMinutes: 60,
      lateJoinMinutes: 10,
      resultsPublishAt: min(24 * 60).toISOString(),
      maxParticipants: 12,
      languages: ["python", "javascript"],
      blueprint: [
        { difficulty: "EASY", count: 1, marks: 20 },
        { difficulty: "MEDIUM", count: 1, marks: 30 },
        { difficulty: "HARD", count: 1, marks: 50 },
      ],
      negativeMarkPerWrong: 0,
      timeBalanceTolerance: 0.15,
      violationPolicy: {},
      screenShareRequired: true,
      fullscreenRequired: true,
      tieBreakBySubmitTime: true,
      autosaveCountsAsSubmission: true,
      certificateMinPercent: 0,
      candidatePrefix: "MLC",
    },
    ADMIN
  );
  competitionId = c.id;

  await t.test("registration cannot open without a reward", async () => {
    await assert.rejects(transition(c.id, "REGISTRATION_OPEN", ADMIN, true), /internship reward/);
  });
  await upsertReward(c.id, { role: "Software Engineering Intern", stipendAmount: 15000, stipendCurrency: "INR", stipendPeriod: "per month", durationText: "3 months", expectedStartDate: null, workMode: "Remote", location: "", eligibility: "Final-year or recent graduates; identity verification required.", requiredDocuments: "ID proof", offerValidDays: 14 }, ADMIN);
  await transition(c.id, "REGISTRATION_OPEN", ADMIN, true);
  await assert.rejects(upsertReward(c.id, { role: "x".repeat(5), stipendAmount: 1, stipendCurrency: "INR", stipendPeriod: "total", durationText: "1 week", workMode: "Remote", location: "", eligibility: "changed after opening", requiredDocuments: "", offerValidDays: 14 }, ADMIN), /locked/);

  // ── registration ───────────────────────────────────────────────────
  const live = () => prisma.competition.findUniqueOrThrow({ where: { id: c.id } });
  const person = (n: number) => ({ name: `Candidate ${String.fromCharCode(65 + n)}`, email: `cand${n}@cc-test.dev`, phone: `+9198765400${String(n).padStart(2, "0")}`, password: "Passw0rdX", confirmPassword: "Passw0rdX", acceptRules: true as const });

  await t.test("concurrent duplicate registrations: exactly one succeeds", async () => {
    const cc = await live();
    const results = await Promise.allSettled(Array.from({ length: 5 }, () => registerNewCandidate(cc, person(0))));
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1, results.map((r) => (r.status === "rejected" ? String(r.reason) : "ok")).join(" | "));
    assert.equal((await live()).registrationCount, 1, "failed attempts do not consume candidate numbers");
    const samePhone = { ...person(1), phone: person(0).phone };
    await assert.rejects(registerNewCandidate(await live(), samePhone), /mobile number is already registered/);
  });

  await t.test("capacity is enforced under concurrency", async () => {
    const cc = await live();
    const results = await Promise.allSettled(Array.from({ length: 14 }, (_, i) => registerNewCandidate(cc, person(i + 1))));
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 11);
    assert.ok(results.some((r) => r.status === "rejected" && /full/.test(String(r.reason))));
    const regs = await prisma.ccRegistration.findMany({ where: { competitionId: c.id } });
    assert.equal(regs.length, 12);
    assert.equal(new Set(regs.map((r) => r.candidateId)).size, 12);
    const user = await prisma.user.findUniqueOrThrow({ where: { email: "cand0@cc-test.dev" } });
    assert.notEqual(user.passwordHash, "Passw0rdX");
    assert.ok(user.passwordHash.startsWith("$2"));
  });

  // ── assignments + schedule ────────────────────────────────────────
  await prisma.competition.update({ where: { id: c.id }, data: { registrationClosesAt: min(-1) } });
  await advance(c.id);
  assert.equal((await live()).status, "REGISTRATION_CLOSED");
  await assert.rejects(registerNewCandidate(await live(), person(30)), /not open/);
  await assert.rejects(transition(c.id, "SCHEDULED", ADMIN), /Generate question assignments/);
  const gen = await generateAssignments(c.id, ADMIN, true);
  assert.equal(gen.candidates, 12);
  assert.equal(gen.distinctSets, 12, "27 combinations for 12 candidates: every set distinct");
  assert.equal(gen.unbalanced, 0);
  await transition(c.id, "SCHEDULED", ADMIN);

  const regs = await prisma.ccRegistration.findMany({ where: { competitionId: c.id }, orderBy: { candidateId: "asc" } });
  const startInput = { consent: true, screenSurface: "monitor", userAgent: "test" };
  await t.test("no early start", async () => {
    await assert.rejects(startOrResume(await live(), regs[0].id, startInput), /not started/);
  });
  await prisma.competition.update({ where: { id: c.id }, data: { startsAt: min(-1), endsAt: min(-1 + 10 + 60) } });
  await advance(c.id);
  assert.equal((await live()).status, "LIVE");

  await t.test("screen share must be the entire screen", async () => {
    await assert.rejects(startOrResume(await live(), regs[0].id, { ...startInput, screenSurface: "browser" }), /entire screen/);
  });

  // ── attempts ──────────────────────────────────────────────────────
  const attempts: CcAttempt[] = [];
  for (const r of regs) attempts.push((await startOrResume(await live(), r.id, startInput)).attempt);
  await t.test("refresh resumes the same attempt with the same deadline", async () => {
    const again = await startOrResume(await live(), regs[0].id, startInput);
    assert.equal(again.attempt.id, attempts[0].id);
    assert.equal(again.attempt.deadlineAt.getTime(), attempts[0].deadlineAt.getTime());
    assert.equal(again.resumed, true);
    const parallel = await Promise.all([startOrResume(await live(), regs[1].id, startInput), startOrResume(await live(), regs[1].id, startInput)]);
    assert.equal(parallel[0].attempt.id, parallel[1].attempt.id);
  });

  await t.test("arena never exposes hidden tests or reference solutions", async () => {
    const state = await arenaState(await live(), attempts[0]);
    assert.equal(state.questions.length, 3);
    const raw = JSON.stringify(state);
    assert.ok(!raw.includes("referenceSolution") && !raw.includes("print(1"), "no reference solution");
    for (const q of state.questions) {
      const hidden = await prisma.ccTestCase.findMany({ where: { questionId: q.id, isSample: false } });
      for (const h of hidden) assert.ok(!raw.includes(JSON.stringify(h.expected)) || h.expected.length < 3, "hidden expected output leaked");
      assert.ok(!raw.includes('"tests"'));
    }
  });

  const factorOf = async (questionId: string) => {
    const q = await prisma.ccQuestion.findUniqueOrThrow({ where: { id: questionId } });
    return Number(/Print (\d+) times/.exec(q.statement)![1]);
  };
  const items = async (registrationId: string) => (await prisma.ccAssignment.findUniqueOrThrow({ where: { registrationId }, include: { items: { orderBy: { position: "asc" } } } })).items;

  await t.test("Run executes samples on the judge and awards nothing", async () => {
    const [first] = await items(regs[0].id);
    const { jobId } = await enqueueRun(await live(), attempts[0], { questionId: first.questionId, language: "python", source: solutionFor(await factorOf(first.questionId)), mode: "samples" });
    await assert.rejects(enqueueRun(await live(), attempts[0], { questionId: first.questionId, language: "python", source: "print(1)", mode: "samples" }), /still in progress/);
    await drainJudge();
    const r = (await runResult(attempts[0], jobId)) as { status: string; tests: { passed?: boolean }[] };
    assert.equal(r.status, "DONE");
    assert.equal(r.tests.length, 1);
    assert.equal(r.tests[0].passed, true);
    assert.equal(await prisma.ccEvaluation.count({ where: { attemptId: attempts[0].id } }), 0);
  });

  // Candidate plans: 0 = perfect, 1 = perfect, 2 = perfect but slower (tie-break), 3 = wrong, 4 = compile error,
  // 5 = infinite loop, 6 = autosave only, 7 = copies 0's code with renamed variables, 8.. = partial.
  const plans: Record<number, "perfect" | "wrong" | "syntax" | "loop" | "draft" | "copy" | "partial"> = { 0: "perfect", 1: "perfect", 2: "perfect", 3: "wrong", 4: "syntax", 5: "loop", 6: "draft", 7: "copy" };
  const longSolution = (f: number) =>
    `import sys

def read_numbers(stream):
    tokens = stream.read().split()
    count = int(tokens[0])
    values = [int(token) for token in tokens[1:1 + count]]
    return values

def compute(values, factor):
    total = 0
    for value in values:
        total = total + value
    return factor * total

numbers = read_numbers(sys.stdin)
print(compute(numbers, ${f}))
`;
  const renamed = (src: string) => src.replace(/read_numbers/g, "get_input").replace(/values/g, "arr").replace(/total/g, "acc").replace(/tokens/g, "parts").replace(/compute/g, "work");
  for (let i = 0; i < regs.length; i++) {
    const plan = plans[i] ?? "partial";
    for (const it of await items(regs[i].id)) {
      const f = await factorOf(it.questionId);
      const source =
        plan === "perfect" ? (i === 0 ? longSolution(f) : solutionFor(f))
        : plan === "copy" ? renamed(longSolution(f))
        : plan === "wrong" ? solutionFor(f + 1)
        : plan === "syntax" ? "def broken(:\n  pass\n"
        : plan === "loop" ? "while True:\n    pass\n"
        : plan === "partial" ? (it.position === 0 ? solutionFor(f) : "print(0)\n")
        : solutionFor(f);
      if (plan === "draft") await saveDraft(await live(), attempts[i], it.questionId, "python", source);
      else await submitAnswer(await live(), attempts[i], it.questionId, "python", source, `k-${i}-${it.position}-aaaaaaaa`);
      // Distinct submission times so the time tie-breaker is exercised (candidate 0 first, then 1, 2 …).
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  await t.test("replayed submission is idempotent", async () => {
    const its = await items(regs[0].id);
    const before = await prisma.ccSubmission.count({ where: { attemptId: attempts[0].id } });
    const r = await submitAnswer(await live(), attempts[0], its[0].questionId, "python", "print(1)", "k-0-0-aaaaaaaa");
    assert.equal(r.replay, true);
    assert.equal(await prisma.ccSubmission.count({ where: { attemptId: attempts[0].id } }), before);
  });

  await t.test("monitoring: share stop pauses run/submit; resharing the entire screen resumes", async () => {
    const r1 = await recordEvents(await live(), attempts[3], [{ type: "SCREEN_SHARE_ENDED" }]);
    assert.equal(r1.paused, true);
    const paused = await prisma.ccAttempt.findUniqueOrThrow({ where: { id: attempts[3].id } });
    const [first] = await items(regs[3].id);
    await assert.rejects(submitAnswer(await live(), paused, first.questionId, "python", "print(1)", "pause-test-1"), (e: unknown) => e instanceof ApiError && e.status === 423);
    const r2 = await recordEvents(await live(), paused, [{ type: "SCREEN_SHARE_STARTED", displaySurface: "window" }]);
    assert.equal(r2.paused, true, "a window share does not lift the pause");
    const r3 = await recordEvents(await live(), paused, [{ type: "SCREEN_SHARE_STARTED", displaySurface: "monitor" }]);
    assert.equal(r3.paused, false);
    const short = await recordEvents(await live(), attempts[3], [{ type: "TAB_HIDDEN", durationMs: 400 }]);
    assert.deepEqual(short.actions, ["NONE"]);
    const many = await recordEvents(await live(), attempts[3], Array.from({ length: 7 }, () => ({ type: "WINDOW_BLUR", durationMs: 9000 })));
    assert.equal(many.flagged, true);
    await assert.rejects(recordEvents(await live(), attempts[3], [{ type: "NOT_A_TYPE" }].concat(Array(30).fill({ type: "TAB_HIDDEN" }))), /Invalid events/);
  });

  // ── finalization ─────────────────────────────────────────────────
  await t.test("final submit is idempotent", async () => {
    const [a, b] = await Promise.all([finalizeAttempt(attempts[0].id, "SUBMITTED"), finalizeAttempt(attempts[0].id, "SUBMITTED")]);
    assert.equal([a.finalized, b.finalized].filter(Boolean).length, 1);
    assert.equal(await prisma.ccEvaluation.count({ where: { attemptId: attempts[0].id } }), 3);
    const fin = await prisma.ccAttempt.findUniqueOrThrow({ where: { id: attempts[0].id } });
    await assert.rejects(submitAnswer(await live(), fin, (await items(regs[0].id))[0].questionId, "python", "print(1)", "after-final-1"), /submitted/);
  });

  await t.test("results stay private before publication", async () => {
    const lb = await publicLeaderboard(await live());
    assert.equal(lb.published, false);
    const mine = await myResult(await live(), regs[0]);
    assert.equal(mine.published, false);
    assert.ok(!("result" in mine));
  });

  // Expire everyone else: the deadline passes with the browser closed. Their work is moved to before that deadline.
  await prisma.$executeRaw`UPDATE "CcSubmission" SET "createdAt" = "createdAt" - interval '1 hour' WHERE "attemptId" IN (SELECT id FROM "CcAttempt" WHERE "competitionId" = ${c.id} AND status = 'ACTIVE')`;
  await prisma.$executeRaw`UPDATE "CcDraft" SET "updatedAt" = "updatedAt" - interval '1 hour' WHERE "attemptId" IN (SELECT id FROM "CcAttempt" WHERE "competitionId" = ${c.id} AND status = 'ACTIVE')`;
  await prisma.ccAttempt.updateMany({ where: { competitionId: c.id, status: "ACTIVE" }, data: { deadlineAt: min(-30) } });
  const swept = await sweepExpiredAttempts();
  assert.equal(swept, regs.length - 1);
  assert.equal(await prisma.ccAttempt.count({ where: { competitionId: c.id, finalReason: "TIME_EXPIRED" } }), regs.length - 1);
  const draftEval = await prisma.ccEvaluation.count({ where: { attemptId: attempts[6].id, submissionId: { not: null } } });
  assert.equal(draftEval, 3, "autosaved drafts count as answers");

  await drainJudge();
  await prisma.competition.update({ where: { id: c.id }, data: { endsAt: min(-1) } });
  await tick();
  assert.equal((await live()).status, "UNDER_REVIEW");

  // ── scores ───────────────────────────────────────────────────────
  const resultOf = async (i: number) => prisma.ccResult.findUniqueOrThrow({ where: { attemptId: attempts[i].id } });
  await t.test("deterministic scoring from hidden tests", async () => {
    assert.equal((await resultOf(0)).finalScore, 100);
    assert.equal((await resultOf(3)).finalScore, 0, "wrong answers");
    assert.equal((await resultOf(4)).finalScore, 0, "compile errors");
    const e4 = await prisma.ccEvaluation.findFirstOrThrow({ where: { attemptId: attempts[4].id } });
    assert.equal(e4.verdict, "COMPILE_ERROR");
    assert.equal((await resultOf(6)).finalScore, 100, "autosaved answers are scored");
    const loopEval = await prisma.ccEvaluation.findFirstOrThrow({ where: { attemptId: attempts[5].id }, include: { tests: true } });
    assert.ok(loopEval.tests.every((x) => x.status === "TIME_LIMIT"), "infinite loop is a time limit");
    assert.equal((await resultOf(8)).finalScore, 20, "partial: easy slot only");
  });

  await t.test("integrity analysis flags the renamed copy, not identical short solutions", async () => {
    const r7 = await resultOf(7);
    assert.equal(r7.reviewStatus, "FLAGGED");
    const reports = await prisma.ccIntegrityReport.findMany({ where: { attemptId: attempts[7].id, kind: "SIMILARITY" } });
    assert.ok(reports.some((r) => r.otherAttemptId === attempts[0].id));
    assert.equal((await resultOf(3)).reviewStatus, "FLAGGED", "monitoring flag from repeated focus loss");
    assert.equal((await resultOf(1)).reviewStatus, "NONE", "short standard solutions shared by many are not evidence");
  });

  // ── review, ranking, publication ─────────────────────────────────
  const snap1 = await buildSnapshot(c.id, ADMIN);
  await t.test("approval blocked while flags are unresolved", async () => {
    await assert.rejects(approveSnapshot(c.id, snap1.id, ADMIN), /flagged/);
  });
  for (const id of (await prisma.ccResult.findMany({ where: { competitionId: c.id, reviewStatus: "FLAGGED" } })).map((r) => r.attemptId)) {
    if (id === attempts[7].id) await decide(id, "PENALTY", -40, "Near-identical structure to another candidate on every question; reviewed side by side.", ADMIN);
    else await decide(id, "CLEAR", 0, "Focus losses explained by a documented accessibility tool; no other evidence.", ADMIN);
  }
  await assert.rejects(approveSnapshot(c.id, snap1.id, ADMIN), /latest snapshot|new snapshot/);
  const snap2 = await buildSnapshot(c.id, ADMIN);
  await approveSnapshot(c.id, snap2.id, ADMIN);
  await t.test("results are never published before the scheduled time", async () => {
    await assert.rejects(publishResults(c.id, ADMIN), /scheduled publication time/);
    await advance(c.id);
    assert.equal((await live()).status, "UNDER_REVIEW");
  });
  await prisma.competition.update({ where: { id: c.id }, data: { resultsPublishAt: min(-1) } });
  await tick();
  assert.equal((await live()).status, "RESULTS_PUBLISHED");

  await t.test("leaderboard, ties and personal results", async () => {
    const lb = await publicLeaderboard(await live());
    assert.ok(lb.published);
    if (!lb.published) return;
    assert.ok(lb.entries.length <= 50);
    const perfect = lb.entries.filter((e) => e.finalScore === 100);
    assert.equal(perfect.length, 4);
    // All perfect scores tie on score and hard score; the earlier final scoring submission ranks higher.
    assert.deepEqual(perfect.map((e) => e.rank), [1, 2, 3, 4]);
    assert.equal(lb.entries[0].award, "WINNER");
    assert.ok(!JSON.stringify(lb).includes("@cc-test.dev") && !JSON.stringify(lb).includes("+91"), "no contact details");
    const last = regs[regs.length - 1];
    const mine = await myResult(await live(), last);
    assert.ok(mine.published && mine.result && mine.result.rank);
    const penalized = await myResult(await live(), regs[7]);
    assert.ok(penalized.published && penalized.adjustments.some((a) => a.kind === "PENALTY"));
  });

  await t.test("certificates: participation for answerers, awards for the top 3, verifiable", async () => {
    const certs = await prisma.ccCertificate.findMany({ where: { competitionId: c.id } });
    assert.equal(certs.filter((x) => x.kind === "WINNER").length, 1);
    assert.equal(certs.filter((x) => x.kind === "RUNNER_UP").length, 1);
    assert.equal(certs.filter((x) => x.kind === "SECOND_RUNNER_UP").length, 1);
    assert.equal(certs.filter((x) => x.kind === "PARTICIPATION").length, regs.length, "everyone answered at least one question");
    const v = await verifyCertificate(certs[0].code);
    assert.ok(v?.valid);
    assert.ok(!JSON.stringify(v).includes("@"));
    assert.equal(await verifyCertificate("MLC-AAAAA-AAAAA-AAAAA-AAAAA"), null);
    const { syncCertificates } = await import("../../src/lib/competition/server/certificates");
    assert.deepEqual(await syncCertificates(c.id), { issued: 0, revoked: 0 }, "issuing is idempotent");
  });

  await t.test("internship offer needs eligibility approval before it is sent", async () => {
    const offers = await prisma.ccInternshipOffer.findMany({ where: { competitionId: c.id }, include: { registration: true } });
    assert.equal(offers.length, 1);
    const o = offers[0];
    assert.equal(o.status, "ELIGIBILITY_CHECK");
    await assert.rejects(offerAction(o.id, "send", "", ADMIN), /eligibility check/);
    await assert.rejects(respondToOffer(o.id, o.registration.userId, true), /not awaiting/);
    await offerAction(o.id, "approve", "Identity and enrolment documents verified.", ADMIN);
    await offerAction(o.id, "send", "", ADMIN);
    await assert.rejects(respondToOffer(o.id, regs[5].userId, true), /not found/);
    await respondToOffer(o.id, o.registration.userId, true);
    assert.equal((await prisma.ccInternshipOffer.findUniqueOrThrow({ where: { id: o.id } })).status, "ACCEPTED");
  });

  await t.test("post-publication correction re-ranks with an audit trail", async () => {
    const before = (await resultOf(8)).finalScore;
    await decide(attempts[8].id, "CORRECTION", 10, "Test 3 expected output was wrong in the bank; re-scored manually.", ADMIN);
    assert.equal((await resultOf(8)).finalScore, before + 10);
    const snaps = await prisma.ccLeaderboardSnapshot.count({ where: { competitionId: c.id, publishedAt: { not: null } } });
    assert.equal(snaps, 2);
    assert.equal(await verifyAuditChain(), null, "audit chain intact");
  });
});
