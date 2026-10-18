import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AiError, NO_HALLUCINATION, RUBRIC, S, asList, asObjects, asRecord, asText, clampScore, generateJson } from "../ai";
import { newReportNo, randomCode, toJson } from "../sessions";
import { mean, type PracticeReport } from "../report";
import { band, transcriptMetrics, type VoiceActivity } from "../speech";
import {
  GD_CATEGORIES, GD_DIMENSIONS, GD_FLUSH_GRACE_MS, GD_FLUSH_MAX_MS, GD_LIMITS, GD_ONLINE_MS, gdPhase,
  type GdPublicParticipant, type GdPublicRoom, type GdSync,
} from "./config";

const LOBBY_EXPIRY_MS = 3 * 3600_000;
const STALE_JUDGING_MS = 4 * 60_000;
const HEARTBEAT_EVERY_MS = 5_000;

export class GdError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};

// ───────────── ICE servers ─────────────

/**
 * Free public STUN always; a self-hosted TURN relay (coturn with `use-auth-secret`) when GD_TURN_URLS and
 * GD_TURN_SECRET are set. TURN credentials are short-lived HMACs, so the shared secret never reaches the browser.
 */
export function iceServers(userId: string): RTCIceServer[] {
  const servers: RTCIceServer[] = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun.cloudflare.com:3478"] }];
  const urls = process.env.GD_TURN_URLS?.split(",").map((u) => u.trim()).filter(Boolean);
  const secret = process.env.GD_TURN_SECRET;
  if (urls?.length && secret) {
    const username = `${Math.floor(Date.now() / 1000) + 6 * 3600}:${userId}`;
    servers.push({ urls, username, credential: createHmac("sha1", secret).update(username).digest("base64") });
  }
  return servers;
}

// ───────────── rooms ─────────────

const roomWithPeople = { participants: { include: { user: { select: { name: true, avatarColor: true, avatarUrl: true } } }, orderBy: { joinedAt: "asc" as const } } };
type RoomFull = Prisma.GdRoomGetPayload<{ include: typeof roomWithPeople }>;

export async function createRoom(hostId: string, input: Record<string, unknown>) {
  const category = GD_CATEGORIES.find((c) => c.id === input.category) ?? GD_CATEGORIES[0];
  const custom = asText(input.topic, 160).replace(/[<>]/g, "");
  const topic = custom || category.topics[0];
  const data = {
    hostId,
    topic,
    category: category.label,
    maxParticipants: clampInt(input.maxParticipants, GD_LIMITS.minParticipants, GD_LIMITS.maxParticipants, GD_LIMITS.defaultParticipants),
    prepS: clampInt(input.prepS, GD_LIMITS.prepS.min, GD_LIMITS.prepS.max, GD_LIMITS.prepS.default),
    discussS: clampInt(input.discussS, GD_LIMITS.discussS.min, GD_LIMITS.discussS.max, GD_LIMITS.discussS.default),
  };
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const room = await prisma.gdRoom.create({ data: { ...data, code: `ML-GD-${randomCode(4)}`, participants: { create: { userId: hostId, peerId: randomBytes(8).toString("hex") } } } });
      return room.code;
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    }
  }
  throw new GdError(503, "Could not create a room right now. Please try again.");
}

async function loadRoom(code: string) {
  const room = await prisma.gdRoom.findUnique({ where: { code }, include: roomWithPeople });
  if (!room) throw new GdError(404, "No discussion found with that room code. Check the code and try again.");
  if (room.status === "LOBBY" && Date.now() - room.createdAt.getTime() > LOBBY_EXPIRY_MS) {
    await prisma.gdRoom.updateMany({ where: { id: room.id, status: "LOBBY" }, data: { status: "CANCELLED" } });
    room.status = "CANCELLED";
  }
  return room;
}

