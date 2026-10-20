import "server-only";
import type { CcRegistration, Competition, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeResult, rankEntries } from "../scoring";
import { AWARD_FOR_RANK, type CompetitionStatus, type LeaderboardEntry } from "../types";
import { audit, auditNow } from "./audit";
import { syncCertificates } from "./certificates";
import { notifyUsers } from "./competitions";
import { ApiError } from "./http";
import { createWinnerOffers } from "./rewards";

/** Pending = not DONE (FAILED blocks too: an infrastructure failure must be retried, never scored as zero). */
export const pendingEvaluations = (competitionId: string, version: number) =>
  prisma.ccEvaluation.count({ where: { attempt: { competitionId }, evaluationVersion: version, status: { not: "DONE" } } });

/** Recomputes every finalized attempt's result from evaluations and recorded adjustments. Idempotent. */
export async function computeResults(competitionId: string) {
  const c = await prisma.competition.findUniqueOrThrow({ where: { id: competitionId } });
  const attempts = await prisma.ccAttempt.findMany({
    where: { competitionId, status: "FINALIZED" },
    include: {
      evaluations: { where: { evaluationVersion: c.evaluationVersion } },
      adjustments: true,
      registration: { include: { assignment: { include: { items: true } } } },
    },
  });
  const submissionIds = attempts.flatMap((a) => a.evaluations.map((e) => e.submissionId).filter((x): x is string => !!x));
  const submittedAt = new Map((await prisma.ccSubmission.findMany({ where: { id: { in: submissionIds } }, select: { id: true, createdAt: true } })).map((s) => [s.id, s.createdAt]));

  for (const a of attempts) {
    const items = (a.registration.assignment?.items ?? []).map((item) => {
      const e = a.evaluations.find((x) => x.questionId === item.questionId);
      return {
        marks: item.marks,
        hard: item.difficulty === "HARD",
        answered: !!e?.submissionId,
        score: e?.status === "DONE" ? e.score : 0,
        testsPassed: e?.passedWeight ?? 0,
        testsTotal: e?.totalWeight ?? 0,
        submittedAt: e?.submissionId ? submittedAt.get(e.submissionId) ?? null : null,
      };
    });
    const r = computeResult(items, c.negativeMarkPerWrong, a.adjustments);
    const data = {
      competitionId,
      evaluationVersion: c.evaluationVersion,
      rawScore: r.rawScore,
      hardScore: r.hardScore,
      maxScore: r.maxScore,
      negativeMarks: r.negativeMarks,
      adjustments: r.adjustments,
      finalScore: r.finalScore,
      questionsAttempted: r.questionsAttempted,
      testsPassed: r.testsPassed,
      testsTotal: r.testsTotal,
      lastScoringSubmitAt: r.lastScoringSubmitAt,
      computedAt: new Date(),
    };
    await prisma.ccResult.upsert({
      where: { attemptId: a.id },
      create: { attemptId: a.id, ...data, reviewStatus: r.disqualified ? "DISQUALIFIED" : "NONE" },
      update: { ...data, ...(r.disqualified ? { reviewStatus: "DISQUALIFIED" as const } : {}) },
    });
  }
  return attempts.length;
}

/** Ranks eligible results and freezes them as a new snapshot version (a preview until approved). */
export async function buildSnapshot(competitionId: string, actorId: string) {
  const c = await prisma.competition.findUniqueOrThrow({ where: { id: competitionId } });
  if (!["UNDER_REVIEW", "RESULTS_PUBLISHED"].includes(c.status)) throw new ApiError(409, "Results can be ranked once evaluation has finished.");
  await computeResults(competitionId);
  const results = await prisma.ccResult.findMany({ where: { competitionId, reviewStatus: { not: "DISQUALIFIED" } }, include: { attempt: { include: { registration: true } } } });
  const ranked = rankEntries(
    results.map((r) => ({ key: r.attemptId, candidateId: r.attempt.registration.candidateId, displayName: r.attempt.registration.displayName, finalScore: r.finalScore, maxScore: r.maxScore, hardScore: r.hardScore, lastScoringSubmitAt: r.lastScoringSubmitAt })),
    c.tieBreakBySubmitTime
  );
  const entries: LeaderboardEntry[] = ranked.map((r) => ({ rank: r.rank, candidateId: r.candidateId, displayName: r.displayName, finalScore: r.finalScore, maxScore: r.maxScore, award: AWARD_FOR_RANK[r.rank] ?? null }));
  const last = await prisma.ccLeaderboardSnapshot.findFirst({ where: { competitionId }, orderBy: { version: "desc" } });
  const snapshot = await prisma.ccLeaderboardSnapshot.create({ data: { competitionId, version: (last?.version ?? 0) + 1, entries: entries as unknown as Prisma.InputJsonValue, total: entries.length, createdById: actorId } });
  await auditNow({ competitionId, actorId, action: "results.snapshot", entity: "CcLeaderboardSnapshot", entityId: snapshot.id, meta: { version: snapshot.version, total: entries.length, top3: entries.slice(0, 3).map((e) => e.candidateId) } });
  return snapshot;
}

