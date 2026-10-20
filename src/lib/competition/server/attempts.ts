import "server-only";
import type { CcAttempt, Competition, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COMPETITION_LANGUAGES, MAX_SOURCE_CHARS, isLanguage, toLanguageList, type CompetitionLanguage } from "../languages";
import { attemptDeadline, canStartAttempt } from "../state";
import type { CompetitionStatus } from "../types";
import { candidateQuestion, ensureAssignment } from "./bank";
import { ApiError, isUniqueViolation } from "./http";
import { hit, limit } from "./rateLimit";

/**
 * Published cutoff policy: a save or submission that reaches the server more than this long after the deadline is
 * refused. It absorbs normal network latency for a click made just before time ran out; it never extends the timer.
 */
export const CUTOFF_GRACE_MS = 5_000;

const START_REFUSAL: Record<string, string> = {
  TOO_EARLY: "The competition has not started yet.",
  NOT_LIVE: "The competition is not live.",
  LATE_JOIN_CLOSED: "The late-join window has closed, so a new attempt can no longer start.",
  ENDED: "The competition has ended.",
};

export type StartInput = { consent: boolean; screenSurface?: string; userAgent?: string; ipHash?: string };

/**
 * Starts the candidate's single attempt, or resumes it. Resuming never changes the deadline; a reload after the
 * deadline finalizes instead. Concurrent start requests converge on the same attempt (unique registrationId).
 */
export async function startOrResume(c: Competition, registrationId: string, input: StartInput) {
  const existing = await prisma.ccAttempt.findUnique({ where: { registrationId } });
  if (existing) return resume(existing, input);

  const check = canStartAttempt(c.status as CompetitionStatus, c, new Date());
  if (!check.ok) throw new ApiError(409, START_REFUSAL[check.reason], check.reason);
  if (!input.consent) throw new ApiError(400, "Confirm that you have read and accept the monitoring notice.");
  if (c.screenShareRequired && input.screenSurface !== "monitor")
    throw new ApiError(400, "Share your entire screen (not a window or tab) to start.", "SCREEN_SHARE_REQUIRED");

  try {
    return await prisma.$transaction(async (tx) => {
      await ensureAssignment(tx, c, registrationId);
      const now = new Date();
      const attempt = await tx.ccAttempt.create({
        data: { competitionId: c.id, registrationId, startedAt: now, deadlineAt: attemptDeadline(now, c), userAgent: input.userAgent?.slice(0, 300), ipHash: input.ipHash },
      });
      await tx.ccIntegrityEvent.createMany({
        data: [
          { attemptId: attempt.id, type: "ATTEMPT_STARTED", meta: { userAgent: input.userAgent?.slice(0, 300) ?? null } },
          ...(input.screenSurface ? [{ attemptId: attempt.id, type: "SCREEN_SHARE_STARTED", meta: { displaySurface: input.screenSurface } }] : []),
        ],
      });
      return { attempt, resumed: false };
    });
  } catch (e) {
    if (isUniqueViolation(e, "registrationId")) {
      const again = await prisma.ccAttempt.findUnique({ where: { registrationId } });
      if (again) return resume(again, input);
    }
    throw e;
  }
}

async function resume(attempt: CcAttempt, input: StartInput) {
  if (attempt.status === "ACTIVE" && Date.now() > attempt.deadlineAt.getTime() + CUTOFF_GRACE_MS) {
    await finalizeAttempt(attempt.id, "TIME_EXPIRED");
    return { attempt: (await prisma.ccAttempt.findUnique({ where: { id: attempt.id } }))!, resumed: true };
  }
  if (attempt.status !== "ACTIVE") return { attempt, resumed: true };
  const updated = await prisma.ccAttempt.update({ where: { id: attempt.id }, data: { resumeCount: { increment: 1 }, lastSeenAt: new Date() } });
  await prisma.ccIntegrityEvent.create({ data: { attemptId: attempt.id, type: "ATTEMPT_RESUMED", meta: { userAgent: input.userAgent?.slice(0, 300) ?? null, resumeCount: updated.resumeCount } } });
  return { attempt: updated, resumed: true };
}

