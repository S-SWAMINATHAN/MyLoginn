import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { err } from "@/lib/logiquest/http";
import { allow } from "@/lib/logiquest/rateLimit";
import { claimTurn, friendlyAiError, getOwnSession, readAudio, releaseTurn, toJson } from "@/lib/practice/sessions";
import { runInterviewTurn, type InterviewState } from "@/lib/practice/interview/engine";
import type { InterviewConfig } from "@/lib/practice/interview/config";
import { nextPosition, runSpeakingTurn, type SpeakingConfig, type SpeakingState } from "@/lib/practice/speaking/engine";
import { itemById } from "@/lib/practice/speaking/content";

export const runtime = "nodejs";
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

/** A finished turn, for answering a resubmission whose first response was lost (e.g. the network dropped it). */
async function storedTurn(sessionId: string, index: number) {
  if (!Number.isInteger(index) || index < 0) return null;
  const turn = await prisma.practiceTurn.findUnique({ where: { sessionId_index: { sessionId, index } }, select: { status: true, transcript: true, evaluation: true, metrics: true } });
  return turn?.status === "DONE" ? turn : null;
}

const NO_SPEECH = "We couldn't hear an answer in that recording. Check that your microphone is on and speak a little louder, then try again.";

/**
 * Submits one recorded answer. The whole answer is transcribed and analysed — and for interviews the next question
 * generated — before anything is returned, so the client never moves on before the evaluation is complete.
 * Form fields: audio (16-bit mono WAV), index (turn number the client expects), pos (speaking: item position).
 */
export async function POST(request: Request, { params }: Ctx) {
  // Auth from the signed cookie (no user lookup: ownership is checked on the session row), in parallel with parsing.
  const [userId, { id }, form] = await Promise.all([getSessionUserId(), params, request.formData().catch(() => null)]);
  if (!userId) return err("Your login has expired. Please log in again — your session is saved.", 401);
  if (!allow(`practice-turn:${userId}`, 15)) return err("You're going a bit fast. Please wait a moment and try again.", 429);
  if (!form) return err("Invalid request.", 400);

  const session = await getOwnSession(id, userId);
  if (!session) return err("Session not found.", 404);
  if (session.status !== "ACTIVE") return err("This session has already finished.", 409);
  const index = Number(form.get("index"));

  // Idempotency: a turn that already finished is answered from storage, never processed again.
  if (session.module === "INTERVIEW") {
    const state = session.state as unknown as InterviewState;
    if (index < state.asked - 1 || (state.done && index === state.asked - 1)) {
      const stored = await storedTurn(session.id, index);
      if (stored) return NextResponse.json({ duplicate: true, transcript: stored.transcript, ...(stored.evaluation as object), metrics: stored.metrics, asked: state.asked, total: state.plan.length, done: state.done });
    }
  } else if (session.module === "SPEAKING") {
    const state = session.state as unknown as SpeakingState;
    if (index < state.n) {
      const stored = await storedTurn(session.id, index);
      if (stored) return NextResponse.json({ duplicate: true, transcript: stored.transcript, evaluation: stored.evaluation, metrics: stored.metrics, state });
    }
  }

  const audio = await readAudio(form);
  if ("error" in audio) return err(audio.error, 400);
  // Cheap server-side voice check first: an empty recording never costs an AI call.
  if (audio.va.speechMs < 400) return NextResponse.json({ error: NO_SPEECH, noSpeech: true }, { status: 422 });

  if (session.module === "INTERVIEW") {
    const config = session.config as unknown as InterviewConfig;
    const state = session.state as unknown as InterviewState;
    if (state.done) return err("This interview is complete. Generate your report.", 409);
    if (index !== state.asked - 1) return err("This answer is out of date. Please reload the page — your session is saved.", 409);

    const claim = await claimTurn(session.id, index, state.current);
    if (claim.kind === "busy") return err("Your answer is already being analysed. Please wait.", 409);
    if (claim.kind === "done") return NextResponse.json({ duplicate: true, transcript: claim.transcript, ...(claim.evaluation as object), asked: state.asked, total: state.plan.length, done: state.done });

    try {
      const result = await runInterviewTurn(config, state, audio);
      if (result.kind === "no_speech") {
        await releaseTurn(claim.turnId);
        return NextResponse.json({ error: NO_SPEECH, noSpeech: true }, { status: 422 });
      }
      const stored = { evaluation: result.evaluation, reply: result.reply, nextQuestion: result.nextQuestion };
      await prisma.$transaction([
        prisma.practiceTurn.update({ where: { id: claim.turnId }, data: { status: "DONE", transcript: result.transcript, metrics: toJson(result.metrics), evaluation: toJson(stored), aiMs: result.aiMs } }),
        prisma.practiceSession.update({ where: { id: session.id }, data: { state: toJson(result.state) } }),
      ]);
      return NextResponse.json({ transcript: result.transcript, ...stored, metrics: result.metrics, asked: result.state.asked, total: result.state.plan.length, done: result.state.done });
    } catch (e) {
      await releaseTurn(claim.turnId);
      const f = friendlyAiError(e);
      return err(f.error, f.status);
    }
  }

  if (session.module === "SPEAKING") {
    const config = session.config as unknown as SpeakingConfig;
    const state = session.state as unknown as SpeakingState;
    const pos = Number(form.get("pos"));
    if (index !== state.n) return err("This attempt is out of date. Please reload the page — your progress is saved.", 409);
    const step = nextPosition(config, state, pos);
    if (!step.ok) return err("You've used all attempts for this item. Move on to the next one.", 409);
    const item = itemById(config.items[pos]);
    if (!item) return err("Exercise item not found.", 400);

    const claim = await claimTurn(session.id, index, item.display, item.id);
    if (claim.kind === "busy") return err("Your attempt is already being analysed. Please wait.", 409);
    if (claim.kind === "done") return NextResponse.json({ duplicate: true, transcript: claim.transcript, evaluation: claim.evaluation, metrics: claim.metrics, state });

    try {
      const result = await runSpeakingTurn(config, item, audio);
      if (result.kind === "no_speech") {
        await releaseTurn(claim.turnId);
        return NextResponse.json({ error: NO_SPEECH, noSpeech: true }, { status: 422 });
      }
      const next: SpeakingState = { cursor: pos, attempts: step.attempts, n: state.n + 1 };
      await prisma.$transaction([
        prisma.practiceTurn.update({ where: { id: claim.turnId }, data: { status: "DONE", transcript: result.transcript, metrics: toJson(result.metrics), evaluation: toJson(result.evaluation), aiMs: result.aiMs } }),
        prisma.practiceSession.update({ where: { id: session.id }, data: { state: toJson(next) } }),
      ]);
      return NextResponse.json({ transcript: result.transcript, evaluation: result.evaluation, metrics: result.metrics, state: next });
    } catch (e) {
      await releaseTurn(claim.turnId);
      const f = friendlyAiError(e);
      return err(f.error, f.status);
    }
  }

  return err("This session type does not take recorded answers.", 400);
}
