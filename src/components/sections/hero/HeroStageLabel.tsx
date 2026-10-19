"use client";

import { AnimatePresence, motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { Scenario } from "@/components/sections/hero/heroScenarios";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The label on the stage under the devices: the service number and name rise into place word by word, then its three
 * facets follow. Digital Marketing shows its facets as rising indicators instead of plain words.
 */
export function HeroStageLabel({ scenario, n, total }: { scenario: Scenario; n: number; total: number }) {
  const reduced = useReducedMotion();
  const words = scenario.area.split(" ");

  return (
    <div className="text-center" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={scenario.id} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          <p className="flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-[0.22em] text-story-royal sm:text-[13px]">
            <span className="tabular-nums text-muted">0{n}<span className="opacity-50">/0{total}</span></span>
            <motion.span aria-hidden className="h-px bg-story-royal/40" initial={reduced ? false : { width: 0 }} animate={{ width: 20 }} transition={{ duration: 0.4, ease: EASE }} />
            <span className="flex gap-[0.4em]">
              {words.map((w, i) => (
                <span key={w} className="inline-block overflow-hidden pb-px">
                  <motion.span className="inline-block" initial={reduced ? false : { y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 0.55, ease: EASE, delay: 0.08 + i * 0.07 }}>{w}</motion.span>
                </span>
              ))}
            </span>
          </p>
          <ul className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-xs text-muted sm:text-sm">
            {scenario.facets.map((f, i) => (
              <motion.li
                key={f}
                className="flex items-center gap-2"
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.3 + i * 0.09 }}
              >
                {i > 0 && <span aria-hidden className="text-story-royal/40">•</span>}
                {scenario.metrics ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-story-navy dark:text-foreground">
                    {f}
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2.5} aria-label="up" />
                  </span>
                ) : (
                  <span>{f}</span>
                )}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