/** Joins (or rejoins) a room. Each join gets a fresh peer id, so a reload or second tab takes over cleanly. */
export async function joinRoom(code: string, userId: string) {
  const room = await loadRoom(code);
  if (room.status === "CANCELLED") throw new GdError(410, "This room has expired or was cancelled by the host.");
  if (room.status === "DONE" || room.status === "JUDGING") throw new GdError(410, "This discussion has already ended.");
  const mine = room.participants.find((p) => p.userId === userId);
  const peerId = randomBytes(8).toString("hex");
  if (mine) {
    await prisma.gdParticipant.update({ where: { id: mine.id }, data: { peerId, leftAt: null, lastSeenAt: new Date() } });
    return { peerId, roomId: room.id };
  }
  if (room.status !== "LOBBY") throw new GdError(409, "This discussion has already started, so new participants cannot join.");
  const active = room.participants.filter((p) => !p.leftAt).length;
  if (active >= room.maxParticipants) throw new GdError(409, `This room is full (${room.maxParticipants} participants).`);
  try {
    await prisma.gdParticipant.create({ data: { roomId: room.id, userId, peerId } });
  } catch (e) {
    if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")) throw e;
    await prisma.gdParticipant.update({ where: { roomId_userId: { roomId: room.id, userId } }, data: { peerId, leftAt: null } });
  }
  return { peerId, roomId: room.id };
}

function publicRoom(room: RoomFull): GdPublicRoom {
  return {
    code: room.code, topic: room.topic, category: room.category, status: room.status, hostId: room.hostId,
    maxParticipants: room.maxParticipants, prepS: room.prepS, discussS: room.discussS,
    prepAt: room.prepAt?.getTime() ?? null, liveAt: room.liveAt?.getTime() ?? null, endsAt: room.endsAt?.getTime() ?? null,
  };
}

function publicPeople(room: RoomFull, now: number): GdPublicParticipant[] {
  return room.participants.map((p) => ({
    userId: p.userId, name: p.user.name, avatarColor: p.user.avatarColor, avatarUrl: p.user.avatarUrl, peerId: p.peerId, muted: p.muted,
    online: !p.leftAt && now - p.lastSeenAt.getTime() < GD_ONLINE_MS, left: Boolean(p.leftAt),
  }));
}

const lastBeat = new Map<string, number>();

/** One poll: room state, people, and WebRTC signals addressed to this tab. Signals up to `after` are acknowledged. */
export async function syncRoom(code: string, userId: string, peerId: string, after: number): Promise<GdSync> {
  const room = await loadRoom(code);
  const me = room.participants.find((p) => p.userId === userId);
  if (!me || me.leftAt) throw new GdError(403, "You are not in this room. Join it with the room code.");
  if (me.peerId !== peerId) throw new GdError(409, "You opened this discussion in another tab or device. Continue there, or rejoin here.");
  const now = Date.now();

  const writes: Promise<unknown>[] = [];
  if (now - (lastBeat.get(me.id) ?? 0) > HEARTBEAT_EVERY_MS) {
    lastBeat.set(me.id, now);
    me.lastSeenAt = new Date(now);
    writes.push(prisma.gdParticipant.update({ where: { id: me.id }, data: { lastSeenAt: me.lastSeenAt } }));
    if (lastBeat.size > 5000) lastBeat.clear();
  }
  if (after > 0) writes.push(prisma.gdSignal.deleteMany({ where: { roomId: room.id, toPeer: peerId, id: { lte: after } } }));
  if (room.status === "LIVE" && room.endsAt && now >= room.endsAt.getTime()) {
    writes.push(prisma.gdRoom.updateMany({ where: { id: room.id, status: "LIVE" }, data: { status: "EVALUATING" } }));
    room.status = "EVALUATING";
  }
  if (Math.random() < 0.01) writes.push(prisma.gdSignal.deleteMany({ where: { createdAt: { lt: new Date(now - 10 * 60_000) } } }));

  const [signals] = await Promise.all([
    prisma.gdSignal.findMany({ where: { roomId: room.id, toPeer: peerId, id: { gt: after } }, orderBy: { id: "asc" }, take: 50, select: { id: true, fromPeer: true, kind: true, payload: true } }),
    ...writes,
  ]);
  return {
    room: publicRoom(room),
    participants: publicPeople(room, now),
    signals: signals.map((s) => ({ id: s.id, from: s.fromPeer, kind: s.kind, payload: s.payload })),
    serverNow: now,
    me: { userId, isHost: room.hostId === userId },
  };
}

