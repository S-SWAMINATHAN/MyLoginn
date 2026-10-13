"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { PlanButton } from "@/components/ui/PlanButton";
import { openProjectRequest } from "@/components/services/ProjectRequestModal";
import { Caption, Chip, MonitorFrame } from "@/components/services/testing/TestingVisuals";

const BLUE = "#2563eb";
const VIOLET = "#7c3aed";
const GREEN = "#059669";
const AMBER = "#d97706";
const ROSE = "#e11d48";

export function PlanMarketingButton() {
  return <PlanButton label="Plan your marketing campaign" onClick={() => openProjectRequest("marketing")} />;
}

/* ---------- 1. Campaign dashboard (hero) ---------- */

const CHANNELS = [
  { key: "All channels", color: BLUE, bars: [38, 52, 44, 66, 58, 78, 70, 88, 76, 94, 84, 100], metrics: ["Impressions", "Clicks", "Enquiries"] },
  { key: "Search", color: GREEN, bars: [20, 28, 34, 40, 48, 52, 60, 64, 72, 76, 84, 90], metrics: ["Searches", "Visits", "Enquiries"] },
  { key: "Social", color: VIOLET, bars: [60, 48, 72, 56, 80, 64, 88, 70, 92, 74, 96, 82], metrics: ["Reach", "Engagement", "Enquiries"] },
  { key: "Paid ads", color: AMBER, bars: [30, 44, 40, 58, 52, 70, 64, 82, 76, 88, 80, 98], metrics: ["Impressions", "Clicks", "Enquiries"] },
];

