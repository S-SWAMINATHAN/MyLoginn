"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type ServiceItem = { key: string; short: string; title: string; text: string; href: string; icon: string; color: string; points: string[] };

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Interactive service picker. The tab row is a set of round icons where the selected one expands into a pill with its
 * name; the panel below shows the service's icon, summary and a timeline of what it covers, with a link to its page.
 * Cycles on its own until you pick one.
 */
export function ServicesExplorer({ services }: { services: ServiceItem[] }) {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || !auto) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % services.length), 5200);
    return () => window.clearInterval(id);
  }, [reduced, auto, services.length]);

  const cur = services[index];
  const pick = (i: number) => { setAuto(false); setIndex(i); };

  return (
    <div className="mx-auto w-full max-w-md rounded-[2rem] border border-border-soft bg-surface p-4 shadow-[var(--shadow-soft)] sm:p-5">
      <LayoutGroup>
        <div role="tablist" aria-label="Services" className="flex items-center justify-center gap-1.5 rounded-full bg-story-mist p-1.5">
          {services.map((s, i) => {
            const on = i === index;
            return (
              <motion.button
                key={s.key}
                layout
                type="button"
                role="tab"
                aria-selected={on}
                aria-label={s.title}
                onClick={() => pick(i)}
                transition={{ layout: { type: "spring", stiffness: 380, damping: 32 } }}
                className="relative flex h-11 items-center gap-1.5 rounded-full pl-1.5 outline-none sm:h-12"
                style={{ paddingRight: on ? 14 : 6 }}
              >
                {on && <motion.span layoutId="svc-pill" className="absolute inset-0 rounded-full bg-surface shadow-[0_6px_16px_-8px_rgba(11,31,77,0.35)]" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className="relative grid h-8 w-8 shrink-0 place-items-center sm:h-9 sm:w-9">
                  <ContentIcon keyword={s.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
                {on && (
                  <motion.span layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative whitespace-nowrap text-xs font-bold sm:text-[13px]" style={{ color: s.color }}>
                    {s.short}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="mt-4 rounded-3xl bg-story-mist p-4 sm:p-5" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={cur.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28, ease: EASE }}>
            <div className="flex flex-col items-center gap-3 text-center">
              <motion.span initial={{ scale: 0.6, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-surface shadow-sm">
                <ContentIcon keyword={cur.icon} className="h-10 w-10" />
              </motion.span>
              <div className="min-w-0 max-w-sm">
                <h2 className="text-base font-bold leading-snug sm:text-lg" style={{ color: cur.color }}>{cur.title}</h2>
                <p className="mt-1 text-xs leading-5 text-muted sm:text-[13px]">{cur.text}</p>
              </div>
            </div>

            <ul className="mt-5 flex flex-col items-center gap-2.5">
              {cur.points.map((pt, i) => (
                <motion.li key={pt} initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.12 + i * 0.1, duration: 0.35, ease: EASE }} className="flex items-center gap-2.5 rounded-full bg-surface py-1.5 pl-1.5 pr-4 text-[13px] font-medium shadow-sm">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 400, damping: 18 }} className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: cur.color }}>
                    {i + 1}
                  </motion.span>
                  {pt}
                </motion.li>
              ))}
            </ul>

            <div className="mt-5 flex justify-center"><ArrowLink href={cur.href}>Explore {cur.short}</ArrowLink></div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
