import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { err, loadChallengeForUser, publicReport, readBody, validateCode } from "@/lib/logiquest/api";
import { judge } from "@/lib/logiquest/judge";
import { ExecutorUnavailable } from "@/lib/logiquest/executor";
import { countRecentExecutions, recordSubmission } from "@/lib/logiquest/progress";
import { SUBMISSIONS_PER_MINUTE } from "@/lib/logiquest/constants";

/** Judges against ALL test cases (public + hidden) on the server, records the attempt and awards XP once. */
export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await loadChallengeForUser(slug);
  if ("error" in loaded) return loaded.error;
  const { user, challenge } = loaded;

  const body = await readBody<{ language?: string; source?: string }>(request);
  const invalid = validateCode(challenge, body);
  if (invalid) return invalid;
  if ((await countRecentExecutions(user.id)) >= SUBMISSIONS_PER_MINUTE) return err("Too many submissions. Wait a moment and try again.", 429);

  const cases = await prisma.lqTestCase.findMany({ where: { challengeId: challenge.id }, orderBy: { position: "asc" } });
  if (!cases.length) return err("This challenge has no test cases yet.", 409);

  try {
    const report = await judge(body!.language!, body!.source!, cases);
    const result = await recordSubmission({ userId: user.id, challenge, language: body!.language!, source: body!.source!, report });
    return NextResponse.json({ ...publicReport(report), ...result });
  } catch (e) {
    if (e instanceof ExecutorUnavailable) return err("Your code could not be executed. Please retry in a moment.", 503);
    throw e;
  }
}
