"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { cn } from "@/lib/cn";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Props = {
  /** "YYYY-MM-DD" keys of days the user was active, ascending. */
  activeDays: string[];
  /** Today's key in the platform timezone, computed server-side. */
  todayKey: string;
  currentStreak: number;
  longestStreak: number;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function StreakCalendar({ activeDays, todayKey, currentStreak, longestStreak }: Props) {
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

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">
          {MONTHS[view.month - 1]} {view.year}
        </p>
        <div className="flex items-center gap-1">
          <NavButton onClick={() => moveMonth(-1)} disabled={atEarliest} label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </NavButton>
          <NavButton onClick={() => moveMonth(1)} disabled={atCurrent} label="Next month">
            <ChevronRight className="h-4 w-4" />
          </NavButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((d) => (
          <span key={d} className="pb-1 text-[10px] font-medium uppercase tracking-wide text-muted">
            {d}
          </span>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${view.year}-${view.month}`}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="grid grid-cols-7 gap-1"
        >
          {cells.map((day, i) => {
            if (day === null) return <span key={`pad-${i}`} />;
            const key = `${view.year}-${pad(view.month)}-${pad(day)}`;
            const isActive = activeSet.has(key);
            const isToday = key === todayKey;
            const isFuture = key > todayKey;
            return (
              <span
                key={key}
                title={isActive ? `Active on ${day} ${MONTHS[view.month - 1].slice(0, 3)}` : undefined}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-xs transition-colors",
                  isActive
                    ? "bg-brand-500 font-semibold text-white"
                    : isFuture
                      ? "text-muted/40"
                      : "text-muted hover:bg-surface-2",
                  isToday && "ring-2 ring-brand-400 ring-offset-1 ring-offset-surface",
                )}
              >
                {day}
              </span>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between border-t border-surface-2 pt-3 text-xs">
        <span className="flex items-center gap-1.5 font-medium">
          <AnimatedFlame className="h-4 w-4" />
          {currentStreak} day{currentStreak === 1 ? "" : "s"} current
        </span>
        <span className="text-muted">Best: {longestStreak} day{longestStreak === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
}

function NavButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        disabled ? "cursor-not-allowed text-muted/30" : "text-muted hover:bg-surface-2 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
