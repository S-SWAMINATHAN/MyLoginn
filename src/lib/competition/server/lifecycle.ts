import "server-only";
import { z } from "zod";
import type { Competition, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { LANGUAGE_KEYS, type CompetitionLanguage } from "../languages";
import { DEFAULT_POLICY, parsePolicy } from "../policy";
import { canTransition, nextAutomaticStatus, scheduleProblems } from "../state";
import { parseBlueprint, STATUS_LABEL, type CompetitionStatus } from "../types";
import { finalizeAttempt, queueEvaluations, sweepExpiredAttempts } from "./attempts";
import { audit, auditNow } from "./audit";
import { analyzeCompetitionBank } from "./bank";
import { notifyUsers } from "./competitions";
import { ApiError, isUniqueViolation } from "./http";
import { analyzeIntegrity } from "./integrity";
import { cleanupRunJobs, requeueStaleJobs } from "./judge";
import { cleanupRateLimits } from "./rateLimit";
import { computeResults, pendingEvaluations, publishResults } from "./results";
import { expireOffers } from "./rewards";

const iso = z.string().datetime({ offset: true });
export const competitionSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{2,60}$/, "Slug: lowercase letters, digits and hyphens"),
  title: z.string().trim().min(5).max(140),
  description: z.string().trim().max(8000).default(""),
  eligibility: z.string().trim().max(4000).default(""),
  rules: z.string().trim().max(20_000).default(""),
  timezone: z.string().refine((tz) => { try { new Intl.DateTimeFormat("en", { timeZone: tz }); return true; } catch { return false; } }, "Unknown time zone").default("Asia/Kolkata"),
  registrationOpensAt: iso,
  registrationClosesAt: iso,
  startsAt: iso,
  endsAt: iso,
  durationMinutes: z.number().int(),
  lateJoinMinutes: z.number().int().default(15),
  resultsPublishAt: iso,
  maxParticipants: z.number().int().min(1).max(100_000),
  languages: z.array(z.enum(LANGUAGE_KEYS as [CompetitionLanguage, ...CompetitionLanguage[]])).min(1),
  blueprint: z.array(z.object({ difficulty: z.enum(["EASY", "MEDIUM", "HARD"]), count: z.number().int().min(1).max(10), marks: z.number().positive().max(1000) })).min(1).max(6),
  negativeMarkPerWrong: z.number().min(0).max(100).default(0),
  timeBalanceTolerance: z.number().min(0.05).max(0.5).default(0.15),
  violationPolicy: z.record(z.string(), z.number()).default({}),
  screenShareRequired: z.boolean().default(true),
  fullscreenRequired: z.boolean().default(true),
  tieBreakBySubmitTime: z.boolean().default(true),
  autosaveCountsAsSubmission: z.boolean().default(true),
  certificateMinPercent: z.number().min(0).max(100).default(0),
  candidatePrefix: z.string().trim().toUpperCase().regex(/^[A-Z]{2,5}$/).default("MLC"),
});
export type CompetitionInput = z.infer<typeof competitionSchema>;

/** Fields candidates registered on. Locked from REGISTRATION_OPEN onwards. */
const LOCKED_AFTER_OPEN: (keyof CompetitionInput)[] = ["languages", "blueprint", "durationMinutes", "lateJoinMinutes", "negativeMarkPerWrong", "violationPolicy", "screenShareRequired", "fullscreenRequired", "tieBreakBySubmitTime", "autosaveCountsAsSubmission", "certificateMinPercent", "maxParticipants", "candidatePrefix", "slug", "timeBalanceTolerance"];

function toData(input: CompetitionInput) {
  const data = {
    ...input,
    registrationOpensAt: new Date(input.registrationOpensAt),
    registrationClosesAt: new Date(input.registrationClosesAt),
    startsAt: new Date(input.startsAt),
    endsAt: new Date(input.endsAt),
    resultsPublishAt: new Date(input.resultsPublishAt),
    violationPolicy: parsePolicy({ ...DEFAULT_POLICY, ...input.violationPolicy }),
  };
  const problems = scheduleProblems(data);
  if (problems.length) throw new ApiError(400, problems.join(" "));
  return data;
}

export async function createCompetition(input: CompetitionInput, actorId: string) {
  const data = toData(input);
  try {
    return await prisma.$transaction(async (tx) => {
      const c = await tx.competition.create({ data });
      await audit(tx, { competitionId: c.id, actorId, action: "competition.create", entity: "Competition", entityId: c.id });
      return c;
    });
  } catch (e) {
    if (isUniqueViolation(e, "slug")) throw new ApiError(409, "That slug is already used.");
    throw e;
  }
}