/** The attempt of a signed-in candidate, or 404. Every attempt API goes through this, so ids from the client are never trusted. */
export async function attemptFor(competitionId: string, userId: string) {
  const reg = await prisma.ccRegistration.findUnique({ where: { competitionId_userId: { competitionId, userId } }, select: { id: true } });
  if (!reg) throw new ApiError(403, "You are not registered for this competition.");
  const attempt = await prisma.ccAttempt.findUnique({ where: { registrationId: reg.id } });
  if (!attempt) throw new ApiError(404, "You have not started the competition.", "NOT_STARTED");
  return attempt;
}

export function assertWritable(attempt: CcAttempt, needsActiveShare: boolean) {
  if (attempt.status !== "ACTIVE") throw new ApiError(409, "Your attempt has been submitted.", "FINALIZED");
  if (Date.now() > attempt.deadlineAt.getTime() + CUTOFF_GRACE_MS) throw new ApiError(409, "Time is up.", "TIME_UP");
  if (needsActiveShare && attempt.paused) throw new ApiError(423, "Screen sharing has stopped. Share your entire screen again to continue.", "PAUSED");
}

async function assignedItem(attempt: CcAttempt, questionId: string) {
  const item = await prisma.ccAssignmentItem.findFirst({ where: { questionId, assignment: { registrationId: attempt.registrationId } } });
  if (!item) throw new ApiError(404, "That question is not part of your set.");
  return item;
}

function checkCode(c: Competition, language: unknown, source: unknown): { language: CompetitionLanguage; source: string } {
  if (!isLanguage(language) || !toLanguageList(c.languages).includes(language)) throw new ApiError(400, "Choose one of the competition's languages.");
  if (typeof source !== "string") throw new ApiError(400, "Missing code.");
  if (source.length > MAX_SOURCE_CHARS) throw new ApiError(413, `Code is limited to ${MAX_SOURCE_CHARS.toLocaleString("en-IN")} characters.`);
  return { language, source };
}

/** Everything the arena needs. Questions carry candidate-safe fields only. */
export async function arenaState(c: Competition, attempt: CcAttempt) {
  const assignment = await prisma.ccAssignment.findUnique({
    where: { registrationId: attempt.registrationId },
    include: { items: { orderBy: { position: "asc" }, include: { question: true } } },
  });
  const languages = toLanguageList(c.languages);
  const [drafts, submissions, warnings] = await Promise.all([
    prisma.ccDraft.findMany({ where: { attemptId: attempt.id } }),
    prisma.ccSubmission.findMany({ where: { attemptId: attempt.id, fromDraft: false }, orderBy: { createdAt: "desc" }, select: { questionId: true, language: true, createdAt: true } }),
    prisma.ccIntegrityEvent.count({ where: { attemptId: attempt.id, action: { in: ["WARNING", "RISK", "PAUSE", "FLAG"] } } }),
  ]);
  const draftFor = new Map(drafts.map((d) => [d.questionId, { language: d.language, source: d.source }]));
  const lastSubmit = new Map<string, { language: string; at: string }>();
  for (const s of submissions) if (!lastSubmit.has(s.questionId)) lastSubmit.set(s.questionId, { language: s.language, at: s.createdAt.toISOString() });
  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
      deadlineAt: attempt.deadlineAt.toISOString(),
      paused: attempt.paused,
      finalReason: attempt.finalReason,
    },
    serverNow: new Date().toISOString(),
    languages: languages.map((key) => ({ key, label: COMPETITION_LANGUAGES[key].label, monaco: COMPETITION_LANGUAGES[key].monaco })),
    questions: (assignment?.items ?? []).map((i) => ({
      ...candidateQuestion(i.question, i, languages),
      draft: draftFor.get(i.questionId) ?? null,
      lastSubmission: lastSubmit.get(i.questionId) ?? null,
    })),
    warnings,
    screenShareRequired: c.screenShareRequired,
    fullscreenRequired: c.fullscreenRequired,
    graceMs: CUTOFF_GRACE_MS,
  };
}

