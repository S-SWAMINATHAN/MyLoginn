import "server-only";
import { timingSafeEqual } from "node:crypto";
import type { CcAttempt, Competition, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { MAX_RUN_INPUT_CHARS, MAX_SOURCE_CHARS, isLanguage, toLanguageList } from "../languages";
import { outputsMatch, questionScore } from "../scoring";
import { assertWritable } from "./attempts";
import { ApiError } from "./http";
import { limit } from "./rateLimit";

/**
 * Judge queue. Candidate code never runs on the web server: jobs wait in Postgres and isolated judge workers
 * (judge-worker/, on separate sandbox hosts) pull them over HTTPS with a bearer token. Workers receive test INPUTS
 * only; outputs are compared with the expected answers here, so hidden expected outputs never leave this app.
 */

/** Queued interactive runs across all candidates before Run is refused with 503 (backpressure). */
const RUN_QUEUE_LIMIT = Number(process.env.COMPETITION_RUN_QUEUE_LIMIT) || 1500;
/** A RUNNING job whose worker has been silent this long goes back to the queue. */
const STALE_MS = 90_000;
const MAX_TRIES = 3;
const cut = (s: unknown, n: number) => (typeof s === "string" ? (s.length > n ? `${s.slice(0, n)}\n… (truncated)` : s) : "");

export function assertJudgeToken(request: Request) {
  const expected = process.env.COMPETITION_JUDGE_TOKEN;
  const cron = process.env.CRON_SECRET;
  const got = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const same = (a: string, b?: string) => !!b && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
  if (!got || !(same(got, expected) || same(got, cron))) throw new ApiError(401, "Unauthorized.");
}

// ───────────────────────────── candidate side ─────────────────────────────

export async function enqueueRun(c: Competition, attempt: CcAttempt, body: { questionId?: unknown; language?: unknown; source?: unknown; input?: unknown; mode?: unknown }) {
  assertWritable(attempt, c.screenShareRequired);
  const questionId = typeof body.questionId === "string" ? body.questionId : "";
  if (!isLanguage(body.language) || !toLanguageList(c.languages).includes(body.language)) throw new ApiError(400, "Choose one of the competition's languages.");
  if (typeof body.source !== "string" || !body.source.trim()) throw new ApiError(400, "Write some code first.");
  if (body.source.length > MAX_SOURCE_CHARS) throw new ApiError(413, "Code is too long.");
  const mode = body.mode === "custom" ? "custom" : "samples";
  const input = typeof body.input === "string" ? body.input : "";
  if (input.length > MAX_RUN_INPUT_CHARS) throw new ApiError(413, "Custom input is too long.");
  const item = await prisma.ccAssignmentItem.findFirst({ where: { questionId, assignment: { registrationId: attempt.registrationId } } });
  if (!item) throw new ApiError(404, "That question is not part of your set.");

  await limit(`cc:run:${attempt.id}`, 15, 60, "You can run code up to 15 times a minute. Wait a moment.");
  if (await prisma.ccJudgeJob.count({ where: { attemptId: attempt.id, kind: "RUN", status: { in: ["QUEUED", "RUNNING"] } } }))
    throw new ApiError(429, "Your previous run is still in progress.", "RUN_IN_PROGRESS");
  if ((await prisma.ccJudgeJob.count({ where: { kind: "RUN", status: "QUEUED" } })) >= RUN_QUEUE_LIMIT)
    throw new ApiError(503, "The judge is busy. Your code is safe; try Run again in a few seconds.", "JUDGE_BUSY");

  const job = await prisma.ccJudgeJob.create({ data: { kind: "RUN", attemptId: attempt.id, questionId, priority: 0, payload: { language: body.language, source: body.source, mode, input } } });
  return { jobId: job.id };
}

type RunTest = { id: string; status: string; stdout: string; stderr: string; timeMs: number | null; passed?: boolean; input?: string; expected?: string };

/** Run status for the candidate who owns it. Sample runs show expected output (samples are public); nothing else does. */
export async function runResult(attempt: CcAttempt, jobId: string) {
  const job = await prisma.ccJudgeJob.findFirst({ where: { id: jobId, attemptId: attempt.id, kind: "RUN" } });
  if (!job) throw new ApiError(404, "Run not found.");
  if (job.status === "QUEUED" || job.status === "RUNNING") {
    const ahead = job.status === "QUEUED" ? await prisma.ccJudgeJob.count({ where: { status: "QUEUED", priority: { lte: job.priority }, createdAt: { lt: job.createdAt } } }) : 0;
    return { status: job.status, ahead };
  }
  if (job.status === "FAILED") return { status: "FAILED", error: "The judge could not run your code. This does not affect your score; try again." };
  return { status: "DONE", ...(job.result as { compile: { ok: boolean; output: string }; tests: RunTest[] }) };
}

// ───────────────────────────── worker side ─────────────────────────────

export type ClaimedJob = { id: string; kind: string; language: string; source: string; timeLimitMs: number; memoryLimitMb: number; tests: { id: string; input: string }[] };

export async function claimJobs(workerId: string, version: string, languages: string[], max: number): Promise<ClaimedJob[]> {
  const langs = languages.filter(isLanguage);
  await prisma.ccJudgeWorker.upsert({
    where: { id: workerId },
    create: { id: workerId, version, languages: langs, lastSeenAt: new Date() },
    update: { version, languages: langs, lastSeenAt: new Date() },
  });
  if (!langs.length) return [];
  const take = Math.max(1, Math.min(20, max));
  // SKIP LOCKED: many workers can claim concurrently without ever receiving the same job.
  const rows = await prisma.$queryRaw<{ id: string; kind: string; questionId: string; payload: Prisma.JsonObject }[]>`
    UPDATE "CcJudgeJob" SET "status" = 'RUNNING'::"CcJobStatus", "lockedAt" = now(), "lockedBy" = ${workerId}, "tries" = "tries" + 1
    WHERE "id" IN (
      SELECT "id" FROM "CcJudgeJob"
      WHERE "status" = 'QUEUED'::"CcJobStatus" AND ("payload"->>'language') = ANY(${langs})
      ORDER BY "priority" ASC, "createdAt" ASC
      LIMIT ${take}
      FOR UPDATE SKIP LOCKED)
    RETURNING "id", "kind"::text AS "kind", "questionId", "payload"`;
  if (!rows.length) return [];

  const questionIds = [...new Set(rows.map((r) => r.questionId))];
  const questions = await prisma.ccQuestion.findMany({ where: { id: { in: questionIds } }, include: { tests: { orderBy: { position: "asc" } } } });
  const qById = new Map(questions.map((q) => [q.id, q]));
  const subIds = rows.filter((r) => r.kind === "EVALUATE").map((r) => String(r.payload.submissionId));
  const subs = new Map((await prisma.ccSubmission.findMany({ where: { id: { in: subIds } }, select: { id: true, source: true } })).map((s) => [s.id, s.source]));

  await prisma.ccJudgeWorker.update({ where: { id: workerId }, data: { running: { increment: rows.length } } }).catch(() => undefined);
  return rows.map((r) => {
    const q = qById.get(r.questionId)!;
    const p = r.payload as Record<string, string>;
    let tests: { id: string; input: string }[];
    let source = p.source ?? "";
    if (r.kind === "EVALUATE") {
      tests = q.tests.filter((t) => t.weight > 0).map((t) => ({ id: t.id, input: t.input }));
      source = subs.get(p.submissionId) ?? "";
    } else if (r.kind === "VERIFY") {
      tests = q.tests.map((t) => ({ id: t.id, input: t.input }));
      source = q.referenceSolution;
    } else if (p.mode === "custom") tests = [{ id: "custom", input: p.input ?? "" }];
    else tests = q.tests.filter((t) => t.isSample).map((t) => ({ id: t.id, input: t.input }));
    if (r.kind === "RUN" && !tests.length) tests = [{ id: "custom", input: "" }];
    return { id: r.id, kind: r.kind, language: p.language, source, timeLimitMs: q.timeLimitMs, memoryLimitMb: q.memoryLimitMb, tests };
  });
}

export type WorkerResult = {
  compile?: { ok: boolean; output?: string };
  tests?: { id: string; status: string; stdout?: string; stderr?: string; timeMs?: number }[];
};
const EXEC_STATUSES = new Set(["OK", "RUNTIME_ERROR", "TIME_LIMIT", "MEMORY_LIMIT", "COMPILE_ERROR", "INTERNAL"]);

export async function completeJob(workerId: string, jobId: string, result: WorkerResult) {
  const job = await prisma.ccJudgeJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "RUNNING" || job.lockedBy !== workerId) return { accepted: false };
  const compileOk = result.compile?.ok !== false;
  const tests = (Array.isArray(result.tests) ? result.tests : []).map((t) => ({
    id: String(t.id),
    status: EXEC_STATUSES.has(t.status) ? t.status : "INTERNAL",
    stdout: cut(t.stdout, 200_000),
    stderr: cut(t.stderr, 8_000),
    timeMs: Number.isFinite(t.timeMs) ? Math.round(t.timeMs!) : null,
  }));
  // An infrastructure failure must not be scored as the candidate's failure: retry instead.
  if (compileOk && tests.some((t) => t.status === "INTERNAL")) return failJob(workerId, jobId, "Worker reported an internal execution error.");
  await prisma.ccJudgeWorker.update({ where: { id: workerId }, data: { running: { decrement: 1 }, lastSeenAt: new Date() } }).catch(() => undefined);

  const question = await prisma.ccQuestion.findUnique({ where: { id: job.questionId }, include: { tests: true } });
  if (!question) return { accepted: false };
  const testById = new Map(question.tests.map((t) => [t.id, t]));
  const judged = tests.map((t) => {
    const tc = testById.get(t.id);
    const passed = compileOk && t.status === "OK" && !!tc && outputsMatch(t.stdout, tc.expected, question.comparator);
    const status = !compileOk ? "COMPILE_ERROR" : t.status === "OK" && tc && !passed ? "WRONG_ANSWER" : t.status;
    return { ...t, passed, status, tc };
  });

  if (job.kind === "RUN" || job.kind === "VERIFY") {
    const reveal = job.kind === "VERIFY";
    const out: RunTest[] = judged.map((t) => ({
      id: t.id,
      status: t.id === "custom" && t.status === "OK" ? "OK" : t.status,
      stdout: cut(t.stdout, 4_000),
      stderr: cut(t.stderr, 4_000),
      timeMs: t.timeMs,
      ...(t.tc && (t.tc.isSample || reveal) ? { passed: t.passed, input: cut(t.tc.input, 2_000), expected: cut(t.tc.expected, 2_000) } : {}),
    }));
    await prisma.ccJudgeJob.update({ where: { id: jobId }, data: { status: "DONE", finishedAt: new Date(), result: { compile: { ok: compileOk, output: cut(result.compile?.output, 8_000) }, tests: out } } });
    return { accepted: true };
  }

  // EVALUATE
  const version = Number((job.payload as Record<string, unknown>).evaluationVersion);
  const evaluation = await prisma.ccEvaluation.findUnique({ where: { attemptId_questionId_evaluationVersion: { attemptId: job.attemptId!, questionId: job.questionId, evaluationVersion: version } } });
  if (!evaluation) return { accepted: false };
  const scored = question.tests.filter((t) => t.weight > 0);
  const byId = new Map(judged.map((t) => [t.id, t]));
  const outcomes = scored.map((tc) => {
    const r = byId.get(tc.id);
    return { tc, status: r ? r.status : compileOk ? "INTERNAL" : "COMPILE_ERROR", passed: r?.passed ?? false, timeMs: r?.timeMs ?? null, detail: r ? cut(`${r.stdout}${r.stderr ? `\n[stderr]\n${r.stderr}` : ""}`, 2_000) : null };
  });
  if (compileOk && outcomes.some((o) => o.status === "INTERNAL")) return failJob(workerId, jobId, "Worker returned an incomplete result.");
  const score = questionScore(evaluation.marks, outcomes.map((o) => ({ weight: o.tc.weight, passed: o.passed })));

  await prisma.$transaction(async (tx) => {
    const done = await tx.ccEvaluation.updateMany({
      where: { id: evaluation.id, status: { not: "DONE" } },
      data: { status: "DONE", ...score, verdict: compileOk ? null : "COMPILE_ERROR", compileOutput: compileOk ? null : cut(result.compile?.output, 4_000), completedAt: new Date() },
    });
    // A duplicate completion (e.g. after a stale requeue) cannot score twice.
    if (done.count) {
      await tx.ccTestResult.deleteMany({ where: { evaluationId: evaluation.id } });
      await tx.ccTestResult.createMany({ data: outcomes.map((o) => ({ evaluationId: evaluation.id, testCaseId: o.tc.id, status: o.status, passed: o.passed, weight: o.tc.weight, timeMs: o.timeMs, detail: o.detail })) });
    }
    await tx.ccJudgeJob.update({ where: { id: jobId }, data: { status: "DONE", finishedAt: new Date(), result: { passedWeight: score.passedWeight, totalWeight: score.totalWeight } } });
  });
  return { accepted: true };
}

