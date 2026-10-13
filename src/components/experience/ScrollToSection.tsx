"use client";

import { useEffect } from "react";

const SEEN_KEY = "ml-home-intro-scrolled";

/**
 * On the first visit of a session, lands the page with `#id` sitting directly under the sticky header.
 * Skips reloads and back/forward (the browser restores those), URLs with a hash, and anyone who has
 * already started scrolling. Later visits to the page start at the top as usual.
 */
export function ScrollToSection({ id }: { id: string }) {
  useEffect(() => {
    try {
      if (window.location.hash || sessionStorage.getItem(SEEN_KEY)) return;
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav && nav.type !== "navigate") return;
    } catch {
      return;
    }
    if (window.scrollY > 4) return;

    let cancelled = false;
    let frame = 0;
    const startedAt = performance.now();
    const cancel = () => { cancelled = true; };
    const events = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    events.forEach((e) => window.addEventListener(e, cancel, { passive: true, once: true }));

    const attempt = () => {
      if (cancelled) return;
      // The section is code-split, so it may not be in the DOM yet; keep looking for a few seconds.
      const el = document.getElementById(id);
      if (!el) {
        if (performance.now() - startedAt < 4000) frame = requestAnimationFrame(attempt);
        return;
      }
      const header = document.querySelector("header");
      const offset = header ? header.getBoundingClientRect().height : 64;
      window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset), behavior: "auto" });
      try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* storage unavailable */ }
    };
    frame = requestAnimationFrame(attempt);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      events.forEach((e) => window.removeEventListener(e, cancel));
    };
  }, [id]);

  return null;
}
