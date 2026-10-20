"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type FormatSlot = { difficulty: "EASY" | "MEDIUM" | "HARD"; count: number; marks: number };

const DIFF = { EASY: { label: "Easy", c: "#16a34a", hint: "Warm-up: shows you can read a problem and code a clean solution." }, MEDIUM: { label: "Medium", c: "#d97706", hint: "Needs a sound approach and care with edge cases." }, HARD: { label: "Hard", c: "#dc2626", hint: "Where rankings are decided: efficiency and clear thinking." } } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The paper at a glance: one card per difficulty with its marks, a bar showing its share of the total that fills in
 * as it scrolls into view, and a share-of-total ring in the stacked bar above. Pick a card to read what it tests.
 */
export function FormatCards({ slots, maxScore, languages }: { slots: FormatSlot[]; maxScore: number; languages: { key: string; label: string }[] }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      {/* the whole paper as one bar, split by difficulty */}
      <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-surface-2" role="img" aria-label={`Marks split: ${slots.map((s) => `${DIFF[s.difficulty].label} ${s.count * s.marks}`).join(", ")}`}>
        {slots.map((s, i) => (
          <motion.span key={s.difficulty} className="h-full" style={{ background: DIFF[s.difficulty].c, opacity: active === i ? 1 : 0.45 }} initial={{ width: 0 }} whileInView={{ width: `${((s.count * s.marks) / maxScore) * 100}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: i * 0.12, ease: EASE }} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {slots.map((s, i) => {
          const d = DIFF[s.difficulty];
          const total = s.count * s.marks;
          const share = Math.round((total / maxScore) * 100);
          const on = active === i;
          return (
            <button
              key={s.difficulty}
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              aria-pressed={on}
              className={cn("[&_:is(p,li)]:text-left [&_:is(p,li)]:hyphens-manual relative overflow-hidden rounded-3xl border bg-surface p-5 text-left outline-none transition-[border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-story-royal", on ? "shadow-[var(--shadow-lift)]" : "border-border-soft hover:shadow-[var(--shadow-soft)]")}
              style={{ borderColor: on ? d.c : undefined }}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1 origin-left transition-transform duration-500" style={{ background: d.c, transform: on ? "scaleX(1)" : "scaleX(0.18)" }} />
              <div className="flex items-center justify-between">
                <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: `${d.c}14`, color: d.c }}>{d.label}</span>
                <span className="text-sm text-muted">{s.count} × {s.marks} marks</span>
              </div>
              <p className="mt-4 text-4xl font-bold tabular-nums tracking-tight">{total}<span className="text-base font-medium text-muted"> marks</span></p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2">
                <motion.div className="h-full rounded-full" style={{ background: d.c }} initial={{ width: 0 }} whileInView={{ width: `${share}%` }} viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: EASE }} />
              </div>
              <p className="mt-2 text-xs text-muted">{share}% of the total</p>
              <motion.p className="overflow-hidden text-left text-sm leading-6 text-muted" initial={false} animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0, marginTop: on ? 12 : 0 }} transition={{ duration: 0.3, ease: EASE }}>{d.hint}</motion.p>
            </button>
          );
        })}
      </div>

      <ul className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Languages you can use">
        {languages.map((l) => <li key={l.key} className="rounded-full border border-border-soft bg-surface px-3.5 py-1.5 text-sm font-medium transition-colors hover:border-story-royal hover:text-story-royal">{l.label}</li>)}
      </ul>
    </div>
  );
}
