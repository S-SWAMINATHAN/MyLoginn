"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

/** Circular progress indicator that fills when it scrolls into view. */
export function CourseProgressRing({ percent, label, sublabel }: { percent: number; label: string; sublabel: string }) {
  const reduced = useReducedMotion();
  const r = 34;
  const c = 2 * Math.PI * r;
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-4" role="img" aria-label={`${label}: ${value}% complete. ${sublabel}`}>
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--story-mist)" strokeWidth="7" />
          <motion.circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke="var(--story-royal)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: reduced ? c * (1 - value / 100) : c }}
            whileInView={{ strokeDashoffset: c * (1 - value / 100) }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-base font-bold tabular-nums text-story-navy dark:text-foreground">{value}%</span>
      </div>
      <div className="min-w-0 leading-snug">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs text-muted">{sublabel}</p>
      </div>
    </div>
  );
}
