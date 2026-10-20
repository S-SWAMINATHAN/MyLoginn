import { verifyAuditChain } from "@/lib/competition/server/audit";
import { exposureReport } from "@/lib/competition/server/bank";
import { requireAdminUser } from "@/lib/competition/server/context";
import { ApiError, handle, json } from "@/lib/competition/server/http";
import { maskEmail, maskPhone } from "@/lib/competition/server/registration";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

/** Read-only admin lists: candidates, review queue, offers, certificates, appeals, exposure, audit trail. */
export const GET = handle(async (request: Request, { params }: Ctx) => {
  await requireAdminUser();
  const { id } = await params;
  const url = new URL(request.url);
  const kind = url.searchParams.get("kind");
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 80);
  const page = Math.max(0, Number(url.searchParams.get("page")) || 0);
  const take = 50;

  switch (kind) {
    case "candidates": {
      const where = {
        competitionId: id,
        ...(q ? { OR: [{ candidateId: { contains: q, mode: "insensitive" as const } }, { displayName: { contains: q, mode: "insensitive" as const } }, { emailNormalized: { contains: q.toLowerCase() } }, { phoneNormalized: { contains: q.replace(/\s/g, "") } }] } : {}),
      };
      const [total, rows] = await Promise.all([
        prisma.ccRegistration.count({ where }),
        prisma.ccRegistration.findMany({ where, orderBy: { candidateId: "asc" }, skip: page * take, take, include: { attempt: { include: { result: true } }, user: { select: { createdAt: true } } } }),
      ]);
      // Possible duplicate people: same phone or IP hash across different registrations of this competition.
      const ipHashes = rows.map((r) => r.attempt?.ipHash).filter((x): x is string => !!x);
      const sharedIp = ipHashes.length ? await prisma.ccAttempt.groupBy({ by: ["ipHash"], where: { competitionId: id, ipHash: { in: ipHashes } }, _count: { _all: true } }) : [];
      const shared = new Map(sharedIp.map((s) => [s.ipHash, s._count._all]));
      return json({
        total,
        page,
        rows: rows.map((r) => ({
          registrationId: r.id,
          candidateId: r.candidateId,
          name: r.displayName,
          email: maskEmail(r.emailNormalized),
          phone: maskPhone(r.phoneNormalized),
          registeredAt: r.createdAt,
          attempt: r.attempt && { id: r.attempt.id, status: r.attempt.status, startedAt: r.attempt.startedAt, finalReason: r.attempt.finalReason, resumeCount: r.attempt.resumeCount, sharedNetwork: (shared.get(r.attempt.ipHash ?? "") ?? 0) > 1 ? shared.get(r.attempt.ipHash ?? "") : 0 },
          result: r.attempt?.result && { finalScore: r.attempt.result.finalScore, maxScore: r.attempt.result.maxScore, rank: r.attempt.result.rank, reviewStatus: r.attempt.result.reviewStatus, integrityRisk: r.attempt.result.integrityRisk },
        })),
      });
    }
    case "review": {
      const rows = await prisma.ccResult.findMany({
        where: { competitionId: id, OR: [{ reviewStatus: { not: "NONE" } }, { integrityRisk: { gte: 20 } }] },
        orderBy: [{ reviewStatus: "asc" }, { integrityRisk: "desc" }],
        take: 200,
        include: { attempt: { include: { registration: { select: { candidateId: true, displayName: true } }, reports: { select: { kind: true, riskScore: true } } } } },
      });
      return json({
        rows: rows.map((r) => ({ attemptId: r.attemptId, candidateId: r.attempt.registration.candidateId, name: r.attempt.registration.displayName, reviewStatus: r.reviewStatus, integrityRisk: r.integrityRisk, finalScore: r.finalScore, maxScore: r.maxScore, reports: r.attempt.reports.length, similarity: r.attempt.reports.filter((x) => x.kind === "SIMILARITY").length })),
      });
    }
    case "offers":
      return json({ rows: await prisma.ccInternshipOffer.findMany({ where: { competitionId: id }, include: { registration: { select: { candidateId: true, displayName: true } } }, orderBy: { createdAt: "asc" } }) });
    case "certificates":
      return json({
        rows: await prisma.ccCertificate.findMany({ where: { competitionId: id, ...(q ? { OR: [{ code: { contains: q.toUpperCase() } }, { candidateName: { contains: q, mode: "insensitive" } }] } : {}) }, orderBy: [{ kind: "asc" }, { issuedAt: "asc" }], skip: page * take, take, include: { registration: { select: { candidateId: true } } } }),
      });
    case "appeals":
      return json({ rows: await prisma.ccAppeal.findMany({ where: { registration: { competitionId: id } }, orderBy: [{ status: "asc" }, { createdAt: "asc" }], include: { registration: { select: { candidateId: true, displayName: true } } } }) });
    case "exposure":
      return json(await exposureReport(id));
    case "snapshots":
      return json({ rows: await prisma.ccLeaderboardSnapshot.findMany({ where: { competitionId: id }, orderBy: { version: "desc" }, select: { id: true, version: true, total: true, createdAt: true, approvedAt: true, publishedAt: true } }) });
    case "audit": {
      const [rows, broken] = await Promise.all([prisma.ccAuditLog.findMany({ where: { competitionId: id }, orderBy: { seq: "desc" }, take: 200 }), verifyAuditChain()]);
      return json({ rows, chainIntact: !broken, brokenAt: broken });
    }
    default:
      throw new ApiError(400, "Unknown list.");
  }
});