/** Problems that block approval, as messages. */
export async function approvalBlockers(c: Competition, snapshotId: string) {
  const out: string[] = [];
  const latest = await prisma.ccLeaderboardSnapshot.findFirst({ where: { competitionId: c.id }, orderBy: { version: "desc" } });
  if (!latest || latest.id !== snapshotId) out.push("Approve the latest snapshot only.");
  if (c.status !== "UNDER_REVIEW") out.push("Results can only be approved while the competition is under review.");
  const [pending, flagged, lastChange] = await Promise.all([
    pendingEvaluations(c.id, c.evaluationVersion),
    prisma.ccResult.count({ where: { competitionId: c.id, reviewStatus: "FLAGGED" } }),
    prisma.ccScoreAdjustment.findFirst({ where: { attempt: { competitionId: c.id } }, orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
  ]);
  if (pending) out.push(`${pending} evaluation(s) are pending or failed. Retry failed jobs first.`);
  if (flagged) out.push(`${flagged} flagged attempt(s) still need a review decision.`);
  if (latest && lastChange && lastChange.createdAt > latest.createdAt) out.push("Review decisions were recorded after this snapshot. Build a new snapshot.");
  return out;
}

export async function approveSnapshot(competitionId: string, snapshotId: string, actorId: string) {
  const c = await prisma.competition.findUniqueOrThrow({ where: { id: competitionId } });
  const blockers = await approvalBlockers(c, snapshotId);
  if (blockers.length) throw new ApiError(409, blockers.join(" "));
  await prisma.$transaction(async (tx) => {
    const now = new Date();
    await tx.ccLeaderboardSnapshot.update({ where: { id: snapshotId }, data: { approvedById: actorId, approvedAt: now } });
    await tx.competition.update({ where: { id: competitionId }, data: { resultsApprovedAt: now, resultsApprovedById: actorId } });
    await audit(tx, { competitionId, actorId, action: "results.approve", entity: "CcLeaderboardSnapshot", entityId: snapshotId });
  });
}

/** Writes ranks from a snapshot onto results in one statement. */
async function applyRanks(tx: Prisma.TransactionClient, competitionId: string, entries: LeaderboardEntry[]) {
  await tx.ccResult.updateMany({ where: { competitionId }, data: { rank: null } });
  const regs = await tx.ccRegistration.findMany({ where: { competitionId, candidateId: { in: entries.map((e) => e.candidateId) } }, select: { candidateId: true, attempt: { select: { id: true } } } });
  const attemptOf = new Map(regs.map((r) => [r.candidateId, r.attempt?.id]));
  const ids: string[] = [];
  const ranks: number[] = [];
  for (const e of entries) {
    const a = attemptOf.get(e.candidateId);
    if (a) {
      ids.push(a);
      ranks.push(e.rank);
    }
  }
  if (ids.length)
    await tx.$executeRaw`UPDATE "CcResult" AS r SET "rank" = v.rank FROM (SELECT unnest(${ids}::text[]) AS aid, unnest(${ranks}::int[]) AS rank) AS v WHERE r."attemptId" = v.aid`;
}

/**
 * Publishes the approved snapshot: only from UNDER_REVIEW, only once approved, never before resultsPublishAt.
 * Then issues certificates, opens the winner's internship offer (pending eligibility checks) and notifies everyone.
 */
export async function publishResults(competitionId: string, actorId: string) {
  const now = new Date();
  const published = await prisma.$transaction(async (tx) => {
    const c = await tx.competition.findUniqueOrThrow({ where: { id: competitionId } });
    if (c.status !== "UNDER_REVIEW") return null;
    if (!c.resultsApprovedAt) throw new ApiError(409, "Approve the results before publishing.");
    if (c.resultsPublishAt > now) throw new ApiError(409, "The scheduled publication time has not been reached. Postpone or wait; results cannot be published early.");
    const snapshot = await tx.ccLeaderboardSnapshot.findFirst({ where: { competitionId, approvedAt: { not: null } }, orderBy: { version: "desc" } });
    if (!snapshot) throw new ApiError(409, "No approved snapshot.");
    const moved = await tx.competition.updateMany({ where: { id: competitionId, status: "UNDER_REVIEW" }, data: { status: "RESULTS_PUBLISHED", statusChangedAt: now, resultsPublishedAt: now } });
    if (!moved.count) return null;
    await tx.ccLeaderboardSnapshot.update({ where: { id: snapshot.id }, data: { publishedAt: now } });
    await applyRanks(tx, competitionId, snapshot.entries as unknown as LeaderboardEntry[]);
    await audit(tx, { competitionId, actorId, action: "results.publish", entity: "CcLeaderboardSnapshot", entityId: snapshot.id, meta: { version: snapshot.version } });
    return c;
  }, { timeout: 60_000 });
  if (!published) return { published: false };
  await afterPublication(competitionId, published.title);
  return { published: true };
}

async function afterPublication(competitionId: string, title: string) {
  await syncCertificates(competitionId);
  await createWinnerOffers(competitionId);
  const regs = await prisma.ccRegistration.findMany({ where: { competitionId, attempt: { isNot: null } }, select: { userId: true } });
  await notifyUsers(regs.map((r) => r.userId), `${title}: results are out`, "Your score, rank and certificates are now on your competition dashboard.");
}

/**
 * After publication a score can only change through a recorded adjustment (server/review.ts). This re-ranks,
 * publishes the new snapshot under the same admin with the reason, and re-syncs award certificates.
 */
export async function republishAfterCorrection(competitionId: string, actorId: string, reason: string) {
  const snapshot = await buildSnapshot(competitionId, actorId);
  await prisma.$transaction(async (tx) => {
    const now = new Date();
    await tx.ccLeaderboardSnapshot.update({ where: { id: snapshot.id }, data: { approvedById: actorId, approvedAt: now, publishedAt: now } });
    await applyRanks(tx, competitionId, snapshot.entries as unknown as LeaderboardEntry[]);
    await audit(tx, { competitionId, actorId, action: "results.republish", entity: "CcLeaderboardSnapshot", entityId: snapshot.id, meta: { reason, version: snapshot.version } });
  });
  await syncCertificates(competitionId);
}

export async function postponePublication(competitionId: string, at: Date, reason: string, actorId: string) {
  const c = await prisma.competition.findUniqueOrThrow({ where: { id: competitionId } });
  if (["RESULTS_PUBLISHED", "ARCHIVED"].includes(c.status)) throw new ApiError(409, "Results are already published.");
  if (!(at.getTime() > Date.now()) || at <= c.endsAt) throw new ApiError(400, "Choose a future time after the competition window.");
  if (reason.trim().length < 10) throw new ApiError(400, "Give a reason (shown to candidates).");
  await prisma.$transaction(async (tx) => {
    await tx.competition.update({ where: { id: competitionId }, data: { resultsPublishAt: at } });
    await audit(tx, { competitionId, actorId, action: "results.postpone", entity: "Competition", entityId: competitionId, meta: { from: c.resultsPublishAt.toISOString(), to: at.toISOString(), reason } });
  });
  const regs = await prisma.ccRegistration.findMany({ where: { competitionId }, select: { userId: true } });
  const when = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: c.timezone, timeZoneName: "short" }).format(at);
  await notifyUsers(regs.map((r) => r.userId), `${c.title}: results rescheduled`, `Results will now be published on ${when}. ${reason.trim()}`);
}

