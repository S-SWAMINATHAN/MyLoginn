"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type FaqItem = { question: string; answer: string };

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Single-open FAQ list. Each question is a rounded card with a plus icon that turns into a cross, an accent bar that
 * grows down the left edge, and an answer that slides open. Arrow keys, Home and End move between questions.
 */
export function FaqAccordion({ items, className }: { items: FaqItem[]; className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const idBase = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next: number | null = null;
    if (e.key === "ArrowDown") next = (i + 1) % items.length;
    if (e.key === "ArrowUp") next = (i - 1 + items.length) % items.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = items.length - 1;
    if (next !== null) {
      e.preventDefault();
      buttons.current[next]?.focus();
    }
  }

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item, i) => {
        const open = openIndex === i;
        const panelId = `${idBase}-panel-${i}`;
        const buttonId = `${idBase}-button-${i}`;

        return (
          <motion.div
            key={item.question}
            layout
            transition={{ layout: { duration: 0.35, ease: EASE } }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border transition-colors duration-300",
              open ? "border-story-royal/35 bg-surface shadow-[0_14px_30px_-20px_rgba(31,86,214,0.55)]" : "border-border-soft bg-surface hover:border-story-royal/30"
            )}
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-1 origin-top bg-story-royal transition-transform duration-300" style={{ transform: open ? "scaleY(1)" : "scaleY(0)" }} />
            <h3>
              <button
                id={buttonId}
                ref={(el) => { buttons.current[i] = el; }}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="flex w-full cursor-pointer items-center gap-3.5 px-4 py-3.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-story-royal/50 sm:px-5 sm:py-4"
              >
                <span
                  className={cn("relative grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-300", open ? "bg-story-royal text-white" : "bg-story-mist text-story-royal group-hover:bg-story-royal/15")}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M2 7h10" />
                    <motion.path d="M7 2v10" animate={{ scaleY: open ? 0 : 1, opacity: open ? 0 : 1 }} style={{ originX: "7px", originY: "7px" }} transition={{ duration: 0.25, ease: EASE }} />
                  </svg>
                </span>
                <span className={cn("min-w-0 flex-1 text-sm font-semibold leading-snug transition-colors duration-300 sm:text-[15px]", open ? "text-story-royal" : "text-foreground")}>{item.question}</span>
                <span aria-hidden className={cn("shrink-0 font-mono text-[11px] font-bold tabular-nums transition-colors duration-300", open ? "text-story-royal" : "text-muted/60")}>{String(i + 1).padStart(2, "0")}</span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: EASE }}
                  className="overflow-hidden"
                >
                  <motion.p initial={{ y: -6 }} animate={{ y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="px-4 pb-4 pl-[3.75rem] pr-5 text-sm leading-7 text-muted sm:px-5 sm:pb-5 sm:pl-[4.25rem]">
                    {item.answer}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
