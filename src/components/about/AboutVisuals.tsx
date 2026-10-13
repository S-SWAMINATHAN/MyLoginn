"use client";

import { useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { MonitorFrame } from "@/components/services/testing/TestingVisuals";

const BLUE = "#2563eb";
const VIOLET = "#7c3aed";
const GREEN = "#059669";
const AMBER = "#d97706";

function useAutoIndex(length: number, ms: number) {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(true);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (reduced || !auto) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), ms);
    return () => window.clearInterval(id);
  }, [reduced, auto, length, ms]);
  return { index, pick: (i: number) => { setAuto(false); setIndex(i); }, reduced };
}

/* ---------- Hero: growth orbit ---------- */

const ORBIT: { title: string; text: string; color: string; Icon: ComponentType<{ className?: string }>; x: number; y: number }[] = [
  { title: "Learn", text: "Skills that matter, taught practically.", color: BLUE, Icon: Lightbulb, x: 50, y: 7 },
  { title: "Build", text: "Real-world projects for your portfolio.", color: VIOLET, Icon: Rocket, x: 93, y: 50 },
  { title: "Practice", text: "A hands-on approach to every topic.", color: GREEN, Icon: ShieldCheck, x: 50, y: 93 },
  { title: "Grow", text: "A supportive community to grow with.", color: AMBER, Icon: Sparkles, x: 7, y: 50 },
];

export function GrowthOrbit() {
  const { index, pick, reduced } = useAutoIndex(ORBIT.length, 2800);
  const cur = ORBIT[index];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[26rem]" role="group" aria-label="Learn, build, practice and grow. Select a step to read more.">
      {/* rings */}
      <motion.div aria-hidden className="absolute inset-[7%] rounded-full border-2 border-dashed" style={{ borderColor: "var(--story-line)" }} animate={reduced ? undefined : { rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} />
      <motion.div aria-hidden className="absolute inset-[22%] rounded-full border" style={{ borderColor: "var(--story-line)" }} animate={reduced ? undefined : { rotate: -360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} />
      <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90">
        <motion.circle cx="50" cy="50" r="43" fill="none" stroke={cur.color} strokeWidth="1.2" strokeLinecap="round" pathLength={1} strokeDasharray="0.25 1" animate={{ strokeDashoffset: -index * 0.25 }} transition={{ type: "spring", stiffness: 60, damping: 16 }} />
      </svg>

      {/* centre card */}
      <div className="absolute inset-[27%] grid place-items-center rounded-full border border-border-soft bg-surface p-3 text-center shadow-[var(--shadow-lift)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={cur.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.25 }}>
            <p className="text-lg font-bold sm:text-xl" style={{ color: cur.color }}>{cur.title}</p>
            <p className="mt-1 text-[10px] leading-snug text-muted sm:text-xs">{cur.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* nodes */}
      {ORBIT.map((n, i) => {
        const on = i === index;
        return (
          <button
            key={n.title}
            type="button"
            aria-pressed={on}
            aria-label={`${n.title}: ${n.text}`}
            onClick={() => pick(i)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
          >
            <motion.span
              className="relative grid h-12 w-12 place-items-center rounded-full border-2 sm:h-14 sm:w-14"
              animate={{ scale: on ? 1.12 : 1, backgroundColor: on ? n.color : "#ffffff", borderColor: n.color, color: on ? "#ffffff" : n.color }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ boxShadow: on ? `0 10px 22px -8px ${n.color}` : "0 4px 10px -6px rgba(11,31,77,0.3)" }}
            >
              <n.Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              {on && !reduced && <motion.span aria-hidden className="absolute inset-0 rounded-full" style={{ border: `2px solid ${n.color}` }} initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />}
            </motion.span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Who we are: learning journey ---------- */

const JOURNEY = [
  { title: "Courses", text: "Structured, practical technology courses you can learn at your own pace.", color: BLUE, x: 30, y: 85 },
  { title: "Projects", text: "Real projects that turn what you learn into a portfolio.", color: VIOLET, x: 110, y: 35 },
  { title: "Internships", text: "Real work and mentor guidance with the MyLoginn team.", color: GREEN, x: 190, y: 85 },
  { title: "Services", text: "Web, mobile, AI and marketing solutions for businesses.", color: AMBER, x: 270, y: 35 },
];
const JOURNEY_PATH = "M30 85 C70 85 70 35 110 35 S150 85 190 85 S230 35 270 35";

export function JourneyMonitor() {
  const { index, pick, reduced } = useAutoIndex(JOURNEY.length, 3000);
  const cur = JOURNEY[index];
  return (
    <MonitorFrame interactive title="myloginn · learning journey" label={cur.title} pill="Learn, Build, Grow" ariaLabel="Interactive learning journey from courses to projects, internships and services. Select a stage to read about it.">
      <div className="flex h-full flex-col justify-between">
        <div className="relative w-full" style={{ aspectRatio: "300 / 120" }}>
          <svg aria-hidden viewBox="0 0 300 120" className="absolute inset-0 h-full w-full" fill="none">
            <path d={JOURNEY_PATH} stroke="var(--story-line)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 7" />
            <motion.path d={JOURNEY_PATH} stroke="var(--story-royal)" strokeWidth="3" strokeLinecap="round" pathLength={1} initial={false} animate={{ pathLength: index / (JOURNEY.length - 1) }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} />
            {!reduced && (
              <circle r="4" fill="var(--story-cyan)">
                <animateMotion dur="6s" repeatCount="indefinite" path={JOURNEY_PATH} />
              </circle>
            )}
          </svg>
          {JOURNEY.map((n, i) => (
            <button key={n.title} type="button" aria-pressed={i === index} aria-label={n.title} onClick={() => pick(i)} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${(n.x / 300) * 100}%`, top: `${(n.y / 120) * 100}%` }}>
              <motion.span className="grid h-9 w-9 place-items-center rounded-full border-2 text-[11px] font-bold" animate={{ scale: i === index ? 1.15 : 1, backgroundColor: i <= index ? n.color : "#ffffff", color: i <= index ? "#ffffff" : n.color, borderColor: n.color }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                {i + 1}
              </motion.span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="rounded-2xl border px-3 py-2" style={{ borderColor: cur.color }}>
            <p className="text-[13px] font-bold" style={{ color: cur.color }}>{cur.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{cur.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </MonitorFrame>
  );
}
