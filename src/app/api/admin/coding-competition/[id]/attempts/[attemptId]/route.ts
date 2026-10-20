import { requireAdminUser } from "@/lib/competition/server/context";
import { ApiError, handle, json } from "@/lib/competition/server/http";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string; attemptId: string }> };

/** Everything a reviewer needs for one attempt: answers, test results, monitoring timeline, evidence, decisions. */
export const GET = handle(async (_request: Request, { params }: Ctx) => {
  await requireAdminUser();
  const { id, attemptId } = await params;
  const attempt = await prisma.ccAttempt.findFirst({
    where: { id: attemptId, competitionId: id },
    include: {
      registration: { select: { candidateId: true, displayName: true, assignment: { include: { items: { orderBy: { position: "asc" }, include: { question: { select: { id: true, title: true, family: true, version: true, difficulty: true, topic: true } } } } } } } },
      competition: { select: { evaluationVersion: true } },
      events: { orderBy: { serverAt: "asc" }, take: 2000 },
      evaluations: { include: { tests: true }, orderBy: { createdAt: "asc" } },
      reports: { orderBy: { riskScore: "desc" } },
      adjustments: { orderBy: { createdAt: "asc" } },
      result: true,
      appeals: true,
    },
  });
  if (!attempt) throw new ApiError(404, "Attempt not found.");
  const submissionIds = attempt.evaluations.map((e) => e.submissionId).filter((x): x is string => !!x);
  const otherIds = attempt.reports.map((r) => r.otherAttemptId).filter((x): x is string => !!x);
  const [finals, submissionCount, others] = await Promise.all([
    prisma.ccSubmission.findMany({ where: { id: { in: submissionIds } } }),
    prisma.ccSubmission.count({ where: { attemptId, fromDraft: false } }),
    prisma.ccAttempt.findMany({ where: { id: { in: otherIds } }, select: { id: true, registration: { select: { candidateId: true } } } }),
  ]);
  // The other side of each similarity pair, so the reviewer can compare code side by side.
  const otherSubs = otherIds.length
    ? await prisma.ccEvaluation.findMany({ where: { attemptId: { in: otherIds }, evaluationVersion: attempt.competition.evaluationVersion, submissionId: { not: null } }, select: { attemptId: true, questionId: true, submissionId: true } })
    : [];
  const otherSources = new Map((await prisma.ccSubmission.findMany({ where: { id: { in: otherSubs.map((s) => s.submissionId!) } }, select: { id: true, source: true, language: true } })).map((s) => [s.id, s]));
  return json({
    attempt: { ...attempt, competition: undefined },
    finals,
    submissionCount,
    counterparts: Object.fromEntries(others.map((o) => [o.id, o.registration.candidateId])),
    counterpartCode: otherSubs.map((s) => ({ attemptId: s.attemptId, questionId: s.questionId, ...otherSources.get(s.submissionId!) })),
  });
});
