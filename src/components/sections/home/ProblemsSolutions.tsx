"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { ArrowRight, BarChart3, Check, Gauge, MousePointerClick, Settings2, Target, X, type LucideIcon } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;
const AUTO_MS = 6000;

type Pair = { problem: string; pain: string; solution: string; detail: string; outcome: string; icon: LucideIcon; tags: [string, string, string] };

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
  },
  {
    problem: "Every small change needs a developer.",
    pain: "Updating a price or a page turns into a ticket and a wait.",
    solution: "We build systems you can run yourself.",
    detail: "Admin panels and content tools your team can use on day one, on clean code that stays easy to extend.",
    outcome: "Edit your own site, with no waiting",
    icon: Settings2,
    tags: ["Admin panels", "Content management", "Clean architecture"],
  },
  {
    problem: "Your site is slow on mobile.",
    pain: "Most customers browse on a phone, and slow pages lose them.",
    solution: "We make it fast on every screen.",
    detail: "Mobile-first layouts, optimised images and code, and Core Web Vitals treated as part of the build.",
    outcome: "Pages that load quickly on any phone",
    icon: Gauge,
    tags: ["Mobile-first", "Core Web Vitals", "Image & code optimisation"],
  },
  {
    problem: "Built for the agency, not for you.",
    pain: "The tools and structure suit how the agency works, not your business.",
    solution: "We build around your business.",
    detail: "We start from your workflows, customers and goals, then choose the technology that fits them.",
    outcome: "Software that matches how you work",
    icon: Target,
    tags: ["Discovery first", "Custom features", "Your workflow"],
  },
  {
    problem: "No idea where your leads come from.",
    pain: "You pay for ads and traffic but cannot tell what is working.",
    solution: "We make every enquiry measurable.",
    detail: "Tracking across your website, ads and campaigns, so each channel can be measured and improved.",
    outcome: "Know which channel brings customers",
    icon: BarChart3,
    tags: ["Analytics setup", "Campaign tracking", "Clear reporting"],
  },
];

/** The answer card: the problem it fixes, a connector that draws itself, then the solution and its outcome. */
function Solution({ pair }: { pair: Pair }) {
  const Icon = pair.icon;
  return (
    <div className="overflow-hidden rounded-3xl border border-border-soft bg-surface shadow-[var(--shadow-lift)]">
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-3 rounded-2xl bg-story-mist px-4 py-3">
          <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" strokeWidth={3} />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">The problem</p>
            <p className="mt-0.5 text-sm leading-6 text-story-navy dark:text-foreground">{pair.pain}</p>
          </div>
        </div>

        {/* connector: draws down from the problem into the solution */}
        <div className="relative ml-[1.15rem] h-8 w-px bg-border-soft" aria-hidden>
          <motion.span className="absolute inset-x-0 top-0 block bg-story-royal" initial={{ height: 0 }} animate={{ height: "100%" }} transition={{ duration: 0.5, delay: 0.1, ease: EASE }} />
        </div>

        <div className="flex items-start gap-4">
          {/* the icon sits on the page with no tile: it springs in, draws its own lines, and sends out one ripple */}
          <span key={pair.problem} className="relative grid h-12 w-12 shrink-0 place-items-center text-story-royal">
            <motion.span aria-hidden className="absolute inset-1 rounded-full border-2 border-story-royal" initial={{ scale: 0.6, opacity: 0.55 }} animate={{ scale: 1.7, opacity: 0 }} transition={{ delay: 0.45, duration: 0.9, ease: "easeOut" }} />
            <motion.span initial={{ scale: 0.4, rotate: -25, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.3 }}>
              <Icon className="icon-draw h-10 w-10" strokeWidth={1.6} />
            </motion.span>
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-story-royal">Our solution</p>
            <motion.h3 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="mt-1 text-2xl font-bold leading-tight tracking-tight text-story-navy sm:text-[1.7rem] dark:text-foreground">{pair.solution}</motion.h3>
          </div>
        </div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.4 }} className="mt-4 text-base leading-7 text-muted">{pair.detail}</motion.p>
        <div className="mt-5 flex flex-wrap gap-2">
          {pair.tags.map((t, i) => (
            <motion.span key={t} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.07 }} className="rounded-full bg-story-mist px-3 py-1 text-xs font-semibold text-story-royal">{t}</motion.span>
          ))}
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex items-center gap-2.5 bg-story-royal px-6 py-3.5 text-sm font-semibold text-white sm:px-8">
        <Check className="h-4 w-4 shrink-0" strokeWidth={3} />
        <span className="min-w-0">{pair.outcome}</span>
      </motion.div>
    </div>
  );
}

/**
 * 03 — Real customer problems on one side, the MyLoginn answer on the other. The board walks through the problems on
 * its own and holds when the pointer is on it; choosing a problem draws its solution in. On small screens the answer
 * opens directly beneath the problem.
 */
export function ProblemsSolutions() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const pair = PAIRS[active];

  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "-10% 0px" });
  const [held, setHeld] = useState(false);
  const auto = inView && !held && !reduced;
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % PAIRS.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [auto, active]);

  return (
    <Chapter formation="grid" variant="problems" title="Your digital problems, our solutions">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Reveal><span className="story-eyebrow">Problems → solutions</span></Reveal>
          <SplitHeadline as="h2" text="Your digital problems. Our solutions." className="story-subheading mt-4 text-story-navy" />
        </div>

        <div ref={stage} onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          <ol className="flex flex-col gap-2">
            {PAIRS.map((p, i) => {
              const on = i === active;
              return (
                <li key={p.problem}>
                  <button
                    type="button"
                    aria-expanded={on}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    className={cn(
                      "group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border px-5 py-4 text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-story-royal",
                      on ? "border-story-royal/40 bg-story-mist" : "border-border-soft bg-surface hover:border-story-royal/30",
                    )}
                  >
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold tabular-nums transition-colors duration-300", on ? "bg-story-royal text-white" : "bg-story-mist text-muted")}>0{i + 1}</span>
                    <span className={cn("flex-1 text-base font-semibold leading-snug sm:text-lg", on ? "text-story-navy dark:text-foreground" : "text-story-navy/70 dark:text-foreground/70")}>{p.problem}</span>
                    <ArrowRight className={cn("h-4 w-4 shrink-0 transition-all duration-300", on ? "translate-x-0 text-story-royal opacity-100" : "-translate-x-2 opacity-0")} />
                    {/* the timer: fills along the bottom edge until the board moves to the next problem */}
                    {on && (
                      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-story-royal/10">
                        <motion.span key={`${active}-${auto}`} className="block h-full bg-story-royal" initial={{ width: 0 }} animate={{ width: auto ? "100%" : "100%" }} transition={{ duration: auto ? AUTO_MS / 1000 : 0.3, ease: "linear" }} />
                      </span>
                    )}
                  </button>
                  {/* small screens: the answer opens right under its problem */}
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.div className="overflow-hidden lg:hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                        <div className="pt-3"><Solution pair={p} /></div>
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
                  <Solution pair={pair} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