export async function postSignal(code: string, userId: string, fromPeer: string, toPeer: string, kind: string, payload: unknown) {
  if (!["offer", "answer", "bye"].includes(kind)) throw new GdError(400, "Invalid signal.");
  const room = await prisma.gdRoom.findUnique({ where: { code }, select: { id: true, status: true, participants: { select: { userId: true, peerId: true, leftAt: true } } } });
  if (!room) throw new GdError(404, "Room not found.");
  const sender = room.participants.find((p) => p.userId === userId && p.peerId === fromPeer && !p.leftAt);
  if (!sender || !room.participants.some((p) => p.peerId === toPeer && !p.leftAt)) throw new GdError(403, "Not allowed.");
  await prisma.gdSignal.create({ data: { roomId: room.id, fromPeer, toPeer, kind, payload: toJson(payload) } });
}

/** Host controls and participant actions. Every transition is a conditional update, so double clicks are harmless. */
export async function controlRoom(code: string, userId: string, action: string, value?: unknown) {
  const room = await loadRoom(code);
  const me = room.participants.find((p) => p.userId === userId && !p.leftAt);
  if (!me) throw new GdError(403, "You are not in this room.");
  const now = Date.now();
  const isHost = room.hostId === userId;
  const others = room.participants.filter((p) => !p.leftAt && p.userId !== userId);

  switch (action) {
    case "start": {
      if (!isHost) throw new GdError(403, "Only the host can start the discussion.");
      if (room.status !== "LOBBY") return;
      const online = room.participants.filter((p) => !p.leftAt && now - p.lastSeenAt.getTime() < GD_ONLINE_MS).length;
      if (online < GD_LIMITS.minParticipants) throw new GdError(409, `At least ${GD_LIMITS.minParticipants} participants must be in the room to start.`);
      const liveAt = new Date(now + room.prepS * 1000);
      await prisma.gdRoom.updateMany({ where: { id: room.id, status: "LOBBY" }, data: { status: "LIVE", prepAt: new Date(now), liveAt, endsAt: new Date(liveAt.getTime() + room.discussS * 1000) } });
      return;
    }
    case "end": {
      if (!isHost) throw new GdError(403, "Only the host can end the discussion.");
      if (room.status !== "LIVE") return;
      const live = room.liveAt && now >= room.liveAt.getTime();
      // Ending during preparation cancels: there is nothing to evaluate.
      await prisma.gdRoom.updateMany({ where: { id: room.id, status: "LIVE" }, data: live ? { status: "EVALUATING", endsAt: new Date(now) } : { status: "CANCELLED", endedAt: new Date(now) } });
      return;
    }
    case "cancel": {
      if (!isHost) throw new GdError(403, "Only the host can cancel the room.");
      await prisma.gdRoom.updateMany({ where: { id: room.id, status: "LOBBY" }, data: { status: "CANCELLED", endedAt: new Date(now) } });
      return;
    }
    case "mute": {
      await prisma.gdParticipant.update({ where: { id: me.id }, data: { muted: value === true } });
      return;
    }
    case "leave": {
      await prisma.gdParticipant.update({ where: { id: me.id }, data: { leftAt: new Date(now) } });
      if (isHost) {
        const next = others.sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime())[0];
        if (next) await prisma.gdRoom.update({ where: { id: room.id }, data: { hostId: next.userId } });
        else if (room.status === "LOBBY") await prisma.gdRoom.update({ where: { id: room.id }, data: { status: "CANCELLED", endedAt: new Date(now) } });
      }
      // The last person leaving a live discussion ends it, so it can still be evaluated.
      if (!others.length && room.status === "LIVE" && room.liveAt && now >= room.liveAt.getTime()) {
        await prisma.gdRoom.updateMany({ where: { id: room.id, status: "LIVE" }, data: { status: "EVALUATING", endsAt: new Date(now) } });
      }
      return;
    }
    default:
      throw new GdError(400, "Unknown action.");
  }
}

// ───────────── speech segments ─────────────

const SEGMENT_SCHEMA = S.obj({
  heardSpeech: S.bool("false when the audio has no intelligible human speech"),
  transcript: S.str("verbatim transcript"),
  grammar: S.arr(S.obj({ said: S.str(), better: S.str() }), "real spoken grammar mistakes (max 2)"),
  delivery: S.str("one short note on pronunciation/fluency, or empty"),
});

type SegmentNotes = { grammar: { said: string; better: string }[]; delivery: string };