export async function publishedSnapshot(competitionId: string) {
  return prisma.ccLeaderboardSnapshot.findFirst({ where: { competitionId, publishedAt: { not: null } }, orderBy: { version: "desc" } });
}

/** Top 50 for the public page, or nothing before publication. */
export async function publicLeaderboard(c: Competition) {
  const published = c.status === "RESULTS_PUBLISHED" || (c.status === "ARCHIVED" && !!c.resultsPublishedAt);
  if (!published) return { published: false as const, resultsPublishAt: c.resultsPublishAt.toISOString() };
  const snap = await publishedSnapshot(c.id);
  if (!snap) return { published: false as const, resultsPublishAt: c.resultsPublishAt.toISOString() };
  const entries = (snap.entries as unknown as LeaderboardEntry[]).slice(0, 50);
  return { published: true as const, entries, total: snap.total, publishedAt: snap.publishedAt!.toISOString() };
}

const REVIEWING: CompetitionStatus[] = ["SUBMISSION_CLOSED", "EVALUATION", "UNDER_REVIEW"];

/** The signed-in candidate's own result. Before publication: status only, never a score. */
export async function myResult(c: Competition, registration: CcRegistration) {
  const attempt = await prisma.ccAttempt.findUnique({ where: { registrationId: registration.id } });
  const published = c.status === "RESULTS_PUBLISHED" || (c.status === "ARCHIVED" && !!c.resultsPublishedAt);
  const base = {
    candidateId: registration.candidateId,
    displayName: registration.displayName,
    competitionTitle: c.title,
    resultsPublishAt: c.resultsPublishAt.toISOString(),
    attemptStatus: attempt ? attempt.status : ("NOT_STARTED" as const),
    finalReason: attempt?.finalReason ?? null,
    finalizedAt: attempt?.finalizedAt?.toISOString() ?? null,
  };
  if (!published || !attempt) {
    const pending = attempt ? await prisma.ccEvaluation.count({ where: { attemptId: attempt.id, status: { not: "DONE" } } }) : 0;
    return { ...base, published: false as const, phase: REVIEWING.includes(c.status as CompetitionStatus) ? (pending ? "EVALUATING" : "UNDER_REVIEW") : c.status };
  }
  const [result, evaluations, assignment, certificates, offer, snapshot, adjustments] = await Promise.all([
    prisma.ccResult.findUnique({ where: { attemptId: attempt.id } }),
    prisma.ccEvaluation.findMany({ where: { attemptId: attempt.id, evaluationVersion: c.evaluationVersion } }),
    prisma.ccAssignment.findUnique({ where: { registrationId: registration.id }, include: { items: { orderBy: { position: "asc" }, include: { question: { select: { title: true, difficulty: true } } } } } }),
    prisma.ccCertificate.findMany({ where: { registrationId: registration.id, revokedAt: null }, orderBy: { issuedAt: "asc" } }),
    prisma.ccInternshipOffer.findFirst({ where: { registrationId: registration.id } }),
    publishedSnapshot(c.id),
    prisma.ccScoreAdjustment.findMany({ where: { attemptId: attempt.id, kind: { in: ["PENALTY", "CORRECTION", "DISQUALIFY"] } }, select: { kind: true, delta: true, reason: true, createdAt: true } }),
  ]);
  return {
    ...base,
    published: true as const,
    result: result && {
      finalScore: result.finalScore,
      maxScore: result.maxScore,
      rawScore: result.rawScore,
      negativeMarks: result.negativeMarks,
      adjustments: result.adjustments,
      rank: result.rank,
      totalRanked: snapshot?.total ?? null,
      questionsAttempted: result.questionsAttempted,
      testsPassed: result.testsPassed,
      testsTotal: result.testsTotal,
      reviewStatus: result.reviewStatus,
    },
    questions: (assignment?.items ?? []).map((i) => {
      const e = evaluations.find((x) => x.questionId === i.questionId);
      return { position: i.position, title: i.question.title, difficulty: i.question.difficulty, marks: i.marks, score: e?.score ?? 0, passed: e?.passedWeight ?? 0, total: e?.totalWeight ?? 0, verdict: e?.verdict ?? null, language: e?.language ?? null };
    }),
    adjustments: adjustments.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    certificates: certificates.map((x) => ({ code: x.code, kind: x.kind, issuedAt: x.issuedAt.toISOString() })),
    offer: offer && { id: offer.id, status: offer.status, expiresAt: offer.expiresAt?.toISOString() ?? null, terms: offer.terms },
  };
}
