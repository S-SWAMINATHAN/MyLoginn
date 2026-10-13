import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { err, loadChallengeForUser, readBody } from "@/lib/logiquest/api";

/** Reveals hint number `n` (1-based). Hints unlock in order; the server tracks how many were used for the XP penalty. */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadChallengeForUser(slug);
  if ("error" in loaded) return loaded.error;
  const { user, challenge } = loaded;

  const body = await readBody<{ n?: number }>(request, 1000);
  const n = body?.n;
  if (!Number.isInteger(n) || n! < 1 || n! > challenge.hints.length) return err("That hint does not exist.", 400);

  const progress = await prisma.lqProgress.upsert({
    where: { userId_challengeId: { userId: user.id, challengeId: challenge.id } },
    create: { userId: user.id, challengeId: challenge.id, hintsUsed: 0 },
    update: {},
  });
  if (n! > progress.hintsUsed + 1) return err("Open the earlier hints first.", 409);
  if (n! > progress.hintsUsed) {
    await prisma.lqProgress.update({ where: { id: progress.id }, data: { hintsUsed: n! } });
  }
  return NextResponse.json({ hint: challenge.hints[n! - 1], hintsUsed: Math.max(n!, progress.hintsUsed) });
}
