import "server-only";
import { prisma } from "@/lib/prisma";
import { audit } from "./audit";
import { notifyUsers } from "./competitions";
import { ApiError } from "./http";
import { computeResults, republishAfterCorrection } from "./results";

export type Decision = "CLEAR" | "PENALTY" | "DISQUALIFY" | "CORRECTION";
const STATUS_AFTER = { CLEAR: "CLEARED", PENALTY: "PENALIZED", DISQUALIFY: "DISQUALIFIED" } as const;

/**
 * A human decision on an attempt. The only way a score changes after evaluation; every decision needs a reason and
 * is stored as a CcScoreAdjustment plus an audit entry. After publication it re-ranks and republishes.
 */
export async function decide(attemptId: string, decision: Decision, delta: number, reason: string, actorId: string) {
  if (!["CLEAR", "PENALTY", "DISQUALIFY", "CORRECTION"].includes(decision)) throw new ApiError(400, "Unknown decision.");
  if (reason.trim().length < 15) throw new ApiError(400, "Record the evidence and reasoning (at least 15 characters). Candidates see this reason.");
  if (decision === "PENALTY" && !(delta < 0)) throw new ApiError(400, "A penalty is a negative number of marks.");
  if (decision === "CORRECTION" && (!Number.isFinite(delta) || delta === 0)) throw new ApiError(400, "Enter the correction in marks.");
  const attempt = await prisma.ccAttempt.findUnique({ where: { id: attemptId }, include: { competition: true, registration: true, result: true } });
  if (!attempt || attempt.status !== "FINALIZED") throw new ApiError(404, "Finalized attempt not found.");
  const c = attempt.competition;
  if (!["UNDER_REVIEW", "RESULTS_PUBLISHED", "EVALUATION"].includes(c.status)) throw new ApiError(409, "Decisions are recorded during review or as a post-publication correction.");

  await prisma.$transaction(async (tx) => {
    await tx.ccScoreAdjustment.create({ data: { attemptId, kind: decision, delta: decision === "PENALTY" || decision === "CORRECTION" ? delta : 0, reason: reason.trim(), actorId } });
    if (decision !== "CORRECTION" && attempt.result) await tx.ccResult.update({ where: { attemptId }, data: { reviewStatus: STATUS_AFTER[decision] } });
    await audit(tx, { competitionId: c.id, actorId, action: `review.${decision.toLowerCase()}`, entity: "CcAttempt", entityId: attemptId, meta: { delta, reason: reason.trim(), candidateId: attempt.registration.candidateId, afterPublication: c.status === "RESULTS_PUBLISHED" } });
  });
  await computeResults(c.id);
  if (decision === "CLEAR") return;
  if (c.status === "RESULTS_PUBLISHED") await republishAfterCorrection(c.id, actorId, reason.trim());
  if (decision !== "CORRECTION" || c.status === "RESULTS_PUBLISHED")
    await notifyUsers(
      [attempt.registration.userId],
      `${c.title}: a review decision was recorded`,
      decision === "DISQUALIFY"
        ? "Your attempt was disqualified after review. The reason is on your results page, and you can appeal from there."
        : "A score adjustment was recorded on your attempt. The reason is on your results page, and you can appeal from there."
    );
}

export async function createAppeal(registrationId: string, topic: unknown, message: unknown) {
  const t = topic === "INTEGRITY" || topic === "SCORE" ? topic : "OTHER";
  const text = typeof message === "string" ? message.trim() : "";
  if (text.length < 20 || text.length > 4000) throw new ApiError(400, "Describe your appeal in 20 to 4000 characters.");
  const open = await prisma.ccAppeal.count({ where: { registrationId, status: "OPEN" } });
  if (open >= 2) throw new ApiError(409, "You already have open appeals. You will be notified when they are answered.");
  const reg = await prisma.ccRegistration.findUniqueOrThrow({ where: { id: registrationId }, include: { attempt: { select: { id: true } } } });
  return prisma.ccAppeal.create({ data: { registrationId, attemptId: reg.attempt?.id ?? null, topic: t, message: text } });
}

export async function resolveAppeal(appealId: string, upheld: boolean, response: string, actorId: string) {
  if (response.trim().length < 15) throw new ApiError(400, "Write a response to the candidate (at least 15 characters).");
  const appeal = await prisma.ccAppeal.findUnique({ where: { id: appealId }, include: { registration: true } });
  if (!appeal || appeal.status !== "OPEN") throw new ApiError(404, "Open appeal not found.");
  await prisma.$transaction(async (tx) => {
    await tx.ccAppeal.update({ where: { id: appealId }, data: { status: upheld ? "UPHELD" : "REJECTED", response: response.trim(), resolverId: actorId, resolvedAt: new Date() } });
    await audit(tx, { competitionId: appeal.registration.competitionId, actorId, action: upheld ? "appeal.uphold" : "appeal.reject", entity: "CcAppeal", entityId: appealId });
  });
  await notifyUsers([appeal.registration.userId], "Your competition appeal was answered", "Open your competition dashboard to read the response.");
}
