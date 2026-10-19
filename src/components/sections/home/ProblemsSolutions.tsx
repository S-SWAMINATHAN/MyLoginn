"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowRight, BarChart3, Check, Clock, Gauge, MousePointerClick, Settings2, Target, User, X, type LucideIcon } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const ROSE = "#f43f5e";
const ROYAL = "#1f56d6";
const GREEN = "#10b981";
/** How long each problem is shown before it flips to its fix, and how long the fix is held. */
const BEFORE_MS = 2800;
const AFTER_MS = 5200;

/* ── the small animated pictures: each one shows the problem, then flips to the fix ───────────────── */

const spring = { type: "spring", stiffness: 140, damping: 20 } as const;

/** Visitors, interested, enquiries: the last bar barely exists before, and fills after. */
function FunnelVisual({ after }: { after: boolean }) {
  const rows = [
    { label: "Visitors", before: 100, after: 100 },
    { label: "Interested", before: 52, after: 72 },
    { label: "Enquiries", before: 5, after: 40 },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-[4.5rem] shrink-0 text-[11px] font-semibold text-muted">{r.label}</span>
          <span className="relative h-4 flex-1 overflow-hidden rounded-full bg-story-mist">
            <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={false} animate={{ width: `${after ? r.after : r.before}%`, backgroundColor: i === 2 ? (after ? GREEN : ROSE) : ROYAL }} transition={{ ...spring, delay: i * 0.08 }} />
          </span>
        </div>
      ))}
    </div>
  );
}

/** A change request passes through a developer and a wait; after, you edit and it is live. */
function ChangeVisual({ after }: { after: boolean }) {
  const chip = "flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold shadow-[var(--shadow-soft)] dark:bg-surface";
  const link = <span aria-hidden className="h-px w-5 shrink-0 bg-border-soft sm:w-8" />;
  return (
    <div className="flex h-full items-center justify-center">
      <AnimatePresence mode="wait" initial={false}>
        {after ? (
          <motion.div key="a" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.3, ease: EASE }} className="flex items-center">
            <span className={chip}><User className="h-3.5 w-3.5 text-story-royal" />You edit</span>
            {link}
            <span className={cn(chip, "text-emerald-600")}><Check className="h-3.5 w-3.5" strokeWidth={3} />Published</span>
          </motion.div>
        ) : (
          <motion.div key="b" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }} transition={{ duration: 0.3, ease: EASE }} className="flex items-center">
            <span className={chip}><User className="h-3.5 w-3.5 text-story-royal" />Request</span>
            {link}
            <span className={chip}>Developer</span>
            {link}
            <span className={cn(chip, "text-rose-500")}><Clock className="h-3.5 w-3.5" />Waiting</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A speedometer: the needle swings from slow to fast. */
