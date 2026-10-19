"use client";

import { useSyncExternalStore } from "react";

/** The current time in 12-hour format with AM/PM (e.g. "4:07 PM"). */
function now() {
  const d = new Date();
  return `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${d.getHours() < 12 ? "AM" : "PM"}`;
}

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 15_000);
  return () => window.clearInterval(id);
}

/**
 * The visitor's real local time for device status bars, refreshed every 15 seconds. The server render (and the
 * first client render during hydration) shows "9:41 AM", then it switches to the real time.
 */
export function useClock() {
  return useSyncExternalStore(subscribe, now, () => "9:41 AM");
}
