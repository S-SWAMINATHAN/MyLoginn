import "server-only";
import { prisma } from "@/lib/prisma";
import { judgeHealth } from "./judge";

/** Live operational numbers for the admin dashboard. Every figure is a database count; nothing is estimated. */
export async function competitionMetrics(competitionId: string) {
  const since = new Date(Date.now() - 2 * 60_000);
  const [registrations, assigned, attempts, active, recentlyActive, finalized, submittedExplicit, evalByStatus, flagged, reviewed, certificates, openAppeals, events, jobs1h, failed1h, judge] = await Promise.all([
    prisma.ccRegistration.count({ where: { competitionId } }),
    prisma.ccAssignment.count({ where: { competitionId } }),
    prisma.ccAttempt.count({ where: { competitionId } }),
    prisma.ccAttempt.count({ where: { competitionId, status: "ACTIVE" } }),
    prisma.ccAttempt.count({ where: { competitionId, status: "ACTIVE", lastSeenAt: { gte: since } } }),
    prisma.ccAttempt.groupBy({ by: ["finalReason"], where: { competitionId, status: "FINALIZED" }, _count: { _all: true } }),
    prisma.ccSubmission.groupBy({ by: ["attemptId"], where: { attempt: { competitionId }, fromDraft: false } }).then((r) => r.length),
    prisma.ccEvaluation.groupBy({ by: ["status"], where: { attempt: { competitionId } }, _count: { _all: true } }),
    prisma.ccResult.count({ where: { competitionId, reviewStatus: "FLAGGED" } }),
    prisma.ccResult.groupBy({ by: ["reviewStatus"], where: { competitionId }, _count: { _all: true } }),
    prisma.ccCertificate.groupBy({ by: ["kind"], where: { competitionId, revokedAt: null }, _count: { _all: true } }),
    prisma.ccAppeal.count({ where: { registration: { competitionId }, status: "OPEN" } }),
    prisma.ccIntegrityEvent.groupBy({ by: ["type"], where: { attempt: { competitionId } }, _count: { _all: true } }),
    prisma.ccJudgeJob.count({ where: { attempt: { competitionId }, finishedAt: { gte: new Date(Date.now() - 3600_000) } } }),
    prisma.ccJudgeJob.count({ where: { attempt: { competitionId }, status: "FAILED", finishedAt: { gte: new Date(Date.now() - 3600_000) } } }),
    judgeHealth(),
  ]);
  const finalizedTotal = finalized.reduce((s, f) => s + f._count._all, 0);
  return {
    registrations,
    assigned,
    attemptsStarted: attempts,
    activeAttempts: active,
    connectedLast2Min: recentlyActive,
    finalized: Object.fromEntries(finalized.map((f) => [f.finalReason ?? "UNKNOWN", f._count._all])),
    finalizedTotal,
    candidatesWhoSubmitted: submittedExplicit,
    submissionRate: attempts ? Math.round((submittedExplicit / attempts) * 100) : 0,
    evaluations: Object.fromEntries(evalByStatus.map((e) => [e.status, e._count._all])),
    pendingReviews: flagged,
    reviewStatus: Object.fromEntries(reviewed.map((r) => [r.reviewStatus, r._count._all])),
    certificates: Object.fromEntries(certificates.map((c) => [c.kind, c._count._all])),
    openAppeals,
    events: Object.fromEntries(events.map((e) => [e.type, e._count._all])),
    judgeJobsLastHour: jobs1h,
    judgeFailuresLastHour: failed1h,
    judgeErrorRate: jobs1h ? Math.round((failed1h / jobs1h) * 1000) / 10 : 0,
    judge,
  };
}
