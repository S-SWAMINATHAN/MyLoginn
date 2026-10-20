/**
 * Monitoring policy: which browser events are recorded and what each one leads to. Pure and client-safe so the
 * rules page shows exactly the thresholds the server enforces.
 *
 * Browser events are signals, not proof. Nothing here penalises a score: the worst automatic outcome is FLAG, which
 * sends the attempt to human review. Penalties and disqualification are only applied by an administrator
 * (see server/review.ts), with a recorded reason, and can be appealed.
 */

export const EVENT_TYPES = [
  "SCREEN_SHARE_STARTED",
  "SCREEN_SHARE_ENDED",
  "TAB_HIDDEN",
  "WINDOW_BLUR",
  "FULLSCREEN_EXIT",
  "FULLSCREEN_ENTER",
  "PAGE_UNLOAD",
  "LARGE_PASTE",
  "DEVTOOLS_SHORTCUT",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];
/** Recorded by the server itself, never accepted from the browser. */
export type ServerEventType = "ATTEMPT_STARTED" | "ATTEMPT_RESUMED" | "SUBMISSION_BURST" | "ATTEMPT_FINALIZED";

export const isEventType = (v: unknown): v is EventType => typeof v === "string" && (EVENT_TYPES as readonly string[]).includes(v);

export const EVENT_LABEL: Record<EventType | ServerEventType, string> = {
  SCREEN_SHARE_STARTED: "Screen sharing started",
  SCREEN_SHARE_ENDED: "Screen sharing stopped",
  TAB_HIDDEN: "Left the exam tab",
  WINDOW_BLUR: "Exam window lost focus",
  FULLSCREEN_EXIT: "Exited full screen",
  FULLSCREEN_ENTER: "Entered full screen",
  PAGE_UNLOAD: "Page reloaded or closed",
  LARGE_PASTE: "Large paste into the editor",
  DEVTOOLS_SHORTCUT: "Developer-tools shortcut pressed",
  ATTEMPT_STARTED: "Attempt started",
  ATTEMPT_RESUMED: "Attempt resumed (reconnect)",
  SUBMISSION_BURST: "Unusually frequent submissions",
  ATTEMPT_FINALIZED: "Attempt finalized",
};

export type ViolationPolicy = {
  /** Focus losses (tab hidden / window blur) shorter than this are ignored entirely (notifications, OS pop-ups). */
  ignoreFocusLossUnderMs: number;
  /** Focus losses that only produce a warning. */
  warningsBeforeRisk: number;
  /** Total counted focus losses at which the attempt is flagged for human review. */
  flagAfterFocusLosses: number;
  /** Full-screen exits at which the attempt is flagged. */
  flagAfterFullscreenExits: number;
  /** Screen-share stops at which the attempt is flagged. Each stop also pauses run/submit until sharing resumes. */
  flagAfterShareStops: number;
  /** Characters in one paste that count as a large paste. */
  largePasteChars: number;
  /** Reconnects (arena reloads) at which the attempt is flagged. */
  flagAfterResumes: number;
};

export const DEFAULT_POLICY: ViolationPolicy = {
  ignoreFocusLossUnderMs: 2000,
  warningsBeforeRisk: 1,
  flagAfterFocusLosses: 6,
  flagAfterFullscreenExits: 4,
  flagAfterShareStops: 3,
  largePasteChars: 400,
  flagAfterResumes: 6,
};

export function parsePolicy(value: unknown): ViolationPolicy {
  const v = (value && typeof value === "object" ? value : {}) as Partial<Record<keyof ViolationPolicy, unknown>>;
  const out = { ...DEFAULT_POLICY };
  for (const key of Object.keys(DEFAULT_POLICY) as (keyof ViolationPolicy)[]) {
    const n = Number(v[key]);
    if (Number.isFinite(n) && n >= 0 && n <= 1_000_000) out[key] = Math.round(n);
  }
  return out;
}

export type EventCounts = { focusLosses: number; fullscreenExits: number; shareStops: number; largePastes: number; resumes: number };
export const EMPTY_COUNTS: EventCounts = { focusLosses: 0, fullscreenExits: 0, shareStops: 0, largePastes: 0, resumes: 0 };