export async function saveDraft(c: Competition, attempt: CcAttempt, questionId: string, language: unknown, source: unknown) {
  assertWritable(attempt, false);
  const code = checkCode(c, language, source);
  await limit(`cc:save:${attempt.id}`, 90, 60, "Autosave is happening too often. It will retry shortly.");
  await assignedItem(attempt, questionId);
  const draft = await prisma.ccDraft.upsert({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
    create: { attemptId: attempt.id, questionId, ...code },
    update: code,
  });
  await prisma.ccAttempt.update({ where: { id: attempt.id }, data: { lastSeenAt: new Date() } });
  return { savedAt: draft.updatedAt.toISOString() };
}

/** Records an explicit answer. Replaying the same requestKey returns the original submission. */
export async function submitAnswer(c: Competition, attempt: CcAttempt, questionId: string, language: unknown, source: unknown, requestKey: unknown) {
  assertWritable(attempt, c.screenShareRequired);
  const code = checkCode(c, language, source);
  if (typeof requestKey !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(requestKey)) throw new ApiError(400, "Invalid request key.");
  if (!code.source.trim()) throw new ApiError(400, "Write some code before submitting.");
  await assignedItem(attempt, questionId);
  const prior = await prisma.ccSubmission.findUnique({ where: { attemptId_requestKey: { attemptId: attempt.id, requestKey } } });
  if (prior) return { submissionId: prior.id, at: prior.createdAt.toISOString(), replay: true };

  const rate = await hit(`cc:submit:${attempt.id}`, 12, 60);
  if (rate.count === 7) await prisma.ccIntegrityEvent.create({ data: { attemptId: attempt.id, type: "SUBMISSION_BURST", action: "RISK", meta: { perMinute: rate.count } } });
  if (!rate.allowed) throw new ApiError(429, "You are submitting too often. Wait a minute and try again.", "RATE_LIMITED");
  try {
    const s = await prisma.ccSubmission.create({ data: { attemptId: attempt.id, questionId, requestKey, ...code } });
    await prisma.ccDraft.upsert({ where: { attemptId_questionId: { attemptId: attempt.id, questionId } }, create: { attemptId: attempt.id, questionId, ...code }, update: code });
    return { submissionId: s.id, at: s.createdAt.toISOString(), replay: false };
  } catch (e) {
    if (isUniqueViolation(e)) {
      const again = await prisma.ccSubmission.findUnique({ where: { attemptId_requestKey: { attemptId: attempt.id, requestKey } } });
      if (again) return { submissionId: again.id, at: again.createdAt.toISOString(), replay: true };
    }
    throw e;
  }
}

/**
 * Closes an attempt exactly once (conditional update), picks each question's final answer and queues its evaluation
 * in the same transaction. Safe to call from the browser, the expiry sweep and admin actions concurrently.
 */
export async function finalizeAttempt(attemptId: string, reason: "SUBMITTED" | "TIME_EXPIRED" | "ADMIN") {
  return prisma.$transaction(
    async (tx) => {
      const now = new Date();
      const closed = await tx.ccAttempt.updateMany({ where: { id: attemptId, status: "ACTIVE" }, data: { status: "FINALIZED", finalizedAt: now, finalReason: reason } });
      if (closed.count === 0) return { finalized: false };
      const attempt = await tx.ccAttempt.findUniqueOrThrow({ where: { id: attemptId }, include: { competition: true } });
      await queueEvaluations(tx, attempt, attempt.competition, attempt.competition.evaluationVersion);
      await tx.ccIntegrityEvent.create({ data: { attemptId, type: "ATTEMPT_FINALIZED", meta: { reason } } });
      return { finalized: true };
    },
    { timeout: 30_000 }
  );
}