export function CampaignDashboardMonitor() {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced || !auto) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % CHANNELS.length), 3200);
    return () => window.clearInterval(id);
  }, [reduced, auto]);

  const ch = CHANNELS[i];
  return (
    <MonitorFrame
      interactive
      title="campaign-dashboard · sample data"
      label={`${ch.key} · illustrative`}
      pill="Growth Marketing"
      ariaLabel="Illustrative campaign dashboard. Choose a channel to see its sample trend."
      controls={CHANNELS.map((c, idx) => (
        <Chip key={c.key} active={idx === i} onClick={() => { setAuto(false); setI(idx); }}>{c.key}</Chip>
      ))}
    >
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-3 gap-2">
          {ch.metrics.map((m, idx) => (
            <div key={m} className="rounded-lg border border-border-soft px-2.5 py-2">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted">{m}</p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-story-mist">
                <motion.div key={ch.key + m} className="h-full rounded-full" style={{ background: ch.color }} initial={{ width: 0 }} animate={{ width: `${55 + ((idx * 17 + i * 11) % 40)}%` }} transition={{ duration: 0.7 }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-1 items-end gap-1.5">
          {ch.bars.map((h, idx) => (
            <motion.div
              key={idx}
              className="flex-1 rounded-t-md"
              style={{ background: ch.color, opacity: 0.35 + (idx / ch.bars.length) * 0.65 }}
              initial={false}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: idx * 0.025 }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted"><span>Week 1</span><span>Week 12</span></div>
      </div>
    </MonitorFrame>
  );
}

/* ---------- 2. Content calendar ---------- */

const PLATFORMS = [
  { key: "Instagram", color: ROSE },
  { key: "Facebook", color: BLUE },
  { key: "YouTube", color: AMBER },
  { key: "LinkedIn", color: VIOLET },
];
const BOARD_POSTS = [
  { id: "reel", platform: "Instagram", title: "Product reel", time: "Mon 10:00" },
  { id: "article", platform: "LinkedIn", title: "Industry article", time: "Tue 09:30" },
  { id: "offer", platform: "Facebook", title: "Seasonal offer", time: "Wed 12:00" },
  { id: "video", platform: "YouTube", title: "How-to video", time: "Thu 17:00" },
  { id: "carousel", platform: "Instagram", title: "Customer carousel", time: "Fri 11:00" },
  { id: "event", platform: "Facebook", title: "Event invite", time: "Sat 10:00" },
];
const STAGES = [
  { name: "Scheduled", color: "#64748b" },
  { name: "Publishing", color: BLUE },
  { name: "Live", color: GREEN },
];

function PostCard({ post, stage, dim }: { post: (typeof BOARD_POSTS)[number]; stage: number; dim: boolean }) {
  const color = PLATFORMS.find((p) => p.key === post.platform)!.color;
  return (
    <motion.div
      layout
      layoutId={post.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: dim ? 0.25 : 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      className="relative overflow-hidden rounded-xl border border-border-soft bg-surface p-1.5 shadow-sm"
      style={stage === 1 ? { borderColor: BLUE } : undefined}
    >
      <div className="flex items-center gap-1.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)` }}>
          <span className="h-3 w-3 rounded-full" style={{ background: color }} />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[10px] font-bold text-foreground">{post.title}</p>
          <p className="truncate text-[8px] text-muted">{post.platform} · {post.time}</p>
        </div>
        {stage === 2 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px] font-bold text-white" style={{ background: GREEN }}>✓</motion.span>}
      </div>
      {stage === 1 && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-story-mist">
          <motion.div className="h-full rounded-full" style={{ background: BLUE }} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1, ease: "easeInOut" }} />
        </div>
      )}
    </motion.div>
  );
}

export function ContentCalendarMonitor() {
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const total = BOARD_POSTS.length;

  // Posts move Scheduled -> Publishing -> Live, one after another, then the board resets and replays.
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % (total + 3)), 1100);
    return () => window.clearInterval(id);
  }, [reduced, total]);

  const t = reduced ? total + 2 : tick;
  const stageOf = (i: number) => (t < i + 1 ? 0 : t === i + 1 ? 1 : 2);
  const columns = STAGES.map((_, st) => BOARD_POSTS.map((p, i) => ({ p, i })).filter(({ i }) => stageOf(i) === st));
  columns[2].reverse(); // newest live post on top
  const visibleCount = [3, 2, 3];

  return (
    <MonitorFrame
      interactive
      title="content-planner · pipeline"
      label={filter ? `${filter} posts` : "Scheduling & publishing"}
      pill="Social Media"
      ariaLabel="Animated content pipeline where social posts move from scheduled to publishing to live. Choose a platform to highlight its posts."
    >
      <div className="flex h-full flex-col gap-2">
        <div className="grid flex-1 grid-cols-3 gap-2">
          {STAGES.map((st, si) => (
            <div key={st.name} className="flex min-w-0 flex-col gap-1.5 rounded-2xl bg-story-mist p-1.5">
              <div className="flex items-center justify-between px-0.5">
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wide" style={{ color: st.color }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: st.color }} />
                  {st.name}
                </span>
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-surface px-1 text-[9px] font-bold tabular-nums text-muted">{columns[si].length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 overflow-hidden">
                {columns[si].slice(0, visibleCount[si]).map(({ p }) => (
                  <PostCard key={p.id} post={p} stage={si} dim={Boolean(filter) && p.platform !== filter} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="no-scrollbar flex gap-1 overflow-x-auto" role="group" aria-label="Platform filter">
          {[null, ...PLATFORMS.map((p) => p.key)].map((k) => {
            const on = filter === k;
            const c = PLATFORMS.find((p) => p.key === k)?.color ?? "var(--story-royal)";
            return (
              <button key={k ?? "all"} type="button" aria-pressed={on} onClick={() => setFilter(k)} className="shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors" style={on ? { background: c, borderColor: c, color: "#fff" } : { borderColor: "var(--border-soft)", color: "var(--muted)" }}>
                {k ?? "All"}
              </button>
            );
          })}
        </div>
      </div>
    </MonitorFrame>
  );
}

/* ---------- 3. Budget planner ---------- */

const SPLITS = [
  { key: "Balanced", meta: 50 },
  { key: "Meta-led", meta: 70 },
  { key: "Search-led", meta: 30 },
];
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function BudgetPlannerMonitor() {
  const [budget, setBudget] = useState(50000);
  const [split, setSplit] = useState(0);
  const meta = SPLITS[split].meta;
  const metaAmt = (budget * meta) / 100;
  const googleAmt = budget - metaAmt;

  return (
    <MonitorFrame
      interactive
      title="campaign-budget-planner"
      label="Illustrative planning only"
      pill="Meta & Google Ads"
      ariaLabel="Interactive budget planner. Adjust the monthly budget and channel split."
      controls={SPLITS.map((s, i) => <Chip key={s.key} active={split === i} onClick={() => setSplit(i)}>{s.key} {s.meta}/{100 - s.meta}</Chip>)}
    >
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="mk-budget" className="text-[11px] font-semibold text-muted">Monthly ad budget</label>
            <motion.span key={budget} initial={{ y: -4, opacity: 0.4 }} animate={{ y: 0, opacity: 1 }} className="text-xl font-bold tabular-nums text-story-navy dark:text-foreground">{inr(budget)}</motion.span>
          </div>
          <input
            id="mk-budget"
            type="range"
            min={10000}
            max={300000}
            step={5000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-2 w-full cursor-pointer accent-[var(--story-royal)]"
          />
          <div className="flex justify-between font-mono text-[9px] text-muted"><span>₹10k</span><span>₹3L</span></div>
        </div>

        <div>
          <div className="flex h-7 overflow-hidden rounded-lg">
            <motion.div className="grid place-items-center text-[10px] font-bold text-white" style={{ background: BLUE }} animate={{ width: `${meta}%` }} transition={{ type: "spring", stiffness: 200, damping: 26 }}>Meta</motion.div>
            <motion.div className="grid flex-1 place-items-center text-[10px] font-bold text-white" style={{ background: GREEN }}>Google</motion.div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            {[
              { l: "Meta", v: inr(metaAmt), c: BLUE },
              { l: "Google", v: inr(googleAmt), c: GREEN },
              { l: "Per day", v: inr(budget / 30), c: AMBER },
            ].map((x) => (
              <div key={x.l} className="rounded-lg border border-border-soft py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: x.c }}>{x.l}</p>
                <p className="text-xs font-semibold tabular-nums">{x.v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MonitorFrame>
  );
}

/* ---------- 4. WhatsApp lead flow ---------- */

type ChatEvent = { kind: "msg"; from: "lead" | "biz"; text: string; time: string } | { kind: "typing" };
const CHAT: ChatEvent[] = [
  { kind: "msg", from: "lead", text: "Hi, I saw your ad. Can I get pricing?", time: "10:41" },
  { kind: "typing" },
  { kind: "msg", from: "biz", text: "Hello! Share your name and we'll connect you with the team.", time: "10:41" },
  { kind: "msg", from: "lead", text: "Priya", time: "10:42" },
  { kind: "typing" },
  { kind: "msg", from: "biz", text: "Thanks Priya. A team member will contact you shortly.", time: "10:42" },
];

function Ticks({ color = "currentColor" }: { color?: string }) {
  return (
    <svg width="14" height="9" viewBox="0 0 16 10" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 5.5l3 3L10 2M6 7.5l1.5 1.5L14 2" />
    </svg>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-md border border-border-soft bg-surface px-3 py-2.5 shadow-sm">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-muted" animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}

export function WhatsAppLeadPhone() {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? CHAT.length : 0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setN((x) => (x >= CHAT.length + 3 ? 0 : x + 1)), 1400);
    return () => window.clearInterval(id);
  }, [reduced]);

  const visible = CHAT.slice(0, Math.min(n, CHAT.length));
  const shown = visible.filter((e, i) => e.kind === "msg" || i === visible.length - 1);
  const captured = n >= CHAT.length + 1;

  return (
    <div className="flex flex-col items-center gap-5">
      <div role="img" aria-label="Animated WhatsApp conversation that captures a lead" className="relative flex h-[420px] w-[210px] flex-col overflow-hidden rounded-[2.1rem] bg-white shadow-[var(--shadow-lift)] dark:bg-surface sm:h-[460px] sm:w-[232px]" style={{ border: "6px solid var(--story-navy)" }}>
        {/* header */}
        <div className="flex items-center gap-2 px-2.5 pb-2 pt-6 text-white" style={{ background: GREEN }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 3L5 8l5 5" /></svg>
          <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/25 text-[11px] font-bold">
            B
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white bg-emerald-300" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="flex items-center gap-1 truncate text-[11px] font-semibold">Your Business <svg width="10" height="10" viewBox="0 0 16 16" aria-hidden><circle cx="8" cy="8" r="8" fill="#93c5fd" /><path d="M4.5 8.3l2.4 2.3 4.6-4.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></p>
            <p className="text-[9px] opacity-85">{visible.length && visible[visible.length - 1].kind === "typing" ? "typing…" : "online"}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="2" y="6" width="14" height="12" rx="2" /><path d="M16 10l6-3v10l-6-3z" /></svg>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
        </div>

        {/* new-lead notification */}
        <AnimatePresence>
          {captured && (
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="absolute inset-x-2 top-[3.6rem] z-10 flex items-center gap-2 rounded-xl border border-border-soft bg-surface px-2.5 py-2 shadow-lg"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: GREEN }}>✓</span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[10px] font-bold text-foreground">New lead captured</span>
                <span className="block truncate text-[9px] text-muted">Priya · via WhatsApp ad</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* conversation */}
        <div className="flex min-h-0 flex-1 flex-col justify-end gap-1.5 px-2.5 pb-2 pt-2" style={{ background: "color-mix(in srgb, var(--story-royal) 6%, transparent)" }}>
          <span className="mx-auto mb-1 rounded-full bg-surface px-2.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-muted shadow-sm">Today</span>
          <AnimatePresence initial={false}>
            {shown.map((e, i) =>
              e.kind === "typing" ? (
                <motion.div key={`t${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="self-start">
                  <TypingDots />
                </motion.div>
              ) : (
                <motion.div
                  key={`m${i}`}
                  initial={{ opacity: 0, y: 10, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn("max-w-[86%] px-2.5 pb-1 pt-1.5 text-[10px] leading-snug shadow-sm", e.from === "lead" ? "self-end rounded-2xl rounded-br-md text-white" : "self-start rounded-2xl rounded-bl-md border border-border-soft bg-surface text-foreground")}
                  style={e.from === "lead" ? { background: BLUE } : undefined}
                >
                  {e.text}
                  <span className={cn("mt-0.5 flex items-center justify-end gap-1 text-[8px]", e.from === "lead" ? "text-white/75" : "text-muted")}>
                    {e.time}
                    {e.from === "lead" && <Ticks color="#bfdbfe" />}
                  </span>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

        {/* composer */}
        <div className="flex shrink-0 items-center gap-1.5 border-t border-border-soft bg-surface px-2 py-1.5">
          <span className="flex h-7 flex-1 items-center rounded-full bg-story-mist px-3 text-[10px] text-muted">Message</span>
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-white" style={{ background: GREEN }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V22h2v-3.1A7 7 0 0 0 19 12z" /></svg>
          </span>
        </div>
      </div>
      <Chip onClick={() => setN(0)}>Replay conversation</Chip>
      <div className="flex flex-col items-center"><Caption label="WhatsApp lead flow" pill="WhatsApp Marketing" reduced={reduced} curve={false} /></div>
    </div>
  );
}
