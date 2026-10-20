"use client";

import { useEffect, useState } from "react";

export class ApiFailure extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

/** JSON fetch against the competition APIs. Throws ApiFailure with the server's user-facing message. */
export async function api<T>(path: string, init: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: init.signal,
      cache: "no-store",
      credentials: "same-origin",
    });
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    throw new ApiFailure("You appear to be offline. Check your connection; your work is kept in this browser until it saves.", 0, "OFFLINE");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
  if (!res.ok) throw new ApiFailure(data.error ?? `Request failed (${res.status}).`, res.status, data.code);
  return data as T;
}

/**
 * Shared server-clock offset (server time − browser time). Seeded from the page's render time, then measured
 * against /api/coding-competition/time with round-trip compensation (NTP style), re-synced every 5 minutes and when
 * the tab becomes visible. Deadlines therefore never depend on the browser clock or on a stale cached page.
 */
let clockOffset: number | null = null;
let lastSync = 0;
let syncing: Promise<void> | null = null;
const offsetListeners = new Set<() => void>();

async function syncClock() {
  if (syncing) return syncing;
  syncing = (async () => {
    let best: { offset: number; rtt: number } | null = null;
    for (let i = 0; i < 3; i++) {
      try {
        const t0 = Date.now();
        const res = await fetch("/api/coding-competition/time", { cache: "no-store" });
        const t1 = Date.now();
        const { now } = (await res.json()) as { now: number };
        const sample = { offset: now - (t0 + t1) / 2, rtt: t1 - t0 };
        if (!best || sample.rtt < best.rtt) best = sample;
      } catch {
        /* offline: keep the previous offset */
      }
    }
    if (best) {
      clockOffset = best.offset;
      lastSync = Date.now();
      offsetListeners.forEach((fn) => fn());
    }
  })().finally(() => (syncing = null));
  return syncing;
}

/**
 * Current server time, re-rendering exactly on each second boundary. `serverNowIso` (the page's render time) is
 * only a first estimate until the clock sync answers.
 */
export function useServerNow(serverNowIso: string | undefined) {
  const [seed] = useState(() => (serverNowIso ? new Date(serverNowIso).getTime() - Date.now() : 0));
  const offset = () => clockOffset ?? seed;
  const [now, setNow] = useState(() => Date.now() + offset());
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      // Also called when a sync lands, so cancel the pending wake-up to keep exactly one timer chain.
      clearTimeout(timer);
      const t = Date.now() + (clockOffset ?? seed);
      setNow(t);
      // Wake just after the next whole server second, so digits change on time instead of drifting.
      timer = setTimeout(tick, 1000 - (t % 1000) + 5);
    };
    const resync = () => {
      if (document.visibilityState === "visible" && Date.now() - lastSync > 30_000) syncClock();
    };
    offsetListeners.add(tick);
    if (clockOffset === null || Date.now() - lastSync > 300_000) syncClock();
    const every = setInterval(() => syncClock(), 300_000);
    document.addEventListener("visibilitychange", resync);
    tick();
    return () => {
      clearTimeout(timer);
      clearInterval(every);
      offsetListeners.delete(tick);
      document.removeEventListener("visibilitychange", resync);
    };
  }, [seed]);
  return now;
}

export function splitDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

export const pad = (n: number) => String(n).padStart(2, "0");

export function formatClock(ms: number) {
  const { days, hours, minutes, seconds } = splitDuration(ms);
  const h = days * 24 + hours;
  return h ? `${h}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export const requestKey = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`);
