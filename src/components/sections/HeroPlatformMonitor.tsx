"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { MonitorFrame } from "@/components/services/testing/TestingVisuals";

const SCREENS = ["Courses", "Services", "AI agent"] as const;
type Screen = (typeof SCREENS)[number];
const INTERVAL = 4200;
const EASE = [0.16, 1, 0.3, 1] as const;

const COURSES = [
  { icon: "ai", title: "AI & Machine Learning", pct: 72 },
  { icon: "marketing", title: "Digital Marketing", pct: 48 },
  { icon: "webdev", title: "Web Development", pct: 85 },
];

const SERVICES = [
  { icon: "webdev", title: "Web", text: "Sites & platforms" },
  { icon: "mobile", title: "Mobile", text: "iOS & Android" },
  { icon: "ai", title: "AI", text: "Agents & automation" },
  { icon: "marketing", title: "Marketing", text: "Growth & visibility" },
];

const stagger = { show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } } };
const rise = { hidden: { opacity: 0, y: 14, scale: 0.97 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } } };

/** Desktop version of each screen. */
function DesktopScreen({ screen }: { screen: Screen }) {
  if (screen === "Courses") {
    return (
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex h-full flex-col justify-center gap-2.5">
        {COURSES.map((c, i) => (
          <motion.div key={c.title} variants={rise} className="flex items-center gap-3 rounded-2xl border border-border-soft px-3 py-2">
            <ContentIcon keyword={c.icon} className="h-9 w-9" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-[11px] font-semibold"><span className="truncate">{c.title}</span><span className="font-mono tabular-nums text-muted">{c.pct}%</span></div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-story-mist">
                <motion.div className="h-full rounded-full" style={{ background: "var(--story-royal)" }} initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ delay: 0.3 + i * 0.12, duration: 0.9, ease: EASE }} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }
  if (screen === "Services") {
    return (
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid h-full grid-cols-2 gap-2.5">
        {SERVICES.map((s) => (
          <motion.div key={s.title} variants={rise} className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border-soft p-2 text-center">
            <ContentIcon keyword={s.icon} className="h-10 w-10" />
            <p className="text-[12px] font-bold">{s.title}</p>
            <p className="text-[10px] text-muted">{s.text}</p>
          </motion.div>
        ))}
      </motion.div>
    );
  }
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex h-full flex-col justify-center gap-2.5">
      <motion.div variants={rise} className="self-end rounded-2xl rounded-br-md px-3 py-2 text-[11px] font-medium text-white" style={{ background: "#2563eb" }}>Which course suits a beginner?</motion.div>
      <motion.div variants={rise} transition={{ delay: 0.5 }} className="max-w-[88%] self-start rounded-2xl rounded-bl-md border border-border-soft bg-surface px-3 py-2 text-[11px] leading-relaxed">
        Start with Web Development basics, then add AI/ML. I can map out a learning path for you.
      </motion.div>
      <motion.div variants={rise} className="flex gap-1.5">
        {["View courses", "Talk to the team"].map((t) => <span key={t} className="rounded-full border border-border-soft px-2.5 py-1 text-[10px] font-semibold text-story-royal">{t}</span>)}
      </motion.div>
    </motion.div>
  );
}

/** Compact mobile version of the same screen, shown on the phone. */
function PhoneScreen({ screen }: { screen: Screen }) {
  if (screen === "Courses") {
    return (
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex h-full flex-col justify-center gap-2 px-2.5">
        <p className="text-[11px] font-bold text-story-navy dark:text-foreground">My courses</p>
        {COURSES.map((c) => (
          <motion.div key={c.title} variants={rise} className="flex items-center gap-1.5 rounded-xl border border-border-soft p-1.5">
            <ContentIcon keyword={c.icon} className="h-6 w-6" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[8px] font-semibold">{c.title}</p>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-story-mist"><motion.div className="h-full rounded-full" style={{ background: "var(--story-royal)" }} initial={{ width: 0 }} animate={{ width: `${c.pct}%` }} transition={{ delay: 0.4, duration: 0.8, ease: EASE }} /></div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }
  if (screen === "Services") {
    return (
      <motion.div variants={stagger} initial="hidden" animate="show" className="flex h-full flex-col justify-center gap-2 px-2.5">
        <p className="text-[11px] font-bold text-story-navy dark:text-foreground">Services</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SERVICES.map((s) => (
            <motion.div key={s.title} variants={rise} className="flex flex-col items-center gap-0.5 rounded-xl border border-border-soft py-1.5">
              <ContentIcon keyword={s.icon} className="h-7 w-7" />
              <p className="text-[8px] font-bold">{s.title}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex h-full flex-col justify-center gap-1.5 px-2.5">
      <motion.div variants={rise} className="self-end rounded-xl rounded-br-sm px-2 py-1 text-[8px] font-medium text-white" style={{ background: "#2563eb" }}>Which course suits a beginner?</motion.div>
      <motion.div variants={rise} className="max-w-[90%] self-start rounded-xl rounded-bl-sm border border-border-soft bg-surface px-2 py-1 text-[8px] leading-snug">Start with Web Development, then add AI/ML.</motion.div>
    </motion.div>
  );
}

const slide = {
  enter: (d: number) => ({ opacity: 0, x: d * 36, filter: "blur(5px)" }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (d: number) => ({ opacity: 0, x: d * -36, filter: "blur(5px)" }),
};

export function HeroPlatformMonitor() {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (reduced || !auto) return;
    const id = window.setInterval(() => { setDir(1); setI((x) => (x + 1) % SCREENS.length); }, INTERVAL);
    return () => window.clearInterval(id);
  }, [reduced, auto]);

  const screen = SCREENS[i];
  const pick = (idx: number) => { setAuto(false); setDir(idx >= i ? 1 : -1); setI(idx); };

  const tabs = (
    <div className="flex w-full max-w-xs flex-col items-center gap-2">
      <div role="tablist" aria-label="Platform preview" className="relative flex rounded-full border border-border-soft bg-surface p-1">
        {SCREENS.map((s, idx) => (
          <button key={s} type="button" role="tab" aria-selected={idx === i} onClick={() => pick(idx)} className="relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors" style={{ color: idx === i ? "#fff" : "var(--muted)" }}>
            {idx === i && <motion.span layoutId="hero-tab" className="absolute inset-0 rounded-full" style={{ background: "var(--story-royal)" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{s}</span>
          </button>
        ))}
      </div>
      {!reduced && (
        <div className="h-0.5 w-24 overflow-hidden rounded-full bg-story-mist" aria-hidden>
          {auto && <motion.div key={i} className="h-full rounded-full" style={{ background: "var(--story-royal)" }} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: INTERVAL / 1000, ease: "linear" }} />}
        </div>
      )}
    </div>
  );

  return (
    <div className="relative mx-auto w-full max-w-md pr-14 sm:max-w-lg sm:pr-20">
      <MonitorFrame interactive title="myloginn.com · sample view" label={screen} pill="One Connected Platform" ariaLabel="Preview of the MyLoginn platform on desktop and mobile. Choose courses, services or the AI agent." controls={tabs}>
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div key={screen} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.32, ease: EASE }} className="h-full">
            <DesktopScreen screen={screen} />
          </motion.div>
        </AnimatePresence>
      </MonitorFrame>

      {/* phone showing the same screen */}
      <motion.div
        aria-hidden
        className="absolute right-0 top-[18%] z-10"
        initial={{ opacity: 0, x: 40, rotate: 6 }}
        animate={{ opacity: 1, x: 0, rotate: 0, y: reduced ? 0 : [0, -8, 0] }}
        transition={{ opacity: { duration: 0.7, delay: 0.5 }, x: { duration: 0.8, delay: 0.5, ease: EASE }, rotate: { duration: 0.8, delay: 0.5, ease: EASE }, y: { duration: 5, delay: 1.4, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div className="relative h-[13.5rem] w-[6.6rem] overflow-hidden rounded-[1.5rem] bg-white shadow-[var(--shadow-lift)] dark:bg-surface sm:h-[16rem] sm:w-[7.8rem]" style={{ border: "5px solid var(--story-navy)" }}>
          <div className="absolute left-1/2 top-1.5 z-10 h-1.5 w-8 -translate-x-1/2 rounded-full bg-story-navy" />
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div key={screen} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.32, ease: EASE }} className="absolute inset-0 pt-5">
              <PhoneScreen screen={screen} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