export async function failJob(workerId: string | null, jobId: string, error: string) {
  const job = await prisma.ccJudgeJob.findUnique({ where: { id: jobId } });
  if (!job || job.status !== "RUNNING" || (workerId && job.lockedBy !== workerId)) return { accepted: false };
  if (workerId) await prisma.ccJudgeWorker.update({ where: { id: workerId }, data: { running: { decrement: 1 } } }).catch(() => undefined);
  const final = job.tries >= MAX_TRIES;
  await prisma.ccJudgeJob.update({ where: { id: jobId }, data: { status: final ? "FAILED" : "QUEUED", lockedAt: null, lockedBy: null, error: error.slice(0, 1000), finishedAt: final ? new Date() : null } });
  if (final && job.kind === "EVALUATE") {
    const version = Number((job.payload as Record<string, unknown>).evaluationVersion);
    await prisma.ccEvaluation.updateMany({ where: { attemptId: job.attemptId!, questionId: job.questionId, evaluationVersion: version, status: "PENDING" }, data: { status: "FAILED" } });
  }
  return { accepted: true };
}

/** Puts jobs whose worker went silent back in the queue (or fails them after MAX_TRIES). */
export async function requeueStaleJobs() {
  const stale = await prisma.ccJudgeJob.findMany({ where: { status: "RUNNING", lockedAt: { lt: new Date(Date.now() - STALE_MS) } }, select: { id: true }, take: 500 });
  for (const j of stale) await failJob(null, j.id, "Worker timed out.");
  return stale.length;
}

