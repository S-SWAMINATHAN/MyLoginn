import "server-only";
import { randomInt } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { allow } from "@/lib/logiquest/rateLimit";
import { AiError } from "./ai";
import { decodeWav, frameEnergies, voiceActivity, type VoiceActivity } from "./speech";

/** Vercel rejects request bodies above ~4.5 MB; 16 kHz mono WAV is 32 KB/s, so ~2 minutes fits. */
export const MAX_AUDIO_BYTES = 4_000_000;
export const MAX_SESSIONS_PER_DAY = 40;
/** A turn stuck in PROCESSING longer than this (crashed function) may be claimed again. */
const STALE_TURN_MS = 120_000;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function randomCode(length: number) {
  let s = "";
  for (let i = 0; i < length; i++) s += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return s;
}
export const newReportNo = () => `ML-RPT-${randomCode(6)}`;

/** What a student sees when something fails: never raw errors, always "your session is safe". */
export function friendlyAiError(e: unknown) {
  const kind = e instanceof AiError ? e.kind : "unavailable";
  if (kind === "not_configured") return { status: 503, error: "AI evaluation is not available right now. Please try again later." };
  if (kind === "rate_limited") return { status: 429, error: "The AI is busy right now. Your session is safe — wait a few seconds and tap Retry." };
  if (kind === "timeout") return { status: 504, error: "The AI took too long to respond. Your session is safe — tap Retry to send the same answer again." };
  return { status: 502, error: "Something went wrong while analysing your answer. Your session is safe — tap Retry." };
}

export async function getOwnSession(id: string, userId: string) {
  const session = await prisma.practiceSession.findUnique({ where: { id } });
  return session && session.userId === userId ? session : null;
}

/** Starts are limited per day (AI cost) and per minute (double clicks / scripts). */
export async function canStartSession(userId: string) {
  if (!allow(`practice-start:${userId}`, 6)) return false;
  const since = new Date(Date.now() - 24 * 3600_000);
  const today = await prisma.practiceSession.count({ where: { userId, startedAt: { gte: since } } });
  return today < MAX_SESSIONS_PER_DAY;
}

export type Claim =
  | { kind: "claimed"; turnId: string }
  | { kind: "done"; evaluation: Prisma.JsonValue; transcript: string | null; metrics: Prisma.JsonValue }
  | { kind: "busy" };

/**
 * The response lock. Inserting (sessionId, index) succeeds for exactly one request; a duplicate submission of a
 * finished turn gets the stored result back, and one arriving while the first is still processing is rejected.
 */
export async function claimTurn(sessionId: string, index: number, prompt: string, itemId?: string): Promise<Claim> {
  try {
    const turn = await prisma.practiceTurn.create({ data: { sessionId, index, prompt: prompt.slice(0, 4000), itemId } });
    return { kind: "claimed", turnId: turn.id };
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
  }
  const existing = await prisma.practiceTurn.findUnique({ where: { sessionId_index: { sessionId, index } } });
  if (!existing) return { kind: "busy" };
  if (existing.status === "DONE") return { kind: "done", evaluation: existing.evaluation, transcript: existing.transcript, metrics: existing.metrics };
  if (Date.now() - existing.createdAt.getTime() > STALE_TURN_MS) {
    const reclaimed = await prisma.practiceTurn.updateMany({ where: { id: existing.id, status: "PROCESSING", createdAt: existing.createdAt }, data: { createdAt: new Date() } });
    if (reclaimed.count) return { kind: "claimed", turnId: existing.id };
  }
  return { kind: "busy" };
}

/** Frees the lock after a failure so the learner can retry the same answer. */
export async function releaseTurn(turnId: string) {
  await prisma.practiceTurn.deleteMany({ where: { id: turnId, status: "PROCESSING" } });
}

export type AudioUpload = { base64: string; va: VoiceActivity; bytes: number };

/** Reads and validates the uploaded answer (16-bit mono WAV) and measures it on the server. */
export async function readAudio(form: FormData): Promise<AudioUpload | { error: string }> {
  const file = form.get("audio");
  if (!(file instanceof Blob)) return { error: "No recording was received. Please record your answer again." };
  if (file.size > MAX_AUDIO_BYTES) return { error: "That recording is too long. Please keep answers under 2 minutes." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const wav = decodeWav(bytes);
  if (!wav) return { error: "The recording could not be read. Please try again." };
  const va = voiceActivity(frameEnergies(wav.pcm, wav.rate));
  return { base64: Buffer.from(bytes).toString("base64"), va, bytes: bytes.length };
}

export const toJson = (v: unknown) => v as Prisma.InputJsonValue;
