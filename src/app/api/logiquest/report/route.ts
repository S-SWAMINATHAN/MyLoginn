import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuestion } from "@/lib/logiquest/bank";
import { REPORT_REASONS } from "@/lib/logiquest/constants";
import { clientKey, err, readBody } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";

/** "Report an error" on a question. Works without logging in. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!allow(`report:${user?.id ?? clientKey(request)}`, 5)) return err("Too many reports. Try again in a minute.", 429);
  const body = await readBody<{ qid?: unknown; reason?: unknown; details?: unknown }>(request, 4000);
  if (typeof body?.qid !== "string" || !REPORT_REASONS.some((r) => r.id === body.reason)) return err("Choose a reason.", 400);
  const details = typeof body.details === "string" ? body.details.trim().slice(0, 1000) : "";
  if (!(await getQuestion(body.qid, true))) return err("Question not found.", 404);
  await prisma.lqReport.create({ data: { qid: body.qid, userId: user?.id ?? null, reason: body.reason as string, details: details || null } });
  return NextResponse.json({ ok: true });
}
