/**
 * Competition lifecycle. Pure functions; the database layer (server/lifecycle.ts) applies them inside transactions.
 *
 *   DRAFT → REGISTRATION_OPEN → REGISTRATION_CLOSED → SCHEDULED → LIVE → SUBMISSION_CLOSED → EVALUATION
 *         → UNDER_REVIEW → RESULTS_PUBLISHED → ARCHIVED
 *
 * Time-driven steps happen on the server tick (never on a browser timer). The rest are admin actions with
 * preconditions checked by the service that performs them.
 */
import type { CompetitionStatus } from "./types";

/** Transitions an administrator may request directly. Publishing has its own action (results.ts). */
export const MANUAL_TRANSITIONS: Partial<Record<CompetitionStatus, CompetitionStatus[]>> = {
  DRAFT: ["REGISTRATION_OPEN", "ARCHIVED"],
  REGISTRATION_OPEN: ["REGISTRATION_CLOSED", "ARCHIVED"],
  REGISTRATION_CLOSED: ["REGISTRATION_OPEN", "SCHEDULED", "ARCHIVED"],
  SCHEDULED: ["REGISTRATION_CLOSED", "ARCHIVED"],
  // Emergency stop: ends the window now; active attempts are finalized by the next tick.
  LIVE: ["SUBMISSION_CLOSED"],
  RESULTS_PUBLISHED: ["ARCHIVED"],
};

export function canTransition(from: CompetitionStatus, to: CompetitionStatus) {
  return MANUAL_TRANSITIONS[from]?.includes(to) ?? false;
}

export type Schedule = {
  registrationOpensAt: Date;
  registrationClosesAt: Date;
  startsAt: Date;
  endsAt: Date;
  durationMinutes: number;
  lateJoinMinutes: number;
  resultsPublishAt: Date;
};

/** Problems with a schedule, as messages for the admin. Empty when it is consistent. */
export function scheduleProblems(s: Schedule): string[] {
  const out: string[] = [];
  const t = (d: Date) => d.getTime();
  if (!(s.durationMinutes >= 5 && s.durationMinutes <= 600)) out.push("Duration must be between 5 and 600 minutes.");
  if (!(s.lateJoinMinutes >= 0 && s.lateJoinMinutes <= 180)) out.push("Late-join window must be between 0 and 180 minutes.");
  if (t(s.registrationOpensAt) >= t(s.registrationClosesAt)) out.push("Registration must open before it closes.");
  if (t(s.registrationClosesAt) > t(s.startsAt)) out.push("Registration must close before the competition starts.");
  const fullWindow = t(s.startsAt) + (s.lateJoinMinutes + s.durationMinutes) * 60_000;
  if (t(s.endsAt) < fullWindow)
    out.push("The window must end at least (late-join + duration) after the start, so every on-time or late-joining candidate gets the full duration.");
  if (t(s.resultsPublishAt) <= t(s.endsAt)) out.push("Results must be published after the competition window ends.");
  return out;
}

/** Deadline for an attempt started at `startedAt`. Reconnects never move it. */
export function attemptDeadline(startedAt: Date, s: Pick<Schedule, "durationMinutes" | "endsAt">) {
  return new Date(Math.min(startedAt.getTime() + s.durationMinutes * 60_000, s.endsAt.getTime()));
}

export type StartCheck = { ok: true } | { ok: false; reason: "NOT_LIVE" | "TOO_EARLY" | "LATE_JOIN_CLOSED" | "ENDED" };

/** Whether a NEW attempt may start now. Resuming an existing active attempt is always allowed until its deadline. */
export function canStartAttempt(status: CompetitionStatus, s: Pick<Schedule, "startsAt" | "endsAt" | "lateJoinMinutes">, now: Date): StartCheck {
  const n = now.getTime();
  if (n < s.startsAt.getTime()) return { ok: false, reason: "TOO_EARLY" };
  if (n >= s.endsAt.getTime()) return { ok: false, reason: "ENDED" };
  if (status !== "LIVE") return { ok: false, reason: "NOT_LIVE" };
  if (n >= s.startsAt.getTime() + s.lateJoinMinutes * 60_000) return { ok: false, reason: "LATE_JOIN_CLOSED" };
  return { ok: true };
}

export function registrationOpenNow(status: CompetitionStatus, s: Pick<Schedule, "registrationOpensAt" | "registrationClosesAt">, now: Date) {
  return status === "REGISTRATION_OPEN" && now >= s.registrationOpensAt && now < s.registrationClosesAt;
}

export type TickFacts = {
  now: Date;
  activeAttempts: number;
  pendingEvaluations: number;
  resultsApproved: boolean;
};

/**
 * The next status the clock (or completed work) moves the competition to, or null when it should stay.
 * Applied repeatedly until it returns null, so a late tick catches up through several states.
 */
export function nextAutomaticStatus(status: CompetitionStatus, s: Schedule, f: TickFacts): CompetitionStatus | null {
  const now = f.now.getTime();
  switch (status) {
    case "REGISTRATION_OPEN":
      return now >= s.registrationClosesAt.getTime() ? "REGISTRATION_CLOSED" : null;
    case "SCHEDULED":
      return now >= s.startsAt.getTime() ? "LIVE" : null;
    case "LIVE":
      return now >= s.endsAt.getTime() ? "SUBMISSION_CLOSED" : null;
    case "SUBMISSION_CLOSED":
      return f.activeAttempts === 0 ? "EVALUATION" : null;
    case "EVALUATION":
      return f.pendingEvaluations === 0 ? "UNDER_REVIEW" : null;
    case "UNDER_REVIEW":
      return f.resultsApproved && now >= s.resultsPublishAt.getTime() ? "RESULTS_PUBLISHED" : null;
    default:
      return null;
  }
}
