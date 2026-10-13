import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { err, loadChallengeForUser, publicReport, readBody, validateCode } from "@/lib/logiquest/api";
import { judge } from "@/lib/logiquest/judge";
import { ExecutorUnavailable } from "@/lib/logiquest/executor";
import { allow } from "@/lib/logiquest/rateLimit";
import { SUBMISSIONS_PER_MINUTE } from "@/lib/logiquest/constants";

/** Runs the learner's code against the PUBLIC examples only. Nothing is recorded and no XP is awarded. */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadChallengeForUser(slug);
  if ("error" in loaded) return loaded.error;
  const { user, challenge } = loaded;

  const body = await readBody<{ language?: string; source?: string }>(request);
  const invalid = validateCode(challenge, body);
  if (invalid) return invalid;
  if (!allow(`run:${user.id}`, SUBMISSIONS_PER_MINUTE * 2)) return err("You are running code too quickly. Wait a moment and try again.", 429);

  const cases = await prisma.lqTestCase.findMany({ where: { challengeId: challenge.id, isPublic: true }, orderBy: { position: "asc" } });
  try {
    const report = await judge(body!.language!, body!.source!, cases);
    return NextResponse.json(publicReport(report));
  } catch (e) {
    if (e instanceof ExecutorUnavailable) return err("Your code could not be executed. Please retry in a moment.", 503);
    throw e;
  }
}
