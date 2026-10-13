"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Longer phrases stay on screen longer so they can be read; short ones move on sooner. */
function readingTime(lines: [string, string]) {
  const words = lines.join(" ").split(/\s+/).length;
  return Math.min(9000, Math.max(4500, 3000 + words * 650));
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Rotating hero headline with a fixed footprint. Each phrase is written as two short lines and laid out in the same grid cell, so the block is
 * always exactly as tall as the tallest phrase at the current width: nothing below it ever moves, and it adapts on
 * every screen size without measuring. Only the active phrase is visible; the others are hidden from assistive tech.
 * Rotation pauses while the pointer is over the headline.
 */
export function HeroHeadline({ phrases, highlightClassName }: { phrases: [string, string][]; highlightClassName?: string }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % phrases.length), readingTime(phrases[index]));
    return () => window.clearTimeout(t);
  }, [index, phrases, reduced, paused]);

  return (
    <span className="grid" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {phrases.map((phrase, i) => {
        const [first, second] = phrase;
        const active = i === index;
        return (
          <motion.span
            key={first}
            aria-hidden={active ? undefined : true}
            className="col-start-1 row-start-1 block"
            style={{ pointerEvents: active ? "auto" : "none" }}
            initial={false}
            animate={{ opacity: active ? 1 : 0, y: active ? 0 : -14, filter: active ? "blur(0px)" : "blur(4px)" }}
            transition={{ duration: 0.6, ease: EASE, delay: active ? 0.15 : 0 }}
          >
            <span className="block">{first}</span>
            <span className={`block ${highlightClassName ?? ""}`}>{second}</span>
          </motion.span>
        );
      })}
    </span>
  );
}
