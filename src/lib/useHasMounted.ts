"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True only once this render has happened on the client. Useful for gating
 * output that's fine to skip during SSR entirely — e.g. a value computed
 * from irrational math (cos/sin, sqrt) that framer-motion would otherwise
 * serialize into the server HTML at a different float precision than the
 * client recomputes, which React then flags as a hydration mismatch.
 */
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