/** One transcription call for one segment. */
async function transcribe(topic: string, base64: string) {
  const { data } = await generateJson({
    kind: "gd_segment",
    system: `You transcribe one participant's turn in a spoken group discussion on "${topic}". ${NO_HALLUCINATION}`,
    parts: [{ text: "Participant's speech:" }, { inlineData: { mimeType: "audio/wav", data: base64 } }],
    schema: SEGMENT_SCHEMA,
    parse: (raw) => {
      const r = asRecord(raw);
      if (typeof r.heardSpeech !== "boolean") return null;
      return { heardSpeech: r.heardSpeech, transcript: asText(r.transcript, 4000), grammar: asObjects(r.grammar, 2).map((g) => ({ said: asText(g.said, 200), better: asText(g.better, 200) })).filter((g) => g.said && g.better), delivery: asText(r.delivery, 200) };
    },
    timeoutMs: 40_000,
    maxOutputTokens: 1500,
  });
  return { transcript: data.heardSpeech ? data.transcript : "", notes: { grammar: data.grammar, delivery: data.delivery } satisfies SegmentNotes };
}

/**
 * Stores one stretch of a participant's speech and transcribes it. The audio is kept until the transcript is saved,
 * so a rate-limited or failed call is queued for a retry (before judging) instead of losing what the student said.
 * Duplicate uploads (same seq) are ignored.
 */
export async function addSegment(code: string, userId: string, input: { seq: number; startMs: number; endMs: number }, audio: { base64: string; va: VoiceActivity }) {
  const room = await prisma.gdRoom.findUnique({ where: { code }, select: { id: true, status: true, liveAt: true, endsAt: true, topic: true, participants: { where: { userId }, select: { id: true, leftAt: true } } } });
  if (!room || !room.participants.length) throw new GdError(403, "You are not in this room.");
  const now = Date.now();
  const liveAt = room.liveAt?.getTime() ?? 0;
  const endsAt = room.endsAt?.getTime() ?? 0;
  const accepting = (room.status === "LIVE" || room.status === "EVALUATING") && liveAt && now >= liveAt && now <= endsAt + GD_FLUSH_MAX_MS;
  if (!accepting) throw new GdError(409, "The discussion is not accepting speech right now.");
  if (audio.va.speechMs < 300) return { skipped: true };

  const maxMs = endsAt - liveAt;
  const startMs = clampInt(input.startMs, 0, maxMs, 0);
  const endMs = clampInt(input.endMs, startMs + 200, Math.min(maxMs, startMs + 45_000), startMs + 1000);
  let segmentId: string;
  try {
    const seg = await prisma.gdSegment.create({ data: { roomId: room.id, userId, seq: clampInt(input.seq, 0, 100_000, 0), startMs, endMs, audio: Buffer.from(audio.base64, "base64"), attempts: 1 } });
    segmentId = seg.id;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return { duplicate: true };
    throw e;
  }
  try {
    const t = await transcribe(room.topic, audio.base64);
    await prisma.gdSegment.update({ where: { id: segmentId }, data: { status: "DONE", transcript: t.transcript, notes: toJson(t.notes), audio: null } });
    return { ok: true };
  } catch {
    // Kept for the evaluator to retry; the browser does not need to resend.
    await prisma.gdSegment.update({ where: { id: segmentId }, data: { status: "QUEUED" } });
    return { queued: true };
  }
}

const MAX_SEGMENT_ATTEMPTS = 3;
/** An upload request that died mid-transcription leaves a PENDING row; after this it is retried like a queued one. */
const STALE_PENDING_MS = 90_000;
/** Judging never waits longer than this after the end for queued transcriptions. */
const QUEUE_MAX_MS = 5 * 60_000;

/**
 * Retries queued transcriptions one at a time (sequential, so a rate-limited key is not hammered). Each segment is
 * claimed with a conditional update, so several participants calling evaluate never transcribe the same one twice.
 * Returns true when nothing is left to wait for.
 */