export async function updateCompetition(id: string, input: CompetitionInput, actorId: string) {
  const current = await prisma.competition.findUnique({ where: { id } });
  if (!current) throw new ApiError(404, "Competition not found.");
  const status = current.status as CompetitionStatus;
  if (["LIVE", "SUBMISSION_CLOSED", "EVALUATION", "UNDER_REVIEW", "RESULTS_PUBLISHED", "ARCHIVED"].includes(status)) throw new ApiError(409, `A competition that is ${STATUS_LABEL[status].toLowerCase()} cannot be edited. Use postpone for the results time.`);
  const data = toData(input);
  if (status !== "DRAFT") {
    const before = current as unknown as Record<string, unknown>;
    const changed = LOCKED_AFTER_OPEN.filter((k) => JSON.stringify(normalise(before[k])) !== JSON.stringify(normalise((data as Record<string, unknown>)[k])));
    if (changed.length) throw new ApiError(409, `These rules are locked once registration opens: ${changed.join(", ")}.`);
    if (data.startsAt.getTime() !== current.startsAt.getTime() && data.startsAt.getTime() < Date.now() + 3600_000) throw new ApiError(400, "A rescheduled start must be at least an hour away.");
  }
  const updated = await prisma.$transaction(async (tx) => {
    const c = await tx.competition.update({ where: { id }, data });
    await audit(tx, { competitionId: id, actorId, action: "competition.update", entity: "Competition", entityId: id, meta: { startsAt: [current.startsAt.toISOString(), c.startsAt.toISOString()] } });
    return c;
  });
  if (status !== "DRAFT" && updated.startsAt.getTime() !== current.startsAt.getTime()) {
    const regs = await prisma.ccRegistration.findMany({ where: { competitionId: id }, select: { userId: true } });
    const when = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: updated.timezone, timeZoneName: "short" }).format(updated.startsAt);
    await notifyUsers(regs.map((r) => r.userId), `${updated.title} has been rescheduled`, `The competition now starts on ${when}.`);
  }
  return updated;
}
/** Comparable form: dates as ISO strings, object keys sorted (jsonb does not keep key order). */
const normalise = (v: unknown): unknown =>
  v instanceof Date
    ? v.toISOString()
    : Array.isArray(v)
      ? v.map(normalise)
      : v && typeof v === "object"
        ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, normalise((v as Record<string, unknown>)[k])]))
        : v;

/** Preconditions for opening registration, as messages. */
export async function openRegistrationBlockers(c: Competition) {
  const out = scheduleProblems(c);
  const reward = await prisma.ccInternshipReward.findUnique({ where: { competitionId: c.id } });
  if (!reward) out.push("Configure the first-place internship reward (role, stipend, duration) before registration opens.");
  if (!parseBlueprint(c.blueprint).length) out.push("Define the question blueprint.");
  if (c.registrationClosesAt <= new Date()) out.push("The registration close time is in the past.");
  const bank = await analyzeCompetitionBank(c);
  out.push(...bank.errors);
  return { blockers: out, warnings: bank.warnings };
}

export async function transition(competitionId: string, to: CompetitionStatus, actorId: string, acknowledgeWarnings = false) {
  const c = await prisma.competition.findUnique({ where: { id: competitionId } });
  if (!c) throw new ApiError(404, "Competition not found.");
  const from = c.status as CompetitionStatus;
  if (!canTransition(from, to)) throw new ApiError(409, `Cannot move from ${STATUS_LABEL[from]} to ${STATUS_LABEL[to]}.`);
  if (to === "REGISTRATION_OPEN") {
    if (from === "DRAFT") {
      const { blockers, warnings } = await openRegistrationBlockers(c);
      if (blockers.length) throw new ApiError(409, blockers.join(" "));
      if (warnings.length && !acknowledgeWarnings) throw new ApiError(409, `Question-bank warnings: ${warnings.join(" ")}`, "NEEDS_ACK");
    } else if (c.registrationClosesAt <= new Date()) throw new ApiError(409, "Move the registration close time forward before reopening.");
  }
  if (to === "SCHEDULED") {
    const [regs, assigned] = await Promise.all([prisma.ccRegistration.count({ where: { competitionId } }), prisma.ccAssignment.count({ where: { competitionId } })]);
    if (!c.assignmentsGeneratedAt || assigned < regs) throw new ApiError(409, `Generate question assignments first (${assigned}/${regs} candidates assigned).`);
    if (c.startsAt <= new Date()) throw new ApiError(409, "The start time has passed. Reschedule before scheduling.");
  }
  const moved = await prisma.$transaction(async (tx) => {
    const r = await tx.competition.updateMany({ where: { id: competitionId, status: from }, data: { status: to, statusChangedAt: new Date() } });
    if (r.count) await audit(tx, { competitionId, actorId, action: "competition.transition", entity: "Competition", entityId: competitionId, meta: { from, to, acknowledgeWarnings } });
    return r.count > 0;
  });
  if (!moved) throw new ApiError(409, "The competition changed state meanwhile. Reload and try again.");
  if (to === "SUBMISSION_CLOSED") await finalizeAllActive(competitionId, "ADMIN");
  return advance(competitionId);
}

