"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Chip, MonitorFrame } from "@/components/services/testing/TestingVisuals";
import { Counter } from "@/components/pages/PageHeroVisuals";

const EASE = [0.16, 1, 0.3, 1] as const;
const SCREENS = ["Overview", "How to apply"] as const;
const stagger = { show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const rise = { hidden: { opacity: 0, y: 14, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } } };

const FLOW = [
  { n: "01", t: "Apply", d: "Browse internships and submit your application" },
  { n: "02", t: "Application review", d: "The team reviews applications and contacts candidates" },
  { n: "03", t: "Program details", d: "Follow the information for the selected opportunity" },
];

export function InternshipsHeroVisual({ total, paidCount, companyCount, avgWeeks }: { total: number; paidCount: number; companyCount: number; avgWeeks: number }) {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced || !auto) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % SCREENS.length), 5200);
    return () => window.clearInterval(id);
  }, [reduced, auto]);

  const screen = SCREENS[i];
  const stats = [
    { v: total, l: "Open internships", icon: "career" },
    { v: paidCount, l: "Paid programs", icon: "business" },
    { v: companyCount, l: "Organizations listed", icon: "leader" },
    { v: avgWeeks, l: "Avg. duration (weeks)", icon: "student" },
  ];

  return (
    <MonitorFrame
      interactive
      title="myloginn.com/internships · overview"
      label={screen}
      pill="Launch Your Career"
      ariaLabel="Overview of current internship numbers and how to apply."
      controls={SCREENS.map((s, idx) => <Chip key={s} active={idx === i} onClick={() => { setAuto(false); setI(idx); }}>{s}</Chip>)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={screen} className="h-full" exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
          {screen === "Overview" ? (
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid h-full grid-cols-2 gap-2.5">
              {stats.map((s) => (
                <motion.div key={s.l} variants={rise} className="flex items-center gap-3 rounded-2xl bg-story-mist px-3 py-2">
                  <ContentIcon keyword={s.icon} className="h-9 w-9 shrink-0" />
                  <div className="min-w-0 leading-tight">
                    <p className="text-xl font-bold tabular-nums text-story-navy dark:text-foreground"><Counter value={s.v} /></p>
                    <p className="truncate text-[10px] text-muted">{s.l}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.ol variants={stagger} initial="hidden" animate="show" className="relative flex h-full flex-col justify-center gap-3">
              <span aria-hidden className="absolute bottom-[18%] left-[1.15rem] top-[18%] w-px bg-border-soft" />
              {FLOW.map((f) => (
                <motion.li key={f.n} variants={rise} className="relative flex items-center gap-3">
                  <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-story-royal text-[11px] font-bold text-white">{f.n}</span>
                  <div className="min-w-0 leading-snug">
                    <p className="text-[12px] font-semibold">{f.t}</p>
                    <p className="text-[10px] text-muted">{f.d}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ol>
          )}
        </motion.div>
      </AnimatePresence>
    </MonitorFrame>
  );
}
