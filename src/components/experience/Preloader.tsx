"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SESSION_KEY = "myloginn:intro-seen";
const EASE = [0.16, 1, 0.3, 1] as const;

function getSeenSnapshot() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}
function getSeenServerSnapshot() {
  return false;
}
function subscribeSeen() {
  // sessionStorage doesn't change from outside this tab's own writes, which
  // we make ourselves (see below) and reflect via local `holding` state —
  // no external event to subscribe to.
  return () => {};
}

function buildCrystal() {
  const cx = 60;
  const cy = 60;
  const r = 46;
  const round = (n: number) => Math.round(n * 100) / 100;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return [round(cx + r * Math.cos(angle)), round(cy + r * Math.sin(angle))] as const;
  });
  const shades = ["#0b1f4d", "#1a44ab", "#1f56d6", "#2f6fed", "#5590ff", "#22d3ee"];
  const facets = pts.map((p, i) => {
    const next = pts[(i + 1) % pts.length];
    const angle = (i / pts.length) * 360;
    // Rounded to a fixed precision (rather than left as raw trig output) so
    // the value framer-motion serializes into the server-rendered <style>
    // string is byte-identical to what it computes again on the client —
    // otherwise the two float-to-string conversions can disagree in their
    // last few digits and React flags a hydration mismatch.
    return {
      d: `M${cx},${cy} L${p[0]},${p[1]} L${next[0]},${next[1]} Z`,
      fill: shades[i],
      hiddenX: round(Math.cos((angle * Math.PI) / 180) * 40),
      hiddenY: round(Math.sin((angle * Math.PI) / 180) * 40),
    };
  });
  // The outer edge as one closed loop, plus each spoke back to the center —
  // this is what "draws" itself in first (an animated SVG line, per an
  // animated-preloader reference) before the facets fill in behind it.
  const outline = `M${pts.map((p) => `${p[0]},${p[1]}`).join(" L")} Z`;
  const spokes = pts.map((p) => `M${cx},${cy} L${p[0]},${p[1]}`).join(" ");
  return { facets, outline, spokes };
}

export function Preloader() {
  const reducedMotion = useReducedMotion();
  const seen = useSyncExternalStore(subscribeSeen, getSeenSnapshot, getSeenServerSnapshot);
  const [holding, setHolding] = useState(true);
  const crystal = useMemo(() => buildCrystal(), []);
  const visible = !seen && holding;

  useEffect(() => {
    if (seen) return;
    document.body.style.overflow = "hidden";
    const holdMs = reducedMotion ? 350 : 2300;
    const timer = window.setTimeout(() => {
      setHolding(false);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore (private mode, etc.)
      }
    }, holdMs);
    return () => window.clearTimeout(timer);
  }, [seen, reducedMotion]);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          role="status"
          aria-label="Loading MyLoginn"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: EASE } }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-white"
        >
          <span className="sr-only">Loading MyLoginn…</span>

          <svg width="120" height="120" viewBox="0 0 120 120">
            {/* The crystal's edges hand-draw themselves first ... */}
            <motion.path
              d={crystal.spokes}
              fill="none"
              stroke="#1f56d6"
              strokeWidth={1.1}
              strokeLinecap="round"
              initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0, opacity: 0.8 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: reducedMotion ? 0 : 0.55, ease: EASE }}
            />
            <motion.path
              d={crystal.outline}
              fill="none"
              stroke="#22d3ee"
              strokeWidth={1.6}
              strokeLinejoin="round"
              initial={reducedMotion ? { pathLength: 1 } : { pathLength: 0, opacity: 0.95 }}
              animate={{ pathLength: 1, opacity: 0.95 }}
              transition={{ duration: reducedMotion ? 0 : 0.65, ease: EASE, delay: reducedMotion ? 0 : 0.05 }}
            />
            {/* ... then light fills each facet in behind it. */}
            {crystal.facets.map((f, i) => (
              <motion.path
                key={i}
                d={f.d}
                fill={f.fill}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: f.hiddenX, y: f.hiddenY, rotate: -30 }}
                animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                transition={{ duration: 0.75, ease: EASE, delay: reducedMotion ? 0 : 0.3 + i * 0.08 }}
              />
            ))}
          </svg>

          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            animate={{ opacity: 1, letterSpacing: "0.32em" }}
            transition={{ delay: reducedMotion ? 0.05 : 1.25, duration: 0.6, ease: EASE }}
            className="mt-6 text-sm font-bold uppercase text-story-navy"
            style={{ letterSpacing: "0.32em" }}
          >
            MyLoginn
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
