"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export type FaqItem = { question: string; answer: string };

/**
 * Single-open accordion of Card items — each question gets its own numbered,
 * hover-lifted panel instead of a flat divided list, with an icon that
 * rotates and switches to the brand gradient while its answer is expanded.
 */
export function FaqAccordion({ items, className }: { items: FaqItem[]; className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const idBase = useId();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item, i) => {
        const open = openIndex === i;
        const panelId = `${idBase}-panel-${i}`;
        const buttonId = `${idBase}-button-${i}`;

        return (
          <div
            key={item.question}
            className={cn(
              "card-shine overflow-hidden rounded-2xl border bg-surface transition-colors duration-300",
              open ? "border-brand-300 shadow-[var(--shadow-soft)] dark:border-brand-700" : "border-border-soft"
            )}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300",
                    open ? "brand-gradient-bg text-white" : "bg-surface-2 text-muted"
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "flex-1 text-sm font-semibold transition-colors duration-300 sm:text-base",
                    open && "text-brand-600 dark:text-brand-300"
                  )}
                >
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: open ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                    open
                      ? "border-brand-400 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"
                      : "border-border-soft text-muted"
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
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
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-7 text-muted sm:px-6 sm:pl-[3.75rem]">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
