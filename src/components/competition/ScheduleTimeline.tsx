"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ClipboardList, Code2, Trophy, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export type ScheduleItem = { key: "registration" | "window" | "results"; label: string; when: string; note?: string; startMs: number; endMs: number };

const ICONS: Record<ScheduleItem["key"], LucideIcon> = { registration: ClipboardList, window: Code2, results: Trophy };
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The three dates that matter, drawn as one timeline: each stage shows whether it is done, happening now or still to
 * come, and the line between stages fills as time passes. Tap or hover a stage to read its detail.
 */
export function ScheduleTimeline({ items, tz, nowMs }: { items: ScheduleItem[]; tz: string; nowMs: number }) {
  const states = items.map((it) => (nowMs >= it.endMs ? "done" : nowMs >= it.startMs ? "live" : "next") as "done" | "live" | "next");
  const current = Math.max(0, states.findIndex((s) => s !== "done"));
  const [active, setActive] = useState(states.every((s) => s === "done") ? items.length - 1 : current);
  // how far the connecting line has progressed, in whole stages (a live stage counts as half)
  const fill = states.reduce((sum, s) => sum + (s === "done" ? 1 : s === "live" ? 0.5 : 0), 0) / items.length;

  return (
    <div>
      <ol className="relative grid gap-3 sm:grid-cols-3" aria-label="Competition schedule">
        {/* the line behind the stage markers (desktop) */}
        <span aria-hidden className="absolute left-[16.6%] right-[16.6%] top-[1.65rem] hidden h-0.5 rounded-full bg-border-soft sm:block">
          <motion.span className="block h-full rounded-full bg-story-royal" initial={{ width: 0 }} whileInView={{ width: `${Math.min(1, fill / (1 - 1 / items.length)) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }} />
        </span>
        {items.map((it, i) => {
          const Icon = ICONS[it.key];
          const st = states[i];
          const on = active === i;
          return (
            <li key={it.key}>
              <button
                type="button"
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                aria-pressed={on}
                className={cn("[&_:is(p,li)]:text-left [&_:is(p,li)]:hyphens-manual group relative flex h-full w-full flex-col rounded-3xl border bg-surface p-4 text-left outline-none transition-[border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-story-royal sm:items-center sm:text-center", on ? "border-story-royal/50 shadow-[var(--shadow-lift)]" : "border-border-soft hover:border-story-royal/30")}
              >
                <span className="flex items-center gap-3 sm:flex-col">
                  <span className={cn("relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300", st === "done" ? "border-story-royal bg-story-royal text-white" : st === "live" ? "border-story-royal bg-surface text-story-royal" : "border-border-soft bg-surface text-muted")}>
                    {st === "live" && <motion.span aria-hidden className="absolute inset-0 rounded-full border-2 border-story-royal" animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />}
                    {st === "done" ? <Check className="h-5 w-5" strokeWidth={3} /> : <Icon className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1 sm:flex-none">
                    <span className="block text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{it.label}</span>
                    <span className={cn("mt-0.5 inline-flex items-center gap-1.5 text-xs font-bold", st === "done" ? "text-muted" : st === "live" ? "text-emerald-600" : "text-amber-600")}>
                      {st === "done" ? "Completed" : st === "live" ? "Happening now" : "Upcoming"}
                    </span>
                  </span>
                </span>
                <motion.span className="mt-3 block overflow-hidden text-sm leading-6" initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.3, ease: EASE }}>
                  <span className="block font-semibold">{it.when}</span>
                  {it.note && <span className="mt-0.5 block text-xs text-muted">{it.note}</span>}
                </motion.span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-center text-xs text-muted">All times are shown in {tz}.</p>
    </div>
  );
}
