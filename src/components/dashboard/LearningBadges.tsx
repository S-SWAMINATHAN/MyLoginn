"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedReward } from "@/components/ui/icons/AnimatedReward";
import { cn } from "@/lib/cn";

export type Badge = {
  id: string;
  title: string;
  description: string;
  /** "flame" and "reward" use the streak and rewards artwork; anything else is a ContentIcon keyword. */
  icon: string;
  current: number;
  target: number;
  color: string;
};

function BadgeIcon({ icon, className }: { icon: string; className?: string }) {
  if (icon === "flame") return <AnimatedFlame className={className} />;
  if (icon === "reward") return <AnimatedReward className={className} />;
  return <ContentIcon keyword={icon} className={className} />;
}

const R = 32;
const C = 2 * Math.PI * R;

/**
 * Learning badges earned from activity on the platform. Unlocked badges are full colour; locked ones are muted with a
 * ring showing how close you are. Select a badge to read what it takes.
 */
export function LearningBadges({ badges, bare }: { badges: Badge[]; bare?: boolean }) {
  const unlocked = badges.filter((b) => b.current >= b.target).length;
  const [selected, setSelected] = useState<string | null>(null);
  const sel = badges.find((b) => b.id === selected) ?? null;

  return (
    <section aria-labelledby="badges-title">
      {bare ? (
        <p className="mb-2 text-xs text-muted"><span className="font-bold text-story-royal">{unlocked}</span> of {badges.length} unlocked</p>
      ) : (
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <span className="story-eyebrow">Achievements</span>
          <h2 id="badges-title" className="mt-0.5 text-base font-bold text-story-navy dark:text-foreground">Learning badges</h2>
        </div>
        <span className="rounded-full bg-story-mist px-3 py-1 text-xs font-semibold">
          <span className="text-story-royal">{unlocked}</span> of {badges.length} unlocked
        </span>
      </div>
      )}

      <div className={bare ? "" : "rounded-2xl border border-border-soft bg-surface p-3 sm:p-4"}>
        <ul className={bare ? "grid grid-cols-5 gap-x-1.5 gap-y-2" : "grid grid-cols-5 gap-x-2 gap-y-3 sm:grid-cols-10"}>
          {badges.map((b, i) => {
            const done = b.current >= b.target;
            const pct = Math.min(100, Math.round((b.current / b.target) * 100));
            const on = selected === b.id;
            return (
              <motion.li key={b.id} initial={{ opacity: 0, y: 14, scale: 0.92 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 22 }}>
                <button type="button" onClick={() => setSelected(on ? null : b.id)} aria-pressed={on} aria-label={`${b.title}: ${done ? "unlocked" : `${b.current} of ${b.target}`}`} className="group flex w-full flex-col items-center gap-1 outline-none">
                  <motion.span whileHover={{ y: -4, scale: 1.06 }} transition={{ type: "spring", stiffness: 320, damping: 18 }} className="relative grid h-9 w-9 place-items-center">
                    <svg viewBox="0 0 72 72" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
                      <circle cx="36" cy="36" r={R} fill={done ? `color-mix(in srgb, ${b.color} 12%, transparent)` : "none"} stroke="var(--story-mist)" strokeWidth="4" />
                      <motion.circle
                        cx="36"
                        cy="36"
                        r={R}
                        fill="none"
                        stroke={b.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={C}
                        initial={{ strokeDashoffset: C }}
                        whileInView={{ strokeDashoffset: C * (1 - pct / 100) }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </svg>
                    <span className={cn("relative grid h-5 w-5 place-items-center transition-all duration-300", done ? "" : "opacity-45 grayscale group-hover:opacity-80 group-hover:grayscale-0")}>
                      <BadgeIcon icon={b.icon} className="h-5 w-5" />
                    </span>
                    {done && (
                      <span aria-hidden className="absolute -bottom-0.5 -right-0.5 grid h-3.5 w-3.5 place-items-center rounded-full bg-emerald-500 text-[8px] font-bold text-white ring-2 ring-surface">✓</span>
                    )}
                  </motion.span>
                  <span className={cn("line-clamp-2 text-center text-[8px] font-semibold leading-tight", done ? "text-foreground" : "text-muted")}>{b.title}</span>
                </button>
              </motion.li>
            );
          })}
        </ul>

        <AnimatePresence initial={false}>
          {sel && (
            <motion.div key={sel.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden" aria-live="polite">
              <div className="mt-3 flex items-center gap-3 border-t border-border-soft pt-3">
                <BadgeIcon icon={sel.icon} className="h-9 w-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{sel.title}</p>
                  <p className="mt-0.5 text-xs text-muted">{sel.description}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-story-mist">
                      <motion.div className="h-full rounded-full" style={{ background: sel.color }} initial={{ width: 0 }} animate={{ width: `${Math.min(100, (sel.current / sel.target) * 100)}%` }} transition={{ duration: 0.6 }} />
                    </div>
                    <span className="font-mono text-xs tabular-nums text-muted">{Math.min(sel.current, sel.target)}/{sel.target}</span>
                  </div>
                </div>
                <span className={cn("hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:inline", sel.current >= sel.target ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-story-mist text-muted")}>
                  {sel.current >= sel.target ? "Unlocked" : "Locked"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
