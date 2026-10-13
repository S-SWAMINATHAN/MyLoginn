"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { ArrowUpRight, Check, CheckCircle2, Flame, Target, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/cn";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/lib/useReducedMotion";

const ACCENTS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#e11d48", "#0891b2"];
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

/** Flat code-editor preview with typing lines, a passing test run and floating XP / streak chips. */
export function LogiQuestHeroVisual() {
  const reduced = useReducedMotion();
  const lines = [
    { w: "46%", c: "#7c3aed", indent: 0 },
    { w: "62%", c: "#2563eb", indent: 1 },
    { w: "38%", c: "#059669", indent: 1 },
    { w: "54%", c: "#2563eb", indent: 2 },
    { w: "30%", c: "#d97706", indent: 1 },
    { w: "42%", c: "#7c3aed", indent: 0 },
  ];
  return (
    <div className="relative mx-auto w-full max-w-md">
      <motion.div
        animate={reduced ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-[var(--shadow-lift)]"
      >
        <div className="flex items-center gap-2 border-b border-border-soft bg-story-mist px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-[11px] font-semibold text-muted">two_sum.py</span>
        </div>
        <div className="space-y-3 px-5 py-5">
          {lines.map((l, i) => (
            <div key={i} className="flex items-center gap-3" style={{ paddingLeft: l.indent * 18 }}>
              <span className="w-3 text-[10px] tabular-nums text-muted">{i + 1}</span>
              <motion.span
                className="h-2.5 rounded-full"
                style={{ background: l.c, opacity: 0.85 }}
                initial={{ width: 0 }}
                animate={{ width: l.w }}
                transition={{ delay: 0.3 + i * 0.18, duration: 0.7, ease: EASE }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-soft px-5 py-3.5">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.span
                key={i}
                className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.6 + i * 0.12, type: "spring", stiffness: 420, damping: 18 }}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </motion.span>
            ))}
          </div>
          <span className="text-xs font-bold text-emerald-600">5 / 5 tests passed</span>
        </div>
      </motion.div>

      <motion.span
        className="absolute -right-2 -top-4 inline-flex items-center gap-1.5 rounded-full bg-story-royal px-3.5 py-2 text-xs font-bold text-white shadow-[var(--shadow-lift)] sm:-right-5"
        animate={reduced ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Zap className="h-3.5 w-3.5" /> +20 XP
      </motion.span>
      <motion.span
        className="absolute -bottom-4 -left-2 inline-flex items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3.5 py-2 text-xs font-bold text-story-navy shadow-[var(--shadow-lift)] sm:-left-5 dark:text-foreground"
        animate={reduced ? undefined : { y: [0, 7, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Flame className="h-3.5 w-3.5 text-orange-500" /> 7 day streak
      </motion.span>
    </div>
  );
}

const CATEGORY_ICON: Record<string, string> = {
  coding: "python",
  "problem-solving": "testing",
  logic: "ai",
  math: "math",
  communication: "comm",
  knowledge: "business",
};

export type CategoryItem = { id: string; slug: string; label: string; desc: string; live: boolean };

/** Practice categories as animated cards with the same icon set used on course cards. */
export function CategoryGrid({ items }: { items: CategoryItem[] }) {
  return (
    <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
      {items.map((c, i) => {
        const color = ACCENTS[i % ACCENTS.length];
        const body = (
          <>
            <span className="grid h-14 w-14 place-items-center">
              <ContentIcon keyword={CATEGORY_ICON[c.slug] ?? "default"} className="h-full w-full" />
            </span>
            <p className="mt-4 text-base font-bold text-story-navy dark:text-foreground">{c.label}</p>
            <p className="mt-1 text-sm leading-6 text-muted">{c.desc}</p>
            {c.live ? (
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold" style={{ color }}>
                Practice now <ArrowUpRight className="h-4 w-4" />
              </span>
            ) : (
              <span className="mt-4 inline-block rounded-full bg-story-mist px-3 py-1 text-xs font-semibold text-muted">In development</span>
            )}
          </>
        );
        const cls = "group block h-full rounded-3xl border border-border-soft bg-surface p-5 outline-none focus-visible:border-story-royal focus-visible:ring-2 focus-visible:ring-story-royal/30";
        return (
          <RevealItem key={c.id}>
            {c.live ? (
              <Link href={`/logiquest/${c.slug}`} className={cls}>{body}</Link>
            ) : (
              <div aria-disabled className={cn(cls, "opacity-70")}>{body}</div>
            )}
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}

const STAT_ICONS = { xp: Zap, solved: CheckCircle2, accuracy: Target, streak: Flame };

/** Stat tile with an icon and count-up value. */
export function StatCard({ label, value, hint, icon, color, text }: { label: string; value: number; hint?: string; icon: keyof typeof STAT_ICONS; color: string; text?: string }) {
  const Icon = STAT_ICONS[icon];
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 400, damping: 26 }} className="flex items-center gap-3.5 rounded-3xl border border-border-soft bg-surface p-4 sm:p-5">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}>
        <Icon className="h-5 w-5" />
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
        <div role="img" aria-label="Submission activity heatmap" className="grid w-max grid-flow-col grid-rows-7 gap-1">
          {cells.map((c, i) => (
            <motion.span
              key={c.key}
              title={`${c.key}: ${c.n} submission${c.n === 1 ? "" : "s"}`}
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

/** Top three as a podium: blocks rise in sequence, the winner gets a crown-coloured block. */
export function Podium({ top }: { top: BoardRow[] }) {
  if (top.length === 0) return null;
  // visual order: 2nd, 1st, 3rd
  const order = [top[1], top[0], top[2]].filter(Boolean) as BoardRow[];
  const height: Record<number, number> = { 1: 132, 2: 100, 3: 78 };
  return (
    <div className="mb-6 flex items-end justify-center gap-2.5 sm:gap-4" role="list" aria-label="Top three learners">
      {order.map((e, i) => (
        <motion.div
          key={e.userId}
          role="listitem"
          className="flex w-full max-w-[9.5rem] flex-col items-center"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.12, duration: 0.6, ease: EASE }}
        >
          <div className="relative">
            <Avatar e={e} size={e.rank === 1 ? 64 : 52} />
            <span className="absolute -bottom-1.5 -right-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-surface text-[11px] font-bold text-white" style={{ background: MEDAL[e.rank - 1] }}>{e.rank}</span>
            {e.rank === 1 && <Trophy className="absolute -top-5 left-1/2 h-5 w-5 -translate-x-1/2" style={{ color: MEDAL[0] }} />}
          </div>
          <p className="mt-2.5 max-w-full truncate text-sm font-bold text-story-navy dark:text-foreground">{e.name}{e.isYou ? " (you)" : ""}</p>
          <p className="text-xs font-semibold tabular-nums text-muted">{e.score.toLocaleString("en-IN")} pts</p>
          <motion.div
            className="mt-2 w-full rounded-t-2xl"
            style={{ background: e.rank === 1 ? "var(--story-royal)" : "color-mix(in srgb, var(--story-royal) 18%, var(--surface))" }}
            initial={{ height: 0 }}
            animate={{ height: height[e.rank] }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease: EASE }}
          />
        </motion.div>
      ))}
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
        {e.streak > 0 ? <><Flame className="h-3.5 w-3.5 text-orange-500" />{e.streak}</> : "–"}
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