async function drainQueue(roomId: string, topic: string, deadlineMs: number) {
  for (;;) {
    const stale = new Date(Date.now() - STALE_PENDING_MS);
    const next = await prisma.gdSegment.findFirst({ where: { roomId, OR: [{ status: "QUEUED" }, { status: "PENDING", updatedAt: { lt: stale } }] }, orderBy: { startMs: "asc" }, select: { id: true, attempts: true, status: true, updatedAt: true } });
    if (!next) return true;
    if (Date.now() + 45_000 > deadlineMs) return false;
    const claimed = await prisma.gdSegment.updateMany({ where: { id: next.id, status: next.status, updatedAt: next.updatedAt }, data: { status: "PENDING", attempts: { increment: 1 } } });
    if (!claimed.count) continue;
    const seg = await prisma.gdSegment.findUnique({ where: { id: next.id }, select: { audio: true, attempts: true } });
    if (!seg?.audio) { await prisma.gdSegment.update({ where: { id: next.id }, data: { status: "DROPPED" } }); continue; }
    try {
      const t = await transcribe(topic, Buffer.from(seg.audio).toString("base64"));
      await prisma.gdSegment.update({ where: { id: next.id }, data: { status: "DONE", transcript: t.transcript, notes: toJson(t.notes), audio: null } });
    } catch (e) {
      const giveUp = seg.attempts >= MAX_SEGMENT_ATTEMPTS;
      await prisma.gdSegment.update({ where: { id: next.id }, data: giveUp ? { status: "DROPPED", audio: null } : { status: "QUEUED" } });
      if (e instanceof AiError && e.kind === "rate_limited") await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

// ───────────── evaluation ─────────────

type SpeakerStats = { userId: string; label: string; name: string; speakingMs: number; turns: number; avgTurnMs: number; longestTurnMs: number; interruptions: number; questions: number; words: number };

/** Turns, speaking time and interruptions measured from segment timestamps (server clock). */
function measure(segments: { userId: string; startMs: number; endMs: number; transcript: string | null }[], people: { userId: string; name: string }[]): SpeakerStats[] {
  return people.map((p, i) => {
    // Timing counts every segment (speech was measured even if its transcription was given up).
    const mine = segments.filter((s) => s.userId === p.userId);
    // Consecutive segments less than 2 s apart are one turn.
    let turns = 0, prevEnd = -1e9, current = 0, longest = 0;
    for (const s of mine) {
      if (s.startMs - prevEnd > 2000) { turns++; current = 0; }
      current += s.endMs - s.startMs;
      longest = Math.max(longest, current);
      prevEnd = s.endMs;
    }
    const interruptions = mine.filter((s) => segments.some((o) => o.userId !== p.userId && o.startMs < s.startMs - 800 && o.endMs > s.startMs + 1200)).length;
    const speakingMs = mine.reduce((n, s) => n + (s.endMs - s.startMs), 0);
    const text = mine.map((s) => s.transcript ?? "").join(" ");
    return { userId: p.userId, label: `P${i + 1}`, name: p.name, speakingMs, turns, avgTurnMs: turns ? Math.round(speakingMs / turns) : 0, longestTurnMs: longest, interruptions, questions: (text.match(/\?/g) ?? []).length, words: transcriptMetrics(text, speakingMs).words };
  });
}

const fmtMs = (ms: number) => (ms >= 60_000 ? `${Math.floor(ms / 60_000)}m ${Math.round((ms % 60_000) / 1000)}s` : `${Math.round(ms / 1000)}s`);

const JUDGE_SCHEMA = S.obj({
  participants: S.arr(S.obj({
    id: S.str("the participant label, e.g. P1"),
    scores: S.obj(Object.fromEntries(GD_DIMENSIONS.map((d) => [d.key, S.int()]))),
    summary: S.str("2-3 sentence assessment"),
    strengths: S.arr(S.str(), "2-4 specific strengths with evidence"),
    weaknesses: S.arr(S.str(), "2-4 specific weaknesses with evidence"),
    analysis: S.obj({ communication: S.str(), fluency: S.str(), grammar: S.str(), vocabulary: S.str(), logic: S.str(), teamwork: S.str(), leadership: S.str(), listening: S.str(), professionalism: S.str() }, "one specific sentence each"),
    recommendations: S.arr(S.str(), "3-4 actionable recommendations"),
    improvedSentences: S.arr(S.obj({ said: S.str(), better: S.str(), why: S.str() }), "2-3 of their sentences rewritten better"),
    practicePlan: S.arr(S.str(), "4 steps for the next week"),
  })),
  team: S.obj({
    summary: S.str("3 sentences on the discussion as a whole"),
    performance: S.str(), communication: S.str(), topicCoverage: S.str(), interactionQuality: S.str(), participationBalance: S.str(), overallQuality: S.str(),
    teamScore: S.int(),
  }),
});

export type EvaluateResult = { status: "DONE" | "JUDGING" | "WAITING" | "FAILED"; message?: string };

/**
 * Evaluates the COMPLETE discussion once: waits for every participant's last segments to be transcribed, then makes
 * one judge call over the full speaker-labelled transcript and writes a report for each participant.
 * Any participant's browser may call this; a conditional status update makes sure only one evaluation runs.
 */
export async function evaluateRoom(code: string, userId: string, deadlineMs: number): Promise<EvaluateResult> {
  let room = await loadRoom(code);
  if (!room.participants.some((p) => p.userId === userId)) throw new GdError(403, "You are not in this room.");
  if (room.status === "DONE") return { status: "DONE" };
  const phase = gdPhase(publicRoom(room), Date.now());
  if (phase !== "EVALUATING" && phase !== "JUDGING") throw new GdError(409, "The discussion has not ended yet.");
  if (room.status === "LIVE") await prisma.gdRoom.updateMany({ where: { id: room.id, status: "LIVE" }, data: { status: "EVALUATING" } });
  if (room.status === "JUDGING" && Date.now() - room.updatedAt.getTime() < STALE_JUDGING_MS) return { status: "JUDGING" };

  const endsAt = room.endsAt!.getTime();
  // Wait for final uploads (grace period), then retry any queued transcriptions, bounded by a hard maximum.
  for (;;) {
    const now = Date.now();
    if (now >= endsAt + GD_FLUSH_GRACE_MS) {
      const done = await drainQueue(room.id, room.topic, Math.min(deadlineMs, endsAt + QUEUE_MAX_MS));
      const inFlight = await prisma.gdSegment.count({ where: { roomId: room.id, status: "PENDING", updatedAt: { gte: new Date(Date.now() - STALE_PENDING_MS) } } });
      if ((done && inFlight === 0) || Date.now() >= endsAt + QUEUE_MAX_MS) break;
    }
    if (Date.now() + 2500 > deadlineMs) return { status: "WAITING" };
    await new Promise((r) => setTimeout(r, 2000));
  }
  // Anything still unprocessed after the hard maximum is given up, so judging can start.
  await prisma.gdSegment.updateMany({ where: { roomId: room.id, status: { in: ["QUEUED", "PENDING"] } }, data: { status: "DROPPED", audio: null } });

  const claimed = await prisma.gdRoom.updateMany({
    where: { id: room.id, OR: [{ status: "EVALUATING" }, { status: "LIVE" }, { status: "JUDGING", updatedAt: { lt: new Date(Date.now() - STALE_JUDGING_MS) } }] },
    data: { status: "JUDGING" },
  });
  if (!claimed.count) return { status: "JUDGING" };
  room = await loadRoom(code);

  try {
    const segments = await prisma.gdSegment.findMany({ where: { roomId: room.id, status: { in: ["DONE", "DROPPED"] } }, orderBy: { startMs: "asc" }, select: { userId: true, startMs: true, endMs: true, transcript: true, notes: true, status: true } });
    // Everyone who was in the room once it went live (people who left the lobby earlier get no report).
    const seated = room.participants.filter((p) => !p.leftAt || (room.liveAt && p.leftAt > room.liveAt));
    const people = seated.map((p) => ({ userId: p.userId, name: p.user.name }));
    const stats = measure(segments, people);
    const speakers = stats.filter((s) => s.words >= 15);
    const durationS = Math.round((endsAt - (room.liveAt?.getTime() ?? endsAt)) / 1000);
    const labelOf = new Map(stats.map((s) => [s.userId, s]));

    let judged: Record<string, unknown> | null = null;
    if (speakers.length) {
      let transcript = segments.filter((s) => s.transcript).map((s) => `[${fmtMs(s.startMs)}] ${labelOf.get(s.userId)?.label} (${labelOf.get(s.userId)?.name.split(" ")[0]}): ${s.transcript}`).join("\n");
      if (transcript.length > 60_000) transcript = segments.filter((s) => s.transcript).map((s) => `[${fmtMs(s.startMs)}] ${labelOf.get(s.userId)?.label}: ${s.transcript!.slice(0, 350)}`).join("\n").slice(0, 60_000);
      const metricsText = stats.map((s) => `${s.label} ${s.name}: speaking ${fmtMs(s.speakingMs)}, ${s.turns} turns, avg turn ${fmtMs(s.avgTurnMs)}, longest ${fmtMs(s.longestTurnMs)}, ${s.interruptions} interruptions, ${s.questions} questions, ${s.words} words`).join("\n");
      const slips = segments.flatMap((s) => (asRecord(s.notes).grammar as { said: string; better: string }[] | undefined ?? []).map((g) => `${labelOf.get(s.userId)?.label}: "${g.said}" -> "${g.better}"`)).slice(0, 40).join("\n");
      const { data } = await generateJson({
        kind: "gd_judge",
        system: `You are the AI judge of a company recruitment group discussion. Topic: "${room.topic}". Duration ${Math.round(durationS / 60)} minutes.
Evaluate the COMPLETE discussion for each participant who spoke (${speakers.map((s) => s.label).join(", ")}). Judge content and behaviour across the whole discussion, never from a single sentence.
Quality over quantity: someone who spoke briefly with highly relevant, well-reasoned points can outscore someone who spoke at length. Do not punish speaking less by itself; consider context (did they get space? did they build on others?).
Leadership = initiating, structuring, summarising, inviting quieter members. Teamwork/listening = building on and referring to others' points, disagreeing respectfully. Professional behaviour drops for interruptions and dismissive language.
${RUBRIC}`,
        parts: [{ text: `Measured participation:\n${metricsText}\n\nGrammar slips noted during transcription:\n${slips || "none"}\n\nTranscript (time from start, speaker):\n${transcript}` }],
        schema: JUDGE_SCHEMA,
        parse: (v) => { const r = asRecord(v); return Array.isArray(r.participants) ? r : null; },
        timeoutMs: Math.max(20_000, Math.min(90_000, deadlineMs - Date.now() - 5_000)),
        thinking: 2048,
        maxOutputTokens: 12_000,
      });
      judged = data;
    }

    const team = asRecord(judged?.team);
    const judgedById = new Map(asObjects(judged?.participants, 10).map((p) => [asText(p.id, 8), p]));
    const teamTable = { kind: "table" as const, title: "Participation", columns: ["Participant", "Speaking time", "Turns", "Avg turn", "Interruptions"], rows: stats.map((s) => [s.name, fmtMs(s.speakingMs), s.turns, fmtMs(s.avgTurnMs), s.interruptions]) };
    const teamSections = judged
      ? [
          { kind: "text" as const, title: "Discussion overview", text: asText(team.summary, 900) },
          { kind: "table" as const, title: "Team evaluation", columns: ["Area", "Assessment"], rows: [["Team performance", asText(team.performance, 400)], ["Team communication", asText(team.communication, 400)], ["Topic coverage", asText(team.topicCoverage, 400)], ["Interaction quality", asText(team.interactionQuality, 400)], ["Participation balance", asText(team.participationBalance, 400)], ["Overall discussion quality", asText(team.overallQuality, 400)]] },
          teamTable,
        ]
      : [teamTable];

    const reportNos: string[] = [];
    const writes = seated.map((p) => {
      const s = labelOf.get(p.userId)!;
      const j = judgedById.get(s.label);
      const stats4 = [
        { label: "Speaking time", value: fmtMs(s.speakingMs) }, { label: "Turns", value: String(s.turns) }, { label: "Average turn", value: fmtMs(s.avgTurnMs) },
        { label: "Longest turn", value: fmtMs(s.longestTurnMs) }, { label: "Interruptions", value: String(s.interruptions) }, { label: "Questions asked", value: String(s.questions) },
      ];
      let report: PracticeReport;
      let scores: Record<string, number> | null = null;
      let overall: number | null = null;
      if (j) {
        const sc = asRecord(j.scores);
        scores = Object.fromEntries(GD_DIMENSIONS.map((d) => [d.key, clampScore(sc[d.key], 50)]));
        const w: Record<string, number> = { communication: 1.5, logic: 1.5, knowledge: 1.5 };
        overall = Math.round(GD_DIMENSIONS.reduce((n, d) => n + scores![d.key] * (w[d.key] ?? 1), 0) / GD_DIMENSIONS.reduce((n, d) => n + (w[d.key] ?? 1), 0));
        const a = asRecord(j.analysis);
        report = {
          version: 1, module: "GD", title: "Group Discussion", subtitle: room.topic, overall, level: band(overall),
          dimensions: GD_DIMENSIONS.map((d) => ({ key: d.key, label: d.label, score: scores![d.key] })),
          stats: stats4, summary: asText(j.summary, 900),
          sections: [
            { kind: "list", title: "Strengths", items: asList(j.strengths, 4), tone: "good" },
            { kind: "list", title: "Weaknesses", items: asList(j.weaknesses, 4), tone: "warn" },
            { kind: "table", title: "Detailed analysis", columns: ["Area", "Score", "Analysis"], rows: ([["Communication", "communication"], ["Fluency", "fluency"], ["Grammar", "grammar"], ["Vocabulary", "vocabulary"], ["Logical thinking", "logic"], ["Teamwork", "teamwork"], ["Leadership", "leadership"], ["Listening", "listening"], ["Professionalism", "professionalism"]] as const).map(([label, k]) => [label, scores![k], asText(a[k], 400)]) },
            { kind: "list", title: "Recommendations", items: asList(j.recommendations, 4) },
            { kind: "pairs", title: "Sample improved sentences", pairs: asObjects(j.improvedSentences, 3).map((x) => ({ said: asText(x.said, 300), better: asText(x.better, 300), why: asText(x.why, 200) })).filter((x) => x.said && x.better) },
            { kind: "list", title: "Practice plan", items: asList(j.practicePlan, 4), tone: "plan" },
            ...teamSections,
          ],
          aiSummary: true,
        };
      } else {
        const untranscribed = segments.some((x) => x.userId === p.userId && x.status === "DROPPED");
        report = {
          version: 1, module: "GD", title: "Group Discussion", subtitle: room.topic, overall: 0, unscored: true,
          level: untranscribed && !s.words ? "Evaluation unavailable" : "Not enough speech to evaluate",
          dimensions: [], stats: stats4,
          summary: untranscribed && !s.words
            ? "Your speech was recorded, but the AI service was unavailable and could not transcribe it, so this discussion could not be scored. Your participation time is shown below. Please try another discussion later."
            : s.words
              ? "You spoke too little for a fair evaluation. In a real GD, aim to make at least 3-4 relevant points: open with a view, support it with an example, and respond to others."
              : "We did not receive any speech from you during this discussion (microphone muted, permission denied, or connection issues).",
          sections: [{ kind: "list", title: "Next time", items: ["Check your microphone before the discussion starts.", "Enter the discussion early with a clear opening point.", "Build on others: 'Adding to what Priya said…'"], tone: "plan" }, ...teamSections],
          aiSummary: Boolean(judged),
        };
      }
      const reportNo = newReportNo();
      reportNos.push(reportNo);
      return prisma.practiceSession.create({
        data: { userId: p.userId, module: "GD", mode: "gd", title: "Group Discussion", status: "COMPLETED", score: overall, scores: scores ? toJson(scores) : undefined, report: toJson(report), reportNo, gdRoomId: room.id, durationS, startedAt: room.liveAt ?? new Date(), endedAt: new Date(endsAt), config: toJson({ topic: room.topic, code: room.code, participants: people.map((x) => x.name) }) },
      });
    });
    const teamScore = judged ? clampScore(team.teamScore, mean(speakers.map((s) => clampScore(asRecord(judgedById.get(s.label)?.scores).communication, 50)))) : null;
    await prisma.$transaction([
      ...writes,
      prisma.gdRoom.update({ where: { id: room.id }, data: { status: "DONE", endedAt: new Date(), report: toJson({ teamScore, team: judged ? team : null, stats }) } }),
    ]);
    return { status: "DONE" };
  } catch (e) {
    console.error("GD evaluation failed", room.code, e instanceof Error ? e.message : e);
    await prisma.gdRoom.updateMany({ where: { id: room.id, status: "JUDGING" }, data: { status: "EVALUATING" } });
    return { status: "FAILED", message: "The AI judge could not finish the evaluation. Your discussion is saved — tap Retry evaluation." };
  }
}