/** Admin: retries evaluations that failed for infrastructure reasons. Scores are only written once per version. */
export async function retryFailedEvaluations(competitionId: string) {
  const jobs = await prisma.ccJudgeJob.findMany({ where: { kind: "EVALUATE", status: "FAILED", attempt: { competitionId } }, select: { id: true, attemptId: true, questionId: true, payload: true } });
  for (const j of jobs) {
    const version = Number((j.payload as Record<string, unknown>).evaluationVersion);
    await prisma.$transaction([
      prisma.ccJudgeJob.update({ where: { id: j.id }, data: { status: "QUEUED", tries: 0, error: null, finishedAt: null, lockedAt: null, lockedBy: null } }),
      prisma.ccEvaluation.updateMany({ where: { attemptId: j.attemptId!, questionId: j.questionId, evaluationVersion: version, status: "FAILED" }, data: { status: "PENDING" } }),
    ]);
  }
  return jobs.length;
}

/** Admin: runs a question's reference solution against all of its tests on the real judge. */
export async function enqueueVerify(questionId: string) {
  const q = await prisma.ccQuestion.findUnique({ where: { id: questionId } });
  if (!q) throw new ApiError(404, "Question not found.");
  const job = await prisma.ccJudgeJob.create({ data: { kind: "VERIFY", questionId, priority: 5, payload: { language: q.referenceLanguage } } });
  return { jobId: job.id };
}