function GaugeVisual({ after }: { after: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <svg viewBox="0 0 200 110" className="h-[4.6rem] w-auto" aria-hidden>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" className="text-border-soft" />
        <motion.path d="M20 100 A80 80 0 0 1 180 100" fill="none" strokeWidth="14" strokeLinecap="round" initial={false} animate={{ pathLength: after ? 0.92 : 0.18, stroke: after ? GREEN : ROSE }} transition={{ duration: 0.9, ease: EASE }} />
        <motion.g style={{ originX: 0.5, originY: 1, transformBox: "fill-box" }} initial={false} animate={{ rotate: after ? 72 : -78 }} transition={{ type: "spring", stiffness: 70, damping: 11 }}>
          <path d="M100 100 L100 36" stroke="#0b1f4d" strokeWidth="4" strokeLinecap="round" />
        </motion.g>
        <circle cx="100" cy="100" r="8" fill="#0b1f4d" />
      </svg>
      <motion.span key={String(after)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={cn("-mt-1 text-xs font-bold uppercase tracking-[0.16em]", after ? "text-emerald-600" : "text-rose-500")}>{after ? "Fast on mobile" : "Slow on mobile"}</motion.span>
    </div>
  );
}

/** Six pieces: scattered and crooked before, one tidy grid after. */
function FitVisual({ after }: { after: boolean }) {
  const mess = [{ x: -8, y: 6, r: -14 }, { x: 10, y: -8, r: 11 }, { x: -4, y: 12, r: 8 }, { x: 12, y: 4, r: -9 }, { x: -10, y: -6, r: 15 }, { x: 6, y: 10, r: -12 }];
  return (
    <div className="grid h-full place-items-center">
      <div className="grid grid-cols-3 gap-1.5">
        {mess.map((m, i) => (
          <motion.span
            key={i}
            className="grid h-6 w-9 place-items-center rounded-md"
            initial={false}
            animate={{ x: after ? 0 : m.x, y: after ? 0 : m.y, rotate: after ? 0 : m.r, backgroundColor: after ? ROYAL : "#cbd5e1", opacity: after ? 1 : 0.85 }}
            transition={{ ...spring, delay: i * 0.05 }}
          >
            {after && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
          </motion.span>
        ))}
      </div>
    </div>
  );
}

/** Where enquiries come from: a question mark before, labelled channels after. */
function SourcesVisual({ after }: { after: boolean }) {
  const rows = [{ label: "Search", w: 78, c: ROYAL }, { label: "Ads", w: 54, c: "#8b5cf6" }, { label: "WhatsApp", w: 40, c: GREEN }, { label: "Direct", w: 22, c: "#f59e0b" }];
  return (
    <div className="flex h-full flex-col justify-center gap-1.5">
      {rows.map((r, i) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-[4.5rem] shrink-0 text-[11px] font-semibold text-muted">{after ? r.label : "?"}</span>
          <span className="relative h-3 flex-1 overflow-hidden rounded-full bg-story-mist">
            <motion.span className="absolute inset-y-0 left-0 rounded-full" initial={false} animate={{ width: `${after ? r.w : 60}%`, backgroundColor: after ? r.c : "#cbd5e1" }} transition={{ ...spring, delay: i * 0.07 }} />
          </span>
        </div>
      ))}
    </div>
  );
}

type Pair = { problem: string; pain: string; solution: string; detail: string; outcome: string; icon: LucideIcon; tags: [string, string, string]; Visual: (p: { after: boolean }) => ReactNode };

/** Short, plain statements: the customer's problem on the left, what we do about it on the right. */
const PAIRS: Pair[] = [
  {
    problem: "Great-looking site. No enquiries.",
    pain: "Visitors arrive, look around and leave without getting in touch.",
    solution: "We build websites that convert.",
    detail: "Clear journeys, strong calls to action and enquiry paths, WhatsApp included, shaped around how your customers decide.",
    outcome: "More enquiries from the traffic you already have",
    icon: MousePointerClick,
    tags: ["Conversion journeys", "Lead forms & WhatsApp", "Landing pages"],
    Visual: FunnelVisual,
  },
  {
    problem: "Every small change needs a developer.",
    pain: "Updating a price or a page turns into a ticket and a wait.",
    solution: "We build systems you can run yourself.",
    detail: "Admin panels and content tools your team can use on day one, on clean code that stays easy to extend.",
    outcome: "Edit your own site, with no waiting",
    icon: Settings2,
    tags: ["Admin panels", "Content management", "Clean architecture"],
    Visual: ChangeVisual,
  },
  {
    problem: "Your site is slow on mobile.",
    pain: "Most customers browse on a phone, and slow pages lose them.",
    solution: "We make it fast on every screen.",
    detail: "Mobile-first layouts, optimised images and code, and Core Web Vitals treated as part of the build.",
    outcome: "Pages that load quickly on any phone",
    icon: Gauge,
    tags: ["Mobile-first", "Core Web Vitals", "Image & code optimisation"],
    Visual: GaugeVisual,
  },
  {
    problem: "Built for the agency, not for you.",
    pain: "The tools and structure suit how the agency works, not your business.",
    solution: "We build around your business.",
    detail: "We start from your workflows, customers and goals, then choose the technology that fits them.",
    outcome: "Software that matches how you work",
    icon: Target,
    tags: ["Discovery first", "Custom features", "Your workflow"],
    Visual: FitVisual,
  },
  {
    problem: "No idea where your leads come from.",
    pain: "You pay for ads and traffic but cannot tell what is working.",
    solution: "We make every enquiry measurable.",
    detail: "Tracking across your website, ads and campaigns, so each channel can be measured and improved.",
    outcome: "Know which channel brings customers",
    icon: BarChart3,
    tags: ["Analytics setup", "Campaign tracking", "Clear reporting"],
    Visual: SourcesVisual,
  },
];

/** The board for one problem: a Before / With MyLoginn switch, a picture that flips, and the matching words. */
function Stage({ pair, after, onSwitch }: { pair: Pair; after: boolean; onSwitch: (after: boolean) => void }) {
  const Icon = pair.icon;
  const Visual = pair.Visual;
  const switchId = useId();
  return (
    <div className="overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-[var(--shadow-lift)]">
      <div className="p-3.5 sm:p-4">
        <div role="tablist" aria-label="Before and after" className="relative flex w-full gap-1 rounded-full bg-story-mist p-1 sm:w-fit">
          {[{ v: false, label: "The problem" }, { v: true, label: "With MyLoginn" }].map((o) => {
            const on = after === o.v;
            return (
              <button key={o.label} role="tab" aria-selected={on} onClick={() => onSwitch(o.v)} className={cn("relative flex-1 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition-colors duration-300 sm:flex-none", on ? "text-white" : "text-muted hover:text-story-navy")}>
                {on && <motion.span layoutId={`ps-switch-${switchId}`} className="absolute inset-0 rounded-full" style={{ background: o.v ? ROYAL : ROSE }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                <span className="relative inline-flex items-center gap-1.5">{o.v ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <X className="h-3.5 w-3.5" strokeWidth={3} />}{o.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-2.5 h-28 overflow-hidden p-2 sm:h-28 sm:p-3">
          <Visual after={after} />
        </div>

        <div className="relative mt-3 min-h-[6.75rem]">
          <AnimatePresence mode="wait" initial={false}>
            {after ? (
              <motion.div key="after" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-story-royal" strokeWidth={1.7} />
                  <h3 className="text-base font-bold leading-tight tracking-tight text-story-navy sm:text-lg dark:text-foreground">{pair.solution}</h3>
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-muted">{pair.detail}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {pair.tags.map((t, i) => (
                    <motion.span key={t} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }} className="rounded-full bg-story-mist px-2.5 py-0.5 text-[11px] font-semibold text-story-royal">{t}</motion.span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="before" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
                <div className="flex items-center gap-3">
                  <X className="h-5 w-5 shrink-0 text-rose-500" strokeWidth={2.2} />
                  <h3 className="text-base font-bold leading-tight tracking-tight text-story-navy sm:text-lg dark:text-foreground">{pair.problem}</h3>
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-muted">{pair.pain}</p>
                <p className="mt-2 text-[13px] font-semibold text-rose-500">This is costing you customers.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <motion.div initial={false} animate={{ backgroundColor: after ? ROYAL : "#f1f5f9", color: after ? "#ffffff" : "#64748b" }} transition={{ duration: 0.4 }} className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold sm:px-4">
        {after ? <Check className="h-4 w-4 shrink-0" strokeWidth={3} /> : <Clock className="h-4 w-4 shrink-0" />}
        <span className="min-w-0">{after ? pair.outcome : "See how we fix it"}</span>
      </motion.div>
    </div>
  );
}

/**
 * 03 — Real customer problems on one side, the MyLoginn answer on the other. The board walks through the problems on
 * its own, showing each one and then flipping it to its fix. Choose a problem or flip the switch yourself and it carries
 * on from there. On small screens the board opens directly beneath the problem.
 */
export function ProblemsSolutions() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [after, setAfter] = useState(false);
  const pair = PAIRS[active];

  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "-10% 0px" });
  const auto = inView && !reduced;

  // problem, then its fix, then on to the next problem
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => {
      if (!after) setAfter(true);
      else { setActive((i) => (i + 1) % PAIRS.length); setAfter(false); }
    }, after ? AFTER_MS : BEFORE_MS);
    return () => clearTimeout(t);
  }, [auto, after, active]);

  // choosing a problem or flipping the switch only moves the board; the timer restarts from there and keeps running
  const choose = (i: number) => { setActive(i); setAfter(true); };
  const flip = (v: boolean) => setAfter(v);

  return (
    <Chapter formation="grid" variant="problems" title="Your digital problems, our solutions">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Reveal><span className="story-eyebrow">Problems → solutions</span></Reveal>
          <SplitHeadline as="h2" text="Your digital problems. Our solutions." className="story-subheading mt-4 text-story-navy" />
        </div>

        <div ref={stage} className="mt-8 grid gap-5 lg:mt-10 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          <ol className="relative flex flex-col gap-2">
            {PAIRS.map((p, i) => {
              const on = i === active;
              return (
                <li key={p.problem}>
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => choose(i)}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-2xl border px-4 py-3 text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-story-royal sm:px-4 sm:py-3.5",
                      on ? "border-story-royal/40 bg-story-mist" : "border-border-soft bg-surface hover:border-story-royal/30",
                    )}
                  >
                    <span className="flex items-center gap-3.5">
                      <span className={cn("w-6 shrink-0 text-sm font-bold tabular-nums transition-colors duration-300", on ? "text-story-royal" : "text-muted")}>0{i + 1}</span>
                      <span className={cn("flex-1 text-sm font-semibold leading-snug sm:text-base", on ? "text-story-navy dark:text-foreground" : "text-story-navy/70 dark:text-foreground/70")}>{p.problem}</span>
                      <ArrowRight className={cn("h-4 w-4 shrink-0 transition-all duration-300", on ? "translate-x-0 text-story-royal opacity-100" : "-translate-x-2 opacity-0")} />
                    </span>
                    {/* the open problem shows where it is in its own before-and-after */}
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.span className="block overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                          <span className="mt-2 flex items-center gap-2 pl-[2.4rem] text-xs font-semibold">
                            <motion.span className="h-1.5 w-1.5 rounded-full" animate={{ backgroundColor: after ? GREEN : ROSE }} />
                            <span className={after ? "text-emerald-600" : "text-rose-500"}>{after ? "Solved with MyLoginn" : "The problem"}</span>
                          </span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                  {/* small screens: the board opens right under its problem */}
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div className="overflow-hidden lg:hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                        <div className="pt-3"><Stage pair={p} after={after} onSwitch={flip} /></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>

          <div className="relative hidden lg:block">
            <div className="sticky top-28">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={active} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35, ease: EASE }}>
                  <Stage pair={pair} after={after} onSwitch={flip} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
