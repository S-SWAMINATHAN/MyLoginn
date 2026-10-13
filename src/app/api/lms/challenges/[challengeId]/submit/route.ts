import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readJson, requireCourseLearner, requireLessonLearner } from "@/lib/lms/guard";
import { evaluateChallenge, type ChallengeCheck, type ChallengeTest } from "@/lib/lms/challenge";
import { awardOnce } from "@/lib/lms/points";
import { getRewardConfig } from "@/lib/lms/settings";
import { rewardKey } from "@/lib/lms/rewards";
import { syncCodeRequirement } from "@/lib/lms/completion";

export async function POST(request: Request, { params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = await params;
  const challenge = await prisma.codingChallenge.findUnique({ where: { id: challengeId }, include: { course: { select: { slug: true } } } });
  if (!challenge || challenge.archivedAt) return NextResponse.json({ error: "Challenge not found." }, { status: 404 });

  const guard = challenge.lessonId
    ? await requireLessonLearner(challenge.lessonId, { write: true })
    : await requireCourseLearner(challenge.course.slug, { write: true });
  if (!guard.ok) return guard.response;
  const { user, structure } = guard.ctx;

  const body = await readJson<{ source?: unknown; results?: unknown }>(request, 120_000);
  if (!body || typeof body.source !== "string" || body.source.length > 20_000 || !Array.isArray(body.results) || body.results.length > 50) {
    return NextResponse.json({ error: "Run your code first, then submit." }, { status: 400 });
  }
  const reported = (body.results as unknown[]).flatMap((r) => {
    const item = r as { index?: unknown; output?: unknown };
    return typeof item?.index === "number" && Number.isInteger(item.index) && typeof item.output === "string" && item.output.length <= 5000
      ? [{ index: item.index, output: item.output }]
      : [];
  });

  // Simple abuse limit: 20 submissions per minute per learner.
  const recent = await prisma.challengeSubmission.count({ where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 60_000) } } });
  if (recent >= 20) return NextResponse.json({ error: "Too many submissions. Wait a moment and try again." }, { status: 429 });

  const verdict = evaluateChallenge(challenge.tests as unknown as ChallengeTest[], challenge.checks as unknown as ChallengeCheck[], body.source, reported);
  await prisma.challengeSubmission.create({
    data: { userId: user.id, challengeId, source: body.source, output: reported[0]?.output.slice(0, 2000) ?? null, passed: verdict.passed, feedback: verdict.feedback },
  });

  let pointsAwarded = 0;
  let lessonCompleted = false;
  if (verdict.passed) {
    // Per-challenge points; challenges without their own value fall back to the platform reward setting.
    const points = challenge.points > 0 ? challenge.points : (await getRewardConfig()).challenge;
    if (await awardOnce(user.id, rewardKey.challenge(user.id, challengeId), points, "lms_challenge", `${structure.course.title}: ${challenge.title}`)) {
      pointsAwarded = points;
    }
    if (challenge.lessonId) lessonCompleted = (await syncCodeRequirement(user.id, structure, challenge.lessonId)).lessonCompleted;
  }

  return NextResponse.json({
    passed: verdict.passed,
    testResults: verdict.testResults,
    feedback: verdict.feedback,
    hiddenTestsEvaluated: verdict.hiddenTestsEvaluated,
    pointsAwarded,
    lessonCompleted,
    // The reference solution is revealed only after the learner has passed.
    ...(verdict.passed ? { solutionCode: challenge.solutionCode, solutionExplanation: challenge.solutionExplanation } : {}),
  });
}
