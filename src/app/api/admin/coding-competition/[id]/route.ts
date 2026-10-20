import { competitionMetrics } from "@/lib/competition/server/analytics";
import { finalizeAttempt } from "@/lib/competition/server/attempts";
import { analyzeCompetitionBank, generateAssignments } from "@/lib/competition/server/bank";
import { reissueCertificate, revokeCertificate } from "@/lib/competition/server/certificates";
import { publicView } from "@/lib/competition/server/competitions";
import { requireAdminUser } from "@/lib/competition/server/context";
import { ApiError, assertSameOrigin, handle, json, readJson, str } from "@/lib/competition/server/http";
import { aiSummary, analyzeIntegrity } from "@/lib/competition/server/integrity";
import { retryFailedEvaluations } from "@/lib/competition/server/judge";
import { advance, competitionSchema, openRegistrationBlockers, reevaluate, transition, updateCompetition } from "@/lib/competition/server/lifecycle";
import { approvalBlockers, approveSnapshot, buildSnapshot, computeResults, postponePublication, publishResults } from "@/lib/competition/server/results";
import { decide, resolveAppeal, type Decision } from "@/lib/competition/server/review";
import { offerAction, rewardSchema, upsertReward } from "@/lib/competition/server/rewards";
import { STATUS_ORDER, type CompetitionStatus } from "@/lib/competition/types";
import { prisma } from "@/lib/prisma";

export const maxDuration = 300;
type Ctx = { params: Promise<{ id: string }> };

/** Full admin view of one competition: configuration, readiness checks, live metrics and the latest snapshot. */
export const GET = handle(async (_request: Request, { params }: Ctx) => {
  await requireAdminUser();
  const { id } = await params;
  const c = (await advance(id)) && (await prisma.competition.findUnique({ where: { id }, include: { reward: true } }));
  if (!c) throw new ApiError(404, "Competition not found.");
  const [metrics, bank, blockers, snapshot] = await Promise.all([
    competitionMetrics(id),
    analyzeCompetitionBank(c),
    c.status === "DRAFT" ? openRegistrationBlockers(c) : null,
    prisma.ccLeaderboardSnapshot.findFirst({ where: { competitionId: id }, orderBy: { version: "desc" } }),
  ]);
  return json({
    competition: c,
    view: publicView(c),
    metrics,
    bank,
    openBlockers: blockers,
    snapshot: snapshot && { id: snapshot.id, version: snapshot.version, total: snapshot.total, approvedAt: snapshot.approvedAt, publishedAt: snapshot.publishedAt, createdAt: snapshot.createdAt, top: (snapshot.entries as unknown[]).slice(0, 50) },
    approvalBlockers: snapshot && c.status === "UNDER_REVIEW" ? await approvalBlockers(c, snapshot.id) : [],
    serverNow: new Date().toISOString(),
  });
});

export const PUT = handle(async (request: Request, { params }: Ctx) => {
  assertSameOrigin(request);
  const admin = await requireAdminUser();
  const { id } = await params;
  const parsed = competitionSchema.safeParse(await readJson(request, 60_000));
  if (!parsed.success) throw new ApiError(400, `${parsed.error.issues[0]?.path.join(".")}: ${parsed.error.issues[0]?.message}`);
  await updateCompetition(id, parsed.data, admin.id);
  return json({ ok: true });
});

/** Admin actions. Every one is authorised here and audited inside the service that performs it. */
export const POST = handle(async (request: Request, { params }: Ctx) => {
  assertSameOrigin(request);
  const admin = await requireAdminUser();
  const { id } = await params;
  const b = await readJson<Record<string, unknown>>(request, 20_000);
  const reason = str(b.reason, 4000);
  switch (b.action) {
    case "transition": {
      if (!STATUS_ORDER.includes(b.to as CompetitionStatus)) throw new ApiError(400, "Unknown status.");
      const c = await transition(id, b.to as CompetitionStatus, admin.id, b.acknowledgeWarnings === true);
      return json({ status: c?.status });
    }
    case "generateAssignments":
      return json(await generateAssignments(id, admin.id, b.acknowledgeWarnings === true));
    case "retryFailed":
      return json({ retried: await retryFailedEvaluations(id) });
    case "reevaluate":
      return json(await reevaluate(id, admin.id, reason));
    case "analyzeIntegrity":
      await computeResults(id);
      return json(await analyzeIntegrity(id));
    case "computeResults":
      return json({ results: await computeResults(id) });
    case "snapshot": {
      const s = await buildSnapshot(id, admin.id);
      return json({ id: s.id, version: s.version });
    }
    case "approve":
      await approveSnapshot(id, str(b.snapshotId, 40), admin.id);
      await advance(id);
      return json({ ok: true });
    case "publish":
      return json(await publishResults(id, admin.id));
    case "postpone":
      await postponePublication(id, new Date(str(b.at, 40)), reason, admin.id);
      return json({ ok: true });
    case "reward": {
      const parsed = rewardSchema.safeParse(b.reward);
      if (!parsed.success) throw new ApiError(400, `${parsed.error.issues[0]?.path.join(".")}: ${parsed.error.issues[0]?.message}`);
      await upsertReward(id, parsed.data, admin.id);
      return json({ ok: true });
    }
    case "offer":
      await offerAction(str(b.offerId, 40), str(b.step, 20) as "approve" | "send" | "withdraw", reason, admin.id);
      return json({ ok: true });
    case "revokeCertificate":
      await revokeCertificate(str(b.certificateId, 40), reason, admin.id);
      return json({ ok: true });
    case "reissueCertificate":
      await reissueCertificate(str(b.certificateId, 40), reason, str(b.candidateName, 80) || undefined, admin.id);
      return json({ ok: true });
    case "resolveAppeal":
      await resolveAppeal(str(b.appealId, 40), b.upheld === true, reason, admin.id);
      return json({ ok: true });
    case "decide":
      await assertAttemptOf(id, str(b.attemptId, 40));
      await decide(str(b.attemptId, 40), str(b.decision, 20) as Decision, Number(b.delta) || 0, reason, admin.id);
      return json({ ok: true });
    case "aiSummary":
      await assertAttemptOf(id, str(b.attemptId, 40));
      return json(await aiSummary(str(b.attemptId, 40)));
    case "forceFinalize":
      await assertAttemptOf(id, str(b.attemptId, 40));
      return json(await finalizeAttempt(str(b.attemptId, 40), "ADMIN"));
    default:
      throw new ApiError(400, "Unknown action.");
  }
});

async function assertAttemptOf(competitionId: string, attemptId: string) {
  if (!(await prisma.ccAttempt.findFirst({ where: { id: attemptId, competitionId }, select: { id: true } }))) throw new ApiError(404, "Attempt not found in this competition.");
}
