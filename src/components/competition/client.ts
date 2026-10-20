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
 * Current server time, ticking every `ms`. The browser clock is never trusted for deadlines: the offset to the
 * server's clock is taken once from `serverNowIso`, and the browser clock only advances it between server syncs.
 */
export function useServerNow(serverNowIso: string | undefined, ms = 1000) {
  const [offset] = useState(() => (serverNowIso ? new Date(serverNowIso).getTime() - Date.now() : 0));
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + offset), ms);
    return () => clearInterval(id);
  }, [offset, ms]);
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