export type Action = "NONE" | "WARNING" | "RISK" | "PAUSE" | "FLAG";

/**
 * Decides what one incoming event does, given the counts so far (before this event). Returns the action recorded on
 * the event and the updated counts. `durationMs` is how long focus was away, reported on return; it only ever
 * reduces severity, so a forged value cannot hurt anyone but the sender.
 */
export function decide(type: EventType | ServerEventType, meta: { durationMs?: number; chars?: number }, counts: EventCounts, p: ViolationPolicy): { action: Action; counts: EventCounts } {
  const c = { ...counts };
  switch (type) {
    case "TAB_HIDDEN":
    case "WINDOW_BLUR": {
      if (meta.durationMs !== undefined && meta.durationMs < p.ignoreFocusLossUnderMs) return { action: "NONE", counts: c };
      c.focusLosses += 1;
      if (c.focusLosses >= p.flagAfterFocusLosses) return { action: "FLAG", counts: c };
      return { action: c.focusLosses <= p.warningsBeforeRisk ? "WARNING" : "RISK", counts: c };
    }
    case "FULLSCREEN_EXIT":
      c.fullscreenExits += 1;
      return { action: c.fullscreenExits >= p.flagAfterFullscreenExits ? "FLAG" : "WARNING", counts: c };
    case "SCREEN_SHARE_ENDED":
      c.shareStops += 1;
      return { action: c.shareStops >= p.flagAfterShareStops ? "FLAG" : "PAUSE", counts: c };
    case "LARGE_PASTE":
      if ((meta.chars ?? 0) < p.largePasteChars) return { action: "NONE", counts: c };
      c.largePastes += 1;
      return { action: "RISK", counts: c };
    case "ATTEMPT_RESUMED":
      c.resumes += 1;
      return { action: c.resumes >= p.flagAfterResumes ? "FLAG" : "NONE", counts: c };
    case "DEVTOOLS_SHORTCUT":
    case "SUBMISSION_BURST":
      return { action: "RISK", counts: c };
    default:
      return { action: "NONE", counts: c };
  }
}

/**
 * Monitoring risk on a 0–100 scale from the counted events. Used to order the review queue only; it is never
 * subtracted from a score.
 */
export function monitoringRisk(c: EventCounts, p: ViolationPolicy) {
  const part = (n: number, flagAt: number) => (flagAt > 0 ? Math.min(1, n / flagAt) : 0);
  const score =
    35 * part(c.focusLosses, p.flagAfterFocusLosses) +
    20 * part(c.fullscreenExits, p.flagAfterFullscreenExits) +
    25 * part(c.shareStops, p.flagAfterShareStops) +
    12 * Math.min(1, c.largePastes / 3) +
    8 * part(c.resumes, p.flagAfterResumes);
  return Math.round(score);
}

/** Plain-language rules shown to candidates, generated from the same numbers the server uses. */
export function describePolicy(p: ViolationPolicy, opts: { screenShareRequired: boolean; fullscreenRequired: boolean }): string[] {
  const lines = [
    `Leaving the exam tab or window for less than ${Math.round(p.ignoreFocusLossUnderMs / 1000)} seconds is ignored.`,
    `Your first ${p.warningsBeforeRisk === 1 ? "longer focus loss gives" : `${p.warningsBeforeRisk} longer focus losses give`} a warning only; later ones are recorded as risk signals.`,
    `${p.flagAfterFocusLosses} or more focus losses send your attempt to human review.`,
  ];
  if (opts.fullscreenRequired) lines.push(`The exam runs in full screen. ${p.flagAfterFullscreenExits} or more full-screen exits send your attempt to review.`);
  if (opts.screenShareRequired)
    lines.push(
      "You must share your entire screen before starting. If sharing stops, Run and Submit are paused until you share again (the timer keeps running).",
      `${p.flagAfterShareStops} or more screen-share stops send your attempt to review.`
    );
  lines.push(
    `Pasting ${p.largePasteChars}+ characters at once is recorded as a risk signal.`,
    "A review is not a penalty. Only an administrator can apply a penalty or disqualification, with a recorded reason, and you can appeal it from your dashboard."
  );
  return lines;
}
