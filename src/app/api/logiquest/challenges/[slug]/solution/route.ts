import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { err, loadChallengeForUser } from "@/lib/logiquest/api";
import { SOLUTION_UNLOCK_ATTEMPTS } from "@/lib/logiquest/constants";

/** The official solution unlocks after the learner solves the challenge or has made 3 attempts. */
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadChallengeForUser(slug);
  if ("error" in loaded) return loaded.error;
  const { user, challenge } = loaded;

  const progress = await prisma.lqProgress.findUnique({ where: { userId_challengeId: { userId: user.id, challengeId: challenge.id } } });
  const unlocked = user.role === "ADMIN" || progress?.solved || (progress?.attempts ?? 0) >= SOLUTION_UNLOCK_ATTEMPTS;
  if (!unlocked) return err(`The solution unlocks after you solve this challenge or make ${SOLUTION_UNLOCK_ATTEMPTS} attempts.`, 403);
  if (!challenge.solution) return err("The official solution for this challenge is still being reviewed.", 404);

  if (progress && !progress.solutionViewed) await prisma.lqProgress.update({ where: { id: progress.id }, data: { solutionViewed: true } });
  return NextResponse.json({ solution: challenge.solution, videoUrl: challenge.videoUrl });
}