async function finalizeAllActive(competitionId: string, reason: "ADMIN" | "TIME_EXPIRED") {
  const active = await prisma.ccAttempt.findMany({ where: { competitionId, status: "ACTIVE" }, select: { id: true } });
  for (const a of active) await finalizeAttempt(a.id, reason);
  return active.length;
}

/**
 * Applies every automatic transition that is due (clock or completed work), with its side effects:
 *   → SUBMISSION_CLOSED: closes any attempt still open (their deadlines have passed by definition)
 *   → UNDER_REVIEW: computes results and the integrity analysis
 *   → RESULTS_PUBLISHED: publishes the approved snapshot (results.ts)
 * Each step is a conditional update, so concurrent ticks cannot apply one twice.
 */
export async function advance(competitionId: string) {
  for (let i = 0; i < 8; i++) {
    const c = await prisma.competition.findUnique({ where: { id: competitionId } });
    if (!c) return null;
    const status = c.status as CompetitionStatus;
    const facts = {
      now: new Date(),
      activeAttempts: status === "SUBMISSION_CLOSED" ? await prisma.ccAttempt.count({ where: { competitionId, status: "ACTIVE" } }) : 0,
      pendingEvaluations: status === "EVALUATION" ? await pendingEvaluations(competitionId, c.evaluationVersion) : 0,
      resultsApproved: !!c.resultsApprovedAt,
    };
    if (status === "SUBMISSION_CLOSED" && facts.activeAttempts) {
      await finalizeAllActive(competitionId, "TIME_EXPIRED");
      continue;
    }
    const next = nextAutomaticStatus(status, c, facts);
    if (!next) return c;
    if (next === "RESULTS_PUBLISHED") {
      await publishResults(competitionId, "system");
      continue;
    }
    const moved = await prisma.competition.updateMany({ where: { id: competitionId, status }, data: { status: next, statusChangedAt: new Date() } });
    if (!moved.count) continue;
    await auditNow({ competitionId, actorId: "system", action: "competition.auto", entity: "Competition", entityId: competitionId, meta: { from: status, to: next } });
    if (next === "UNDER_REVIEW") {
      await computeResults(competitionId);
      await analyzeIntegrity(competitionId);
    }
  }
  return prisma.competition.findUnique({ where: { id: competitionId } });
}

/** Re-runs evaluation of every finalized attempt under a new version (before publication only). */
export async function reevaluate(competitionId: string, actorId: string, reason: string) {
  if (reason.trim().length < 10) throw new ApiError(400, "Give a reason for re-evaluation.");
  const c = await prisma.competition.findUniqueOrThrow({ where: { id: competitionId } });
  if (!["EVALUATION", "UNDER_REVIEW"].includes(c.status)) throw new ApiError(409, "Re-evaluation is only possible before results are published.");
  const version = c.evaluationVersion + 1;
  await prisma.$transaction(async (tx) => {
    await tx.competition.update({ where: { id: competitionId }, data: { evaluationVersion: version, status: "EVALUATION", statusChangedAt: new Date(), resultsApprovedAt: null, resultsApprovedById: null } });
    await audit(tx, { competitionId, actorId, action: "evaluation.reevaluate", entity: "Competition", entityId: competitionId, meta: { version, reason } });
  });
  const attempts = await prisma.ccAttempt.findMany({ where: { competitionId, status: "FINALIZED" } });
  for (const a of attempts) await prisma.$transaction((tx: Prisma.TransactionClient) => queueEvaluations(tx, a, { ...c, evaluationVersion: version }, version), { timeout: 30_000 });
  return { version, attempts: attempts.length };
}

/** Periodic work. Driven by the judge workers (every ~15 s) and optionally an external cron. Safe to overlap. */
export async function tick() {
  const started = Date.now();
  const competitions = await prisma.competition.findMany({ where: { status: { in: ["REGISTRATION_OPEN", "SCHEDULED", "LIVE", "SUBMISSION_CLOSED", "EVALUATION", "UNDER_REVIEW"] } }, select: { id: true } });
  const out: Record<string, unknown> = {};
  out.finalized = await sweepExpiredAttempts();
  for (const c of competitions) {
    try {
      const after = await advance(c.id);
      out[c.id] = after?.status;
    } catch (error) {
      console.error("[coding-competition] tick advance failed", c.id, error);
    }
  }
  out.requeued = await requeueStaleJobs();
  out.expiredOffers = await expireOffers();
  if (Math.random() < 0.05) {
    await cleanupRateLimits();
    await cleanupRunJobs();
  }
  out.ms = Date.now() - started;
  return out;
}
