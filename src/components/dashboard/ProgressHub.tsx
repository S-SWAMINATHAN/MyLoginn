"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedReward } from "@/components/ui/icons/AnimatedReward";
import { AnimatedCrown } from "@/components/ui/icons/AnimatedCrown";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { LearningBadges, type Badge } from "@/components/dashboard/LearningBadges";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { cn } from "@/lib/cn";
import type { LeaderboardData } from "@/lib/leaderboard";

const TABS = [
  { key: "streak", label: "Streak", Icon: AnimatedFlame },
  { key: "badges", label: "Badges", Icon: AnimatedReward },
  { key: "board", label: "Board", Icon: AnimatedCrown },
] as const;
type TabKey = (typeof TABS)[number]["key"];

type Props = {
  streak: { activeDays: string[]; todayKey: string; currentStreak: number; longestStreak: number };
  badges: Badge[];
  week: LeaderboardData;
  all: LeaderboardData;
};

/**
 * One compact card for the login streak calendar, learning badges and leaderboard. A sliding tab bar switches between
 * them, so all three take the space of a single small widget.
 */
export function ProgressHub({ streak, badges, week, all }: Props) {
  const [tab, setTab] = useState<TabKey>("streak");
  const unlocked = badges.filter((b) => b.current >= b.target).length;

  return (
    <div className="rounded-2xl border border-border-soft bg-surface p-2.5">
      <div role="tablist" aria-label="Progress" className="relative grid grid-cols-3 rounded-full bg-story-mist p-1">
        {TABS.map(({ key, label, Icon }) => {
          const on = tab === key;
          return (
            <button key={key} type="button" role="tab" id={`hub-tab-${key}`} aria-selected={on} aria-controls="hub-panel" onClick={() => setTab(key)} className={cn("relative flex items-center justify-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors", on ? "text-story-navy dark:text-foreground" : "text-muted hover:text-story-royal")}>
              {on && <motion.span layoutId="hub-pill" className="absolute inset-0 rounded-full bg-surface shadow-[0_4px_12px_-6px_rgba(11,31,77,0.4)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <Icon className="relative h-3.5 w-3.5" />
              <span className="relative">{label}</span>
              {key === "badges" && <span className="relative rounded-full bg-story-royal/10 px-1.5 text-[10px] font-bold tabular-nums text-story-royal">{unlocked}</span>}
            </button>
          );
        })}
      </div>

      <div id="hub-panel" role="tabpanel" aria-labelledby={`hub-tab-${tab}`} className="mt-2.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            {tab === "streak" && <StreakCalendar {...streak} />}
            {tab === "badges" && <LearningBadges badges={badges} bare />}
            {tab === "board" && <Leaderboard week={week} all={all} bare />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
