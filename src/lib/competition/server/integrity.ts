import "server-only";
import type { CcAttempt, Competition, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isMyBuddyConfigured, streamMyBuddyReply } from "@/lib/mybuddy";
import { COMPETITION_LANGUAGES, isLanguage } from "../languages";
import { EMPTY_COUNTS, decide, isEventType, monitoringRisk, parsePolicy, type EventCounts } from "../policy";
import { analyzeQuestion } from "../similarity";
import { ApiError } from "./http";
import { limit } from "./rateLimit";

/** Counts so far, rebuilt from the stored (server-written) events. */
async function countsFor(attemptId: string): Promise<EventCounts> {
  const rows = await prisma.ccIntegrityEvent.groupBy({ by: ["type"], where: { attemptId, action: { not: "NONE" } }, _count: { _all: true } });
  const n = (t: string[]) => rows.filter((r) => t.includes(r.type)).reduce((s, r) => s + r._count._all, 0);
  const resumes = await prisma.ccIntegrityEvent.count({ where: { attemptId, type: "ATTEMPT_RESUMED" } });
  return { focusLosses: n(["TAB_HIDDEN", "WINDOW_BLUR"]), fullscreenExits: n(["FULLSCREEN_EXIT"]), shareStops: n(["SCREEN_SHARE_ENDED"]), largePastes: n(["LARGE_PASTE"]), resumes };
}

type IncomingEvent = { type?: unknown; clientAt?: unknown; durationMs?: unknown; chars?: unknown; displaySurface?: unknown };

/**
 * Records a batch of browser events with server timestamps and applies the published policy. Client-reported
 * values are stored as claims; only durations can soften an event (shorter absence → ignored).
 */
export async function recordEvents(c: Competition, attempt: CcAttempt, events: unknown) {
  if (!Array.isArray(events) || events.length === 0 || events.length > 25) throw new ApiError(400, "Invalid events.");
  if (attempt.status !== "ACTIVE") return { recorded: 0, paused: false, warnings: 0, flagged: false };
  await limit(`cc:events:${attempt.id}`, 120, 60);
  const policy = parsePolicy(c.violationPolicy);
  let counts = await countsFor(attempt.id);
  let paused = attempt.paused;
  let flagged = false;
  const rows: Prisma.CcIntegrityEventCreateManyInput[] = [];
  for (const raw of events as IncomingEvent[]) {
    if (!isEventType(raw?.type)) continue;
    const durationMs = Number.isFinite(Number(raw.durationMs)) ? Math.max(0, Math.min(86_400_000, Number(raw.durationMs))) : undefined;
    const chars = Number.isFinite(Number(raw.chars)) ? Math.max(0, Math.min(1_000_000, Number(raw.chars))) : undefined;
    const clientAt = typeof raw.clientAt === "string" && !Number.isNaN(Date.parse(raw.clientAt)) ? new Date(raw.clientAt) : null;
    const surface = typeof raw.displaySurface === "string" ? raw.displaySurface.slice(0, 20) : undefined;
    const decision = decide(raw.type, { durationMs, chars }, counts, policy);
    let action = decision.action;
    counts = decision.counts;
    if (raw.type === "SCREEN_SHARE_STARTED" && c.screenShareRequired) {
      // Only an entire-screen share lifts the pause; a window or tab share is recorded but does not.
      if (surface === "monitor") paused = false;
      else action = "WARNING";
    }
    if (action === "PAUSE" && c.screenShareRequired) paused = true;
    if (action === "FLAG") flagged = true;
    rows.push({ attemptId: attempt.id, type: raw.type, clientAt, action, meta: { durationMs: durationMs ?? null, chars: chars ?? null, displaySurface: surface ?? null } });
  }
  if (rows.length) await prisma.ccIntegrityEvent.createMany({ data: rows });
  if (paused !== attempt.paused || rows.length) await prisma.ccAttempt.update({ where: { id: attempt.id }, data: { paused, lastSeenAt: new Date() } });
  const warnings = await prisma.ccIntegrityEvent.count({ where: { attemptId: attempt.id, action: { in: ["WARNING", "RISK", "PAUSE", "FLAG"] } } });
  return { recorded: rows.length, paused, warnings, flagged, actions: rows.map((r) => r.action) };
}

export const GENERATOR = "heuristic-v1";

/**
 * Builds the integrity evidence for every finalized attempt: monitoring summary and cross-candidate similarity on
 * each question's final answers. Re-running replaces earlier heuristic reports. Sets integrityRisk and moves
 * attempts with strong evidence to FLAGGED for human review; it never changes a score.
 */
