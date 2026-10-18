"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { AnimatedCrown } from "@/components/ui/icons/AnimatedCrown";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedStar } from "@/components/ui/icons/AnimatedStar";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Number that counts up once when it scrolls into view. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, { duration: 1.1, ease: "easeOut", onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value, reduced]);
  return <span ref={ref} className={className}>{(reduced ? value : shown).toLocaleString("en-IN")}</span>;
}

const STAT_ICONS = { xp: AnimatedStar, solved: AnimatedSuccess, accuracy: AnimatedTrending, streak: AnimatedFlame };

/** Stat tile with an icon and count-up value. */
export function StatCard({ label, value, hint, icon, color, text }: { label: string; value: number; hint?: string; icon: keyof typeof STAT_ICONS; color: string; text?: string }) {
  const Icon = STAT_ICONS[icon];
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 26 }} className="flex items-center gap-3.5 rounded-3xl border border-border-soft bg-surface p-4 sm:p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
        <Icon className="h-7 w-7" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold tabular-nums text-story-navy dark:text-foreground">{text ?? <CountUp value={value} />}</p>
        <p className="truncate text-xs font-semibold text-muted">{label}</p>
        {hint && <p className="truncate text-[11px] text-muted">{hint}</p>}
      </div>
    </motion.div>
  );
}

