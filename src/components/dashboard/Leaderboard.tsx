"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Medal, Trophy } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedReward } from "@/components/ui/icons/AnimatedReward";
import { cn } from "@/lib/cn";
import type { LeaderboardData, LeaderboardEntry } from "@/lib/leaderboard";

const EASE = [0.16, 1, 0.3, 1] as const;
const TABS = [
  { key: "week", label: "This week" },
  { key: "all", label: "All time" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// Rank and score colours, from first place down.
const RANK_COLORS = ["#d97706", "#ea580c", "#dc2626", "#0b4f7a", "#0e8a95"];
const colorFor = (rank: number) => RANK_COLORS[rank - 1] ?? "#0b4f7a";

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return { n, suffix: s[(v - 20) % 10] || s[v] || s[0] };
}

/** Navy ribbon with folded tails, drawn as one flat SVG so it scales with the card. */
function Ribbon({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <svg viewBox="0 0 900 130" className="h-auto w-full" aria-hidden preserveAspectRatio="xMidYMid meet">
        {/* tails */}
        <path d="M0 40 H190 V118 H0 L92 79 Z" fill="var(--story-navy)" />
        <path d="M900 40 H710 V118 H900 L808 79 Z" fill="var(--story-navy)" />
        {/* folds */}
        <path d="M190 90 H260 V118 H190 Z" fill="#071a42" />
        <path d="M710 90 H640 V118 H710 Z" fill="#071a42" />
        {/* banner */}
        <path d="M230 8 H670 Q684 8 684 22 V92 H216 V22 Q216 8 230 8 Z" fill="var(--story-navy)" />
      </svg>
      <div className="absolute inset-x-0 top-[6%] flex h-[62%] items-center justify-center">{children}</div>
    </div>
  );
}

function RankCell({ rank }: { rank: number }) {
  const { n, suffix } = ordinal(rank);
  const color = colorFor(rank);
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="grid h-6 w-6 shrink-0 place-items-center">
        {rank === 1 ? (
          <Trophy className="h-5 w-5" style={{ color: "#f5b301", fill: "#fcd34d" }} strokeWidth={1.6} aria-hidden />
        ) : rank <= 3 ? (
          <Medal className="h-5 w-5" style={{ color: rank === 2 ? "#94a3b8" : "#b45309", fill: rank === 2 ? "#e2e8f0" : "#fcd9a8" }} strokeWidth={1.6} aria-hidden />
        ) : null}
      </span>
      <span className="w-9 text-left text-sm font-bold leading-none tabular-nums" style={{ color }}>
        {n}
        <sup className="ml-0.5 text-[9px] font-bold">{suffix}</sup>
      </span>
    </div>
  );
}

function Row({ entry, index }: { entry: LeaderboardEntry; index: number }) {
  const color = colorFor(entry.rank);
  return (
    <motion.li
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.4, ease: EASE }}
      whileHover={{ x: 3 }}
      className={cn("grid grid-cols-[4.75rem_minmax(0,1fr)_4.5rem] items-center border-b border-border-soft last:border-b-0", entry.isYou && "outline outline-2 -outline-offset-2 outline-story-royal/50")}
    >
      <div className="border-r border-border-soft py-1"><RankCell rank={entry.rank} /></div>
      <div className="flex min-w-0 items-center gap-2 border-r border-border-soft px-2 py-1">
        <Avatar name={entry.name} avatarColor={entry.avatarColor} avatarUrl={entry.avatarUrl} size={24} className="h-6 w-6 shrink-0 rounded-full" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[11px] font-bold">{entry.isYou ? `${entry.name} (you)` : entry.name}</p>
          <p className="flex items-center gap-1 truncate text-[10px] italic text-muted">
            <AnimatedFlame className="h-3 w-3 shrink-0" />
            {entry.streak} day streak
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center gap-1 px-1 py-1">
        <AnimatedReward className="hidden h-3.5 w-3.5 shrink-0 sm:block" />
        <span className="text-xs font-bold tabular-nums" style={{ color: entry.rank <= 5 ? color : "var(--foreground)" }}>{entry.points.toLocaleString("en-IN")}</span>
      </div>
    </motion.li>
  );
}

/**
 * Learning leaderboard as a ribbon-headed table: rank with trophy or medals, learner with their login streak, and
 * points earned. Names are shortened to first name and last initial. Your own row is outlined, and pinned underneath
 * when you are outside the top ten.
 */
export function Leaderboard({ week, all, bare }: { week: LeaderboardData; all: LeaderboardData; bare?: boolean }) {
  const [tab, setTab] = useState<TabKey>("week");
  const [expanded, setExpanded] = useState(false);
  const data = tab === "week" ? week : all;

  return (
    <section aria-labelledby="leaderboard-title">
      {bare ? (
        <h2 id="leaderboard-title" className="sr-only">Leaderboard</h2>
      ) : (
        <Ribbon>
          <h2 id="leaderboard-title" className="text-base font-bold tracking-tight text-white sm:text-xl">Leaderboard</h2>
        </Ribbon>
      )}

      <div className={bare ? "flex justify-center" : "mt-2 flex justify-center"}>
        <div role="tablist" aria-label="Leaderboard period" className="relative flex rounded-full bg-story-mist p-1">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} className={cn("relative rounded-full px-4 py-1.5 text-xs font-semibold transition-colors", tab === t.key ? "text-white" : "text-muted hover:text-story-royal")}>
              {tab === t.key && <motion.span layoutId="lb-tab" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-3 max-w-md overflow-hidden rounded-xl border border-border-soft bg-surface">
        {/* header row */}
        <div className="grid grid-cols-[4.75rem_minmax(0,1fr)_4.5rem] border-b-2 border-story-navy text-center text-[11px] font-bold" style={{ color: "#0b6b73" }}>
          <div className="border-r border-border-soft py-1.5">Rank</div>
          <div className="border-r border-border-soft py-1.5">Name</div>
          <div className="py-1.5">Score</div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {data.top.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="font-semibold">No points yet {tab === "week" ? "this week" : ""}</p>
                <p className="mt-1 text-sm text-muted">Log in daily, enrol in courses and complete lessons to earn points and appear here.</p>
              </div>
            ) : (
              <>
                <ol aria-label="Top learners">
                  {data.top.slice(0, expanded ? 10 : 5).map((e, i) => <Row key={e.userId} entry={e} index={i} />)}
                </ol>
                {data.me && (
                  <div className="border-t-2 border-dashed border-border-soft">
                    <p className="px-3 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">Your position</p>
                    <ol><Row entry={data.me} index={0} /></ol>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {data.top.length > 5 && (
        <div className="mt-2 flex justify-center">
          <button type="button" onClick={() => setExpanded((e) => !e)} className="rounded-full bg-story-mist px-3 py-1 text-[11px] font-semibold text-story-royal transition-all hover:-translate-y-0.5 hover:bg-story-royal hover:text-white active:scale-95">
            {expanded ? "Show top 5" : `Show top ${Math.min(10, data.top.length)}`}
          </button>
        </div>
      )}
      {data.top.length > 0 && <p className="mt-2 text-center text-[10px] text-muted">Ranked by points earned · {data.totalLearners} {data.totalLearners === 1 ? "learner" : "learners"} on the board</p>}
    </section>
  );
}
