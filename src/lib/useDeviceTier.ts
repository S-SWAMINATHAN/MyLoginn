"use client";

import { useSyncExternalStore } from "react";

export type DeviceTier = {
  /** Narrow viewport and/or coarse pointer — scale back 3D detail, particle counts, pinning. */
  isCompact: boolean;
  /** No hover-capable pointer — skip cursor-parallax and hover-only affordances. */
  isTouch: boolean;
};

const COMPACT_QUERY = "(max-width: 900px)";
const TOUCH_QUERY = "(hover: none), (pointer: coarse)";

function makeMediaHook(query: string) {
  const subscribe = (callback: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
  const getSnapshot = () => (typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false);
  const getServerSnapshot = () => false;
  return () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const useCompactQuery = makeMediaHook(COMPACT_QUERY);
const useTouchQuery = makeMediaHook(TOUCH_QUERY);

/** Coarse device classification for scaling the 3D story engine responsibly. */
export function useDeviceTier(): DeviceTier {
  return { isCompact: useCompactQuery(), isTouch: useTouchQuery() };
}