/** Activity grid for the last weeks; cells pop in column by column. */
export function ActivityHeatmap({ cells, weeks }: { cells: { key: string; n: number }[]; weeks: number }) {
  const shade = (n: number) => (n === 0 ? "bg-story-mist" : n < 3 ? "bg-story-royal/30" : n < 6 ? "bg-story-royal/60" : "bg-story-royal");
  return (
    <div className="mt-4 rounded-3xl border border-border-soft bg-surface p-4 sm:p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Activity · last {weeks} weeks</p>
      <div className="no-scrollbar overflow-x-auto pb-1">
        <div role="img" aria-label="Practice activity heatmap" className="grid w-max grid-flow-col grid-rows-7 gap-1">
          {cells.map((c, i) => (
            <motion.span
              key={c.key}
              title={`${c.key}: ${c.n} answer${c.n === 1 ? "" : "s"}`}
              className={cn("h-3.5 w-3.5 rounded-[4px]", shade(c.n))}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: Math.floor(i / 7) * 0.025, duration: 0.3 }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted">
        Less {["bg-story-mist", "bg-story-royal/30", "bg-story-royal/60", "bg-story-royal"].map((c) => <span key={c} className={cn("h-3 w-3 rounded-[3px]", c)} />)} More
      </div>
    </div>
  );
}

export type BoardRow = {
  rank: number; userId: string; name: string; avatarColor: string | null; avatarUrl: string | null;
  score: number; xp: number; solved: number; accuracy: number; streak: number; isYou: boolean;
};

const MEDAL = ["#d97706", "#64748b", "#b45309"];

function Avatar({ e, size }: { e: BoardRow; size: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- small user avatar served from our own storage
  if (e.avatarUrl) return <img src={e.avatarUrl} alt="" width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />;
  return (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full font-bold text-white" style={{ width: size, height: size, background: e.avatarColor ?? "#94a3b8", fontSize: size * 0.38 }}>
      {e.name.charAt(0)}
    </span>
  );
}

/**
 * Top three as a podium. All three places are always drawn: an empty place shows a dashed "Open spot" so the podium looks
 * complete (and invites the next learner) even when fewer than three people have scored. The winner wears an animated crown.
 */
export function Podium({ top }: { top: BoardRow[] }) {
  if (top.length === 0) return null;
  const height: Record<number, number> = { 1: 112, 2: 84, 3: 64 };
  // visual order: 2nd, 1st, 3rd
  const slots = [2, 1, 3].map((rank) => ({ rank, e: top.find((x) => x.rank === rank) }));
  return (
    <div className="mx-auto mb-8 grid max-w-xl grid-cols-3 items-end gap-2.5 sm:gap-4" role="list" aria-label="Top three learners">
      {slots.map(({ rank, e }, i) => {
        const size = rank === 1 ? 64 : 52;
        return (
          <motion.div key={rank} role="listitem" className="flex min-w-0 flex-col items-center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.1, duration: 0.6, ease: EASE }}>
            <span className="mb-1 grid h-9 w-9 place-items-center">{rank === 1 && e ? <AnimatedCrown className="h-9 w-9" /> : null}</span>
            {e ? (
              <div className="relative">
                <Avatar e={e} size={size} />
                <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-surface text-[11px] font-bold text-white" style={{ background: MEDAL[rank - 1] }}>{rank}</span>
              </div>
            ) : (
              <span className="grid place-items-center rounded-full border-2 border-dashed border-border-soft text-lg font-bold text-muted" style={{ width: size, height: size }} aria-hidden>?</span>
            )}
            <p className={cn("mt-2.5 max-w-full truncate text-sm font-bold", e ? "text-story-navy dark:text-foreground" : "text-muted")}>{e ? `${e.name}${e.isYou ? " (you)" : ""}` : "Open spot"}</p>
            <p className="text-xs font-semibold tabular-nums text-muted">{e ? `${e.score.toLocaleString("en-IN")} pts` : `Be #${rank}`}</p>
            <motion.div
              className={cn("mt-2 grid w-full place-items-center rounded-t-2xl text-3xl font-black tabular-nums", e ? (rank === 1 ? "bg-story-royal text-white/90" : "bg-[color-mix(in_srgb,var(--story-royal)_16%,var(--surface))] text-story-royal/70") : "border-2 border-b-0 border-dashed border-border-soft bg-story-mist/60 text-muted/40")}
              initial={{ height: 0 }}
              animate={{ height: height[rank] }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: EASE }}
            >
              <span aria-hidden>{rank}</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

function BoardLine({ e, i }: { e: BoardRow; i: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(i, 12) * 0.04, duration: 0.4 }}
      whileHover={{ x: 4 }}
      className={cn("flex items-center gap-3 px-3.5 py-3 transition-colors sm:gap-4 sm:px-5", e.isYou ? "bg-story-royal/[0.07]" : "hover:bg-story-mist/60")}
    >
      <span className="w-7 shrink-0 text-center text-sm font-bold tabular-nums" style={{ color: MEDAL[e.rank - 1] ?? "var(--muted)" }}>{e.rank}</span>
      <Avatar e={e} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{e.name}{e.isYou && <span className="ml-2 rounded-full bg-story-royal px-2 py-0.5 text-[10px] font-bold text-white">You</span>}</p>
        <p className="truncate text-[11px] text-muted sm:hidden">{e.solved} solved · {e.accuracy}% accuracy</p>
      </div>
      <span className="hidden w-16 text-right text-xs tabular-nums text-muted sm:block">{e.xp.toLocaleString("en-IN")} XP</span>
      <span className="hidden w-16 text-right text-xs tabular-nums text-muted sm:block">{e.solved} solved</span>
      <span className="hidden w-14 text-right text-xs tabular-nums text-muted md:block">{e.accuracy}%</span>
      <span className="inline-flex w-11 shrink-0 items-center justify-end gap-1 text-xs tabular-nums text-muted">
        {e.streak > 0 ? <><AnimatedFlame className="h-4 w-4" />{e.streak}</> : "–"}
      </span>
      <span className="w-14 shrink-0 text-right text-sm font-bold tabular-nums text-story-royal">{e.score.toLocaleString("en-IN")}</span>
    </motion.li>
  );
}

/** Ranked list (everyone below the podium on the full board, or a compact top list on the home page). */
export function BoardList({ rows, me, showHeader }: { rows: BoardRow[]; me?: BoardRow | null; showHeader?: boolean }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border-soft bg-surface">
      {showHeader && (
        <div className="hidden items-center gap-4 border-b border-border-soft bg-story-mist px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted sm:flex">
          <span className="w-7 text-center">#</span><span className="w-9" /><span className="flex-1">Learner</span>
          <span className="w-16 text-right">XP</span><span className="w-16 text-right">Solved</span><span className="hidden w-14 text-right md:block">Acc.</span><span className="w-11 text-right">Streak</span><span className="w-14 text-right">Score</span>
        </div>
      )}
      <ol className="divide-y divide-border-soft">
        {rows.map((e, i) => <BoardLine key={e.userId} e={e} i={i} />)}
        {me && (
          <>
            <li aria-hidden className="py-1 text-center text-xs text-muted">···</li>
            <BoardLine e={me} i={rows.length} />
          </>
        )}
      </ol>
    </div>
  );
}

const PERIODS = [{ id: "week", label: "Weekly" }, { id: "month", label: "Monthly" }, { id: "all", label: "All time" }];

/** Sliding pill tabs; each tab is a real link so the board stays server-rendered per period. */
export function PeriodTabs({ active }: { active: string }) {
  return (
    <div role="tablist" aria-label="Time period" className="inline-flex rounded-full bg-story-mist p-1">
      {PERIODS.map((p) => (
        <Link key={p.id} role="tab" aria-selected={p.id === active} href={`/logiquest/leaderboard?period=${p.id}`} scroll={false} className={cn("relative rounded-full px-4 py-2 text-sm font-semibold transition-colors", p.id === active ? "text-white" : "text-muted hover:text-story-royal")}>
          {p.id === active && <motion.span layoutId="lq-period" className="absolute inset-0 rounded-full bg-story-royal" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative">{p.label}</span>
        </Link>
      ))}
    </div>
  );
}
