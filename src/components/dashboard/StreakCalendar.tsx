"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MILESTONES = [3, 7, 14, 30, 60, 100];

type Props = {
  /** "YYYY-MM-DD" keys of days the user was active, ascending. */
  activeDays: string[];
  /** Today's key in the platform timezone, computed server-side. */
  todayKey: string;
  currentStreak: number;
  longestStreak: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Compact month view of login activity. Consecutive active days within a week merge into one capsule bar, so a streak
 * reads as a single run; today carries a marker dot. A flame counter heads the card and a bar tracks the next milestone.
 */
export function StreakCalendar({ activeDays, todayKey, currentStreak, longestStreak }: Props) {
  const reduced = useReducedMotion();
  const [ty, tm] = todayKey.split("-").map(Number);
  const [view, setView] = useState({ year: ty, month: tm }); // month is 1-based
  const [direction, setDirection] = useState(0);

  const activeSet = useMemo(() => new Set(activeDays), [activeDays]);

  const earliest = activeDays[0] ?? todayKey;
  const [ey, em] = earliest.split("-").map(Number);
  const atEarliest = view.year === ey && view.month === em;
  const atCurrent = view.year === ty && view.month === tm;

  const moveMonth = (delta: number) => {
    setDirection(delta);
    setView((v) => {
      const next = new Date(v.year, v.month - 1 + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() + 1 };
    });
  };

  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
  const daysInMonth = new Date(view.year, view.month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const keyOf = (day: number) => `${view.year}-${pad(view.month)}-${pad(day)}`;
  const monthActive = Array.from({ length: daysInMonth }, (_, i) => activeSet.has(keyOf(i + 1))).filter(Boolean).length;

  const nextMilestone = MILESTONES.find((m) => m > currentStreak) ?? MILESTONES[MILESTONES.length - 1];
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= currentStreak) ?? 0;
  const pct = Math.min(100, Math.round(((currentStreak - prevMilestone) / Math.max(1, nextMilestone - prevMilestone)) * 100));
  const remaining = Math.max(0, nextMilestone - currentStreak);

  return (
    <div className="mx-auto w-full max-w-[15rem]">
      {/* streak counter + month navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <AnimatedFlame className="h-7 w-7" />
          <div className="leading-none">
            <p className="text-xl font-bold tabular-nums text-story-navy dark:text-foreground">{currentStreak}</p>
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted">day streak</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <NavButton onClick={() => moveMonth(-1)} disabled={atEarliest} label="Previous month"><ChevronLeft className="h-3.5 w-3.5" /></NavButton>
          <NavButton onClick={() => moveMonth(1)} disabled={atCurrent} label="Next month"><ChevronRight className="h-3.5 w-3.5" /></NavButton>
        </div>
      </div>

      <p className="mb-2 mt-2 flex items-center justify-between text-[11px]">
        <span className="font-bold text-story-navy dark:text-foreground">{MONTHS[view.month - 1]} {view.year}</span>
        <span className="text-muted">{monthActive} active</span>
      </p>

      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="pb-1 text-[9px] font-semibold uppercase text-muted">{d}</span>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${view.year}-${view.month}`}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid grid-cols-7 gap-y-1"
        >
          {cells.map((day, i) => {
            if (day === null) return <span key={`pad-${i}`} />;
            const key = keyOf(day);
            const isActive = activeSet.has(key);
            const isToday = key === todayKey;
            const isFuture = key > todayKey;
            const col = (firstWeekday + day - 1) % 7;
            const joinLeft = isActive && col > 0 && day > 1 && activeSet.has(keyOf(day - 1));
            const joinRight = isActive && col < 6 && day < daysInMonth && activeSet.has(keyOf(day + 1));
            return (
              <motion.span
                key={key}
                initial={reduced ? false : { opacity: 0, scaleY: 0.5 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: reduced ? 0 : Math.min(i, 30) * 0.01, type: "spring", stiffness: 380, damping: 24 }}
                title={isActive ? `Active on ${day} ${MONTHS[view.month - 1].slice(0, 3)}` : isToday ? "Today" : undefined}
                className={cn(
                  "relative grid h-6 place-items-center text-[10px] transition-colors",
                  isActive
                    ? cn("bg-story-royal font-bold text-white", !joinLeft && "rounded-l-full", !joinRight && "rounded-r-full")
                    : isFuture
                      ? "text-muted/40"
                      : "rounded-full text-muted hover:bg-story-mist",
                  isToday && !isActive && "font-bold text-story-royal"
                )}
              >
                {day}
                {isToday && (
                  <span aria-hidden className={cn("absolute bottom-[1px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full", isActive ? "bg-white" : "bg-story-royal")} />
                )}
              </motion.span>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-2.5 border-t border-border-soft pt-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted">Best <span className="font-bold text-foreground">{longestStreak} day{longestStreak === 1 ? "" : "s"}</span></span>
          <span className="text-muted">Next <span className="font-bold text-foreground">{nextMilestone} days</span></span>
        </div>
        <div className="mt-1.5" role="img" aria-label={`${pct}% of the way to a ${nextMilestone}-day streak`}>
          <div className="h-1.5 overflow-hidden rounded-full bg-story-mist">
            <motion.div className="h-full rounded-full bg-story-royal" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
          </div>
          <p className="mt-1 text-[10px] text-muted">
            {remaining > 0 ? <><span className="font-semibold text-foreground">{remaining} more {remaining === 1 ? "day" : "days"}</span> to the next badge</> : `You have reached the ${nextMilestone}-day milestone`}
          </p>
        </div>
      </div>
    </div>
  );
}

function NavButton({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-6 w-6 place-items-center rounded-full transition-all",
        disabled ? "cursor-not-allowed text-muted/30" : "text-muted hover:bg-story-royal hover:text-white active:scale-90"
      )}
    >
      {children}
    </button>
  );
}
