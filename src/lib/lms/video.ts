/**
 * Video watch tracking. The player reports its position; the server never lets watched time
 * advance faster than real time (x2 max playback speed + a little slack), so one forged
 * request ("I watched 100%") cannot complete a video.
 */

export type VideoState = {
  watchedSeconds: number;
  lastReportAt: Date | null;
};

export type VideoReport = {
  /** Current player position in seconds. */
  positionSeconds: number;
  /** Video length in seconds as reported by the player. */
  durationSeconds: number;
};

export const MAX_PLAYBACK_RATE = 2;
const SLACK_SECONDS = 2;
const MIN_DURATION = 5;
const MAX_DURATION = 6 * 60 * 60;

export type VideoUpdate = { watchedSeconds: number; percent: number; accepted: boolean };

/**
 * `trustedDuration` (admin-entered lesson length) wins over the player's claim when present.
 * Only forward movement counts, capped by elapsed wall-clock time.
 */
export function applyVideoReport(prev: VideoState, report: VideoReport, now: Date, trustedDuration?: number | null): VideoUpdate {
  const duration = clampDuration(trustedDuration ?? report.durationSeconds);
  if (!Number.isFinite(report.positionSeconds) || !duration) return { watchedSeconds: prev.watchedSeconds, percent: percentOf(prev.watchedSeconds, duration || 1), accepted: false };

  const position = Math.min(Math.max(0, report.positionSeconds), duration);
  const forward = Math.max(0, position - prev.watchedSeconds);

  // First report of a session may only count up to a small head start; afterwards time-limited.
  const elapsed = prev.lastReportAt ? Math.max(0, (now.getTime() - prev.lastReportAt.getTime()) / 1000) : 0;
  const allowance = prev.lastReportAt ? elapsed * MAX_PLAYBACK_RATE + SLACK_SECONDS : SLACK_SECONDS;
  const gained = Math.min(forward, allowance);
  const watchedSeconds = Math.min(duration, Math.floor(prev.watchedSeconds + gained));

  return { watchedSeconds, percent: percentOf(watchedSeconds, duration), accepted: true };
}

function clampDuration(value: number | null | undefined) {
  if (!value || !Number.isFinite(value) || value < MIN_DURATION) return 0;
  return Math.min(value, MAX_DURATION);
}

const percentOf = (watched: number, duration: number) => Math.min(100, Math.floor((watched * 100) / duration));