/**
 * For every assigned question: the final answer is the latest explicit submission received before the cutoff, or,
 * if the competition allows it, the last autosave changed from the starter code. Unanswered questions get a
 * completed zero evaluation so nothing waits on them.
 */
export async function queueEvaluations(tx: Prisma.TransactionClient, attempt: CcAttempt, c: Competition, version: number) {
  const cutoff = new Date(Math.min(attempt.deadlineAt.getTime() + CUTOFF_GRACE_MS, (attempt.finalizedAt ?? new Date()).getTime()));
  const assignment = await tx.ccAssignment.findUnique({ where: { registrationId: attempt.registrationId }, include: { items: { include: { question: { include: { tests: { select: { weight: true, isSample: true } } } } } } } });
  for (const item of assignment?.items ?? []) {
    const q = item.question;
    let submission = await tx.ccSubmission.findFirst({ where: { attemptId: attempt.id, questionId: q.id, createdAt: { lte: cutoff }, fromDraft: false }, orderBy: { createdAt: "desc" } });
    if (!submission && c.autosaveCountsAsSubmission) {
      const draft = await tx.ccDraft.findUnique({ where: { attemptId_questionId: { attemptId: attempt.id, questionId: q.id } } });
      const starter = ((q.starterCode ?? {}) as Record<string, string>)[draft?.language ?? ""] || (draft && isLanguage(draft.language) ? COMPETITION_LANGUAGES[draft.language].starter : "");
      if (draft && draft.updatedAt <= cutoff && draft.source.trim() && draft.source.trim() !== starter.trim()) {
        submission =
          (await tx.ccSubmission.findUnique({ where: { attemptId_requestKey: { attemptId: attempt.id, requestKey: `draft-${q.id}` } } })) ??
          (await tx.ccSubmission.create({ data: { attemptId: attempt.id, questionId: q.id, language: draft.language, source: draft.source, requestKey: `draft-${q.id}`, fromDraft: true, createdAt: draft.updatedAt } }));
      }
    }
    const totalWeight = q.tests.filter((t) => t.weight > 0).reduce((s, t) => s + t.weight, 0);
    const existing = await tx.ccEvaluation.findUnique({ where: { attemptId_questionId_evaluationVersion: { attemptId: attempt.id, questionId: q.id, evaluationVersion: version } } });
    if (existing) continue;
    if (!submission) {
      await tx.ccEvaluation.create({ data: { attemptId: attempt.id, questionId: q.id, evaluationVersion: version, status: "DONE", marks: item.marks, totalWeight, verdict: "NO_ANSWER", completedAt: new Date() } });
      continue;
    }
    await tx.ccEvaluation.create({ data: { attemptId: attempt.id, questionId: q.id, submissionId: submission.id, evaluationVersion: version, language: submission.language, marks: item.marks, totalWeight } });
    await tx.ccJudgeJob.create({
      data: { kind: "EVALUATE", attemptId: attempt.id, questionId: q.id, priority: 10, payload: { submissionId: submission.id, language: submission.language, evaluationVersion: version }, dedupeKey: `eval:${attempt.id}:${q.id}:v${version}` },
    });
  }
}

/** Finalizes attempts whose deadline (plus cutoff grace) has passed, even if the browser was closed. */
export async function sweepExpiredAttempts(max = 200) {
  const due = await prisma.ccAttempt.findMany({
    where: { status: "ACTIVE", deadlineAt: { lt: new Date(Date.now() - CUTOFF_GRACE_MS) } },
    select: { id: true },
    orderBy: { deadlineAt: "asc" },
    take: max,
  });
  let n = 0;
  for (const a of due) if ((await finalizeAttempt(a.id, "TIME_EXPIRED")).finalized) n++;
  return n;
}
