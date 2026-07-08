"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Polls an admin API endpoint so every screen stays in sync with the database
 * in near real time: refetches on an interval, when the tab regains focus, and
 * on demand after a mutation (call `refresh`).
 */
export function useLiveData<T>(url: string, { intervalMs = 10_000 }: { intervalMs?: number } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const inFlight = useRef(false);

  const fetchNow = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to load data");
        return;
      }
      setData(json as T);
      setError(null);
      setUpdatedAt(new Date());
    } catch {
      setError("Network error — retrying…");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetchNow();

    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchNow();
    }, intervalMs);
    const onFocus = () => fetchNow();
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchNow();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [fetchNow, intervalMs]);

  return { data, error, loading, updatedAt, refresh: fetchNow };
}