export async function analyzeIntegrity(competitionId: string) {
  const c = await prisma.competition.findUniqueOrThrow({ where: { id: competitionId } });
  const policy = parsePolicy(c.violationPolicy);
  const attempts = await prisma.ccAttempt.findMany({ where: { competitionId, status: "FINALIZED" }, select: { id: true } });
  const attemptIds = attempts.map((a) => a.id);
  await prisma.ccIntegrityReport.deleteMany({ where: { attemptId: { in: attemptIds }, generator: GENERATOR } });

  const risk = new Map<string, number>();
  const flag = new Set<string>();
  const bump = (id: string, r: number) => risk.set(id, Math.max(risk.get(id) ?? 0, r));

  // Monitoring
  const events = await prisma.ccIntegrityEvent.groupBy({ by: ["attemptId", "type", "action"], where: { attemptId: { in: attemptIds } }, _count: { _all: true } });
  const reports: Prisma.CcIntegrityReportCreateManyInput[] = [];
  for (const id of attemptIds) {
    const mine = events.filter((e) => e.attemptId === id);
    const n = (types: string[], counted = true) => mine.filter((e) => types.includes(e.type) && (!counted || e.action !== "NONE")).reduce((s, e) => s + e._count._all, 0);
    const counts: EventCounts = { ...EMPTY_COUNTS, focusLosses: n(["TAB_HIDDEN", "WINDOW_BLUR"]), fullscreenExits: n(["FULLSCREEN_EXIT"]), shareStops: n(["SCREEN_SHARE_ENDED"]), largePastes: n(["LARGE_PASTE"]), resumes: n(["ATTEMPT_RESUMED"], false) };
    const r = monitoringRisk(counts, policy);
    const flags = mine.filter((e) => e.action === "FLAG").reduce((s, e) => s + e._count._all, 0);
    if (r > 0 || flags) reports.push({ attemptId: id, kind: "MONITORING", riskScore: r, generator: GENERATOR, evidence: { counts, policyFlags: flags, byType: Object.fromEntries(mine.map((e) => [`${e.type}:${e.action}`, e._count._all])) } });
    bump(id, r);
    if (flags) flag.add(id);
  }

  // Similarity, per question, on final answers.
  const evaluations = await prisma.ccEvaluation.findMany({ where: { attemptId: { in: attemptIds }, evaluationVersion: c.evaluationVersion, submissionId: { not: null } }, select: { attemptId: true, questionId: true, submissionId: true } });
  const byQuestion = new Map<string, typeof evaluations>();
  for (const e of evaluations) byQuestion.set(e.questionId, [...(byQuestion.get(e.questionId) ?? []), e]);
  let pairs = 0;
  for (const [questionId, evs] of byQuestion) {
    if (evs.length < 2) continue;
    const [subs, question] = await Promise.all([
      prisma.ccSubmission.findMany({ where: { id: { in: evs.map((e) => e.submissionId!) } }, select: { attemptId: true, language: true, source: true } }),
      prisma.ccQuestion.findUnique({ where: { id: questionId }, select: { starterCode: true, referenceSolution: true, referenceLanguage: true } }),
    ]);
    const starters = Object.entries((question?.starterCode ?? {}) as Record<string, string>).map(([language, source]) => ({ language, source }));
    const defaults = Object.entries(COMPETITION_LANGUAGES).map(([language, l]) => ({ language, source: l.starter }));
    const template = [...starters, ...defaults, ...(question && isLanguage(question.referenceLanguage) ? [{ language: question.referenceLanguage, source: question.referenceSolution }] : [])];
    for (const f of analyzeQuestion(subs, template)) {
      pairs++;
      for (const [self, other] of [[f.a, f.b], [f.b, f.a]] as const) {
        reports.push({ attemptId: self, otherAttemptId: other, questionId, kind: "SIMILARITY", riskScore: f.riskScore, generator: GENERATOR, evidence: f as unknown as Prisma.InputJsonValue });
        bump(self, f.riskScore);
        if (f.riskScore >= 70) flag.add(self);
      }
    }
  }
  for (let i = 0; i < reports.length; i += 500) await prisma.ccIntegrityReport.createMany({ data: reports.slice(i, i + 500) });
  for (const id of attemptIds) {
    await prisma.ccResult.updateMany({ where: { attemptId: id }, data: { integrityRisk: risk.get(id) ?? 0 } });
    if (flag.has(id)) await prisma.ccResult.updateMany({ where: { attemptId: id, reviewStatus: "NONE" }, data: { reviewStatus: "FLAGGED" } });
  }
  return { attempts: attemptIds.length, reports: reports.length, similarPairs: pairs, flagged: flag.size };
}

/** Optional AI narrative over the stored evidence (MyBuddy). Advisory text for the reviewer only. */
export async function aiSummary(attemptId: string) {
  if (!isMyBuddyConfigured()) throw new ApiError(503, "The MyBuddy AI agent is not configured (MYBUDDY_API_URL, MYBUDDY_EMAIL, MYBUDDY_PASSWORD). The evidence above is complete without it.", "AI_NOT_CONFIGURED");
  const attempt = await prisma.ccAttempt.findUnique({ where: { id: attemptId }, include: { registration: { select: { candidateId: true } }, reports: { where: { kind: { not: "AI_SUMMARY" } } } } });
  if (!attempt) throw new ApiError(404, "Attempt not found.");
  const evidence = attempt.reports.map((r) => ({ kind: r.kind, riskScore: r.riskScore, questionId: r.questionId, evidence: r.evidence }));
  const system =
    "You assist a human reviewer of an online coding competition. Summarise the integrity evidence factually in under 200 words. " +
    "Never conclude that cheating happened; state what the evidence shows, what innocent explanations exist (standard algorithms, shared templates, network drops, accessibility tools), " +
    "and what the reviewer should check. Do not suggest marks or penalties.";
  const { stream, cleanup } = await streamMyBuddyReply(system, JSON.stringify({ candidate: attempt.registration.candidateId, evidence }).slice(0, 12_000));
  let textOut = "";
  try {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      textOut += decoder.decode(value, { stream: true });
      if (textOut.length > 6000) break;
    }
  } finally {
    await cleanup();
  }
  const report = await prisma.ccIntegrityReport.create({ data: { attemptId, kind: "AI_SUMMARY", riskScore: 0, generator: "mybuddy", evidence: { text: textOut.trim(), advisory: true } } });
  return { id: report.id, text: textOut.trim() };
}
