import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err } from "@/lib/logiquest/http";
import { getOwnSession, newReportNo, toJson } from "@/lib/practice/sessions";
import { buildInterviewReport, type TurnEvaluation } from "@/lib/practice/interview/engine";
import type { InterviewConfig } from "@/lib/practice/interview/config";
import { buildSpeakingReport, type SpeakingConfig, type SpeakingEvaluation } from "@/lib/practice/speaking/engine";

export const runtime = "nodejs";
export const maxDuration = 90;

type Ctx = { params: Promise<{ id: string }> };
const STALE_FINALIZE_MS = 3 * 60_000;
/** Practice time counted on a report, so a session resumed the next day is not reported as 20 hours. */
const MAX_DURATION_S = 90 * 60;

/** Ends a session and generates its report. Idempotent: a second click returns the same report. */
export async function POST(_request: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return err("Please log in again — your session is saved.", 401);
  const { id } = await params;
  const session = await getOwnSession(id, user.id);
  if (!session) return err("Session not found.", 404);
  if (session.status === "COMPLETED") return NextResponse.json({ id: session.id, reportNo: session.reportNo });
  if (session.module === "GD") return err("Group discussion reports are generated when the discussion ends.", 400);

  // Claim: exactly one request generates the report. A claim left by a crashed request expires.
  const claimed = await prisma.practiceSession.updateMany({
    where: { id, OR: [{ status: "ACTIVE" }, { status: "FINALIZING", endedAt: { lt: new Date(Date.now() - STALE_FINALIZE_MS) } }] },
    data: { status: "FINALIZING", endedAt: new Date() },
  });
  if (!claimed.count) return err("Your report is already being prepared. Please wait a moment.", 409);

  try {
    const turns = await prisma.practiceTurn.findMany({ where: { sessionId: id, status: "DONE" }, orderBy: { index: "asc" } });
    if (!turns.length) {
      await prisma.practiceSession.update({ where: { id }, data: { status: "ABANDONED" } });
      return NextResponse.json({ id, abandoned: true });
    }
    const last = turns[turns.length - 1].createdAt.getTime();
    const durationS = Math.min(MAX_DURATION_S, Math.max(30, Math.round((last - session.startedAt.getTime()) / 1000) + 30));

    const built =
      session.module === "INTERVIEW"
        ? await buildInterviewReport(
            session.config as unknown as InterviewConfig,
            turns.map((t) => ({ prompt: t.prompt, transcript: t.transcript ?? "", evaluation: (t.evaluation as unknown as { evaluation: TurnEvaluation }).evaluation, metrics: t.metrics as Record<string, number> | null })),
            durationS
          )
        : await buildSpeakingReport(
            session.config as unknown as SpeakingConfig,
            turns.map((t) => ({ itemId: t.itemId, transcript: t.transcript ?? "", evaluation: t.evaluation as unknown as SpeakingEvaluation, metrics: t.metrics as Record<string, unknown> | null })),
            durationS
          );

    const reportNo = newReportNo();
    await prisma.practiceSession.update({
      where: { id },
      data: { status: "COMPLETED", score: built.overall, scores: toJson(built.scores), report: toJson(built.report), reportNo, durationS },
    });
    return NextResponse.json({ id, reportNo });
  } catch (e) {
    console.error("practice finish failed", id, e instanceof Error ? e.message : e);
    await prisma.practiceSession.updateMany({ where: { id, status: "FINALIZING" }, data: { status: "ACTIVE", endedAt: null } });
    return err("We couldn't generate your report just now. Your answers are saved — please try again.", 502);
  }
}