export async function verifyResult(jobId: string) {
  const job = await prisma.ccJudgeJob.findFirst({ where: { id: jobId, kind: "VERIFY" } });
  if (!job) throw new ApiError(404, "Not found.");
  return { status: job.status, result: job.result, error: job.error };
}

export async function cleanupRunJobs() {
  await prisma.ccJudgeJob.deleteMany({ where: { kind: { in: ["RUN", "VERIFY"] }, status: { in: ["DONE", "FAILED"] }, finishedAt: { lt: new Date(Date.now() - 2 * 3600_000) } } });
}

export async function judgeHealth() {
  const [workers, queued, running, failed] = await Promise.all([
    prisma.ccJudgeWorker.findMany({ orderBy: { lastSeenAt: "desc" }, take: 50 }),
    prisma.ccJudgeJob.groupBy({ by: ["kind"], where: { status: "QUEUED" }, _count: { _all: true } }),
    prisma.ccJudgeJob.count({ where: { status: "RUNNING" } }),
    prisma.ccJudgeJob.count({ where: { status: "FAILED", kind: "EVALUATE" } }),
  ]);
  const now = Date.now();
  return {
    workers: workers.map((w) => ({ id: w.id, version: w.version, languages: toLanguageList(w.languages), running: Math.max(0, w.running), lastSeenAt: w.lastSeenAt.toISOString(), online: now - w.lastSeenAt.getTime() < 60_000 })),
    queued: Object.fromEntries(queued.map((q) => [q.kind, q._count._all])),
    running,
    failedEvaluations: failed,
  };
}
