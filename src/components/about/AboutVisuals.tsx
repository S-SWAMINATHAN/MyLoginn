"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, Rocket, ShieldCheck, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { MonitorFrame } from "@/components/services/testing/TestingVisuals";
import { ContentIcon } from "@/components/ui/ContentIcon";

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

const ORBIT: { title: string; text: string; color: string; icon: string; Icon: ComponentType<{ className?: string }>; x: number; y: number }[] = [
  { title: "Analysis", text: "Skills that matter, taught practically.", color: BLUE, icon: "student", Icon: Lightbulb, x: 50, y: 9 },
  { title: "Build", text: "Real-world projects for your portfolio.", color: VIOLET, icon: "webdev", Icon: Rocket, x: 91, y: 50 },
  { title: "Practice", text: "A hands-on approach to every topic.", color: GREEN, icon: "testing", Icon: ShieldCheck, x: 50, y: 91 },
  { title: "Grow", text: "A supportive community to grow with.", color: AMBER, icon: "career", Icon: Sparkles, x: 9, y: 50 },
];

export function GrowthOrbit() {
  const { index, pick, reduced } = useAutoIndex(ORBIT.length, 3200);
  const cur = ORBIT[index];
  return (
    <div className="mx-auto w-full max-w-[24rem] sm:max-w-[26rem]" role="group" aria-label="Learn, build, practice and grow. Select a step to read more.">
      <div className="relative aspect-square w-full">
        {/* soft rings and a single satellite that circles the outer ring */}
        <div aria-hidden className="absolute inset-[9%] rounded-full border border-dashed" style={{ borderColor: "var(--story-line)" }} />
        <div aria-hidden className="absolute inset-[24%] rounded-full bg-story-mist" />
        {!reduced && (
          <motion.div aria-hidden className="absolute inset-[9%]" animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
            <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-story-cyan shadow-[0_0_12px_3px_rgba(34,211,238,0.6)]" />
          </motion.div>
        )}

        {/* spokes from the core to each node; the active one fills in */}
        <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
          {ORBIT.map((n, i) => (
            <g key={n.title}>
              <line x1="50" y1="50" x2={n.x} y2={n.y} stroke="var(--story-line)" strokeWidth="0.5" strokeDasharray="1 1.6" />
              <motion.line x1="50" y1="50" x2={n.x} y2={n.y} stroke={n.color} strokeWidth="0.9" strokeLinecap="round" initial={false} animate={{ pathLength: i === index ? 1 : 0, opacity: i === index ? 1 : 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
            </g>
          ))}
        </svg>

        {/* core */}
        <div className="absolute inset-[31%] grid place-items-center rounded-full border border-border-soft bg-surface shadow-[var(--shadow-lift)]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={cur.title} initial={{ opacity: 0, scale: 0.85, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: -6 }} transition={{ duration: 0.25 }} className="flex flex-col items-center">
              <ContentIcon keyword={cur.icon} className="h-10 w-10 sm:h-12 sm:w-12" />
              <p className="mt-1 text-sm font-bold sm:text-base" style={{ color: cur.color }}>{cur.title}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* nodes */}
        {ORBIT.map((n, i) => {
          const on = i === index;
          return (
            <button key={n.title} type="button" aria-pressed={on} aria-label={`${n.title}: ${n.text}`} onClick={() => pick(i)} className="absolute -translate-x-1/2 -translate-y-1/2 outline-none" style={{ left: `${n.x}%`, top: `${n.y}%` }}>
              <motion.span
                className="grid h-11 w-11 place-items-center rounded-full sm:h-14 sm:w-14"
                animate={{ scale: on ? 1.12 : 1, backgroundColor: on ? n.color : `color-mix(in srgb, ${n.color} 14%, white)`, color: on ? "#ffffff" : n.color }}
                whileHover={{ scale: on ? 1.12 : 1.06 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{ boxShadow: on ? `0 12px 24px -10px ${n.color}` : "none" }}
              >
                <n.Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </motion.span>
            </button>
          );
        })}
      </div>

      {/* caption: always readable, even on small screens */}
      <div className="mt-4 h-12 text-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={cur.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <p className="text-sm font-semibold" style={{ color: cur.color }}>{cur.title}</p>
            <p className="mt-0.5 text-xs text-muted sm:text-sm">{cur.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Who we are: learning journey ---------- */

const JOURNEY = [
  { title: "Courses", text: "Structured, practical technology courses you can learn at your own pace.", color: BLUE, x: 30, y: 82, icon: "student", href: "/courses", cta: "Browse courses" },
  { title: "Projects", text: "Real projects that turn what you learn into a portfolio.", color: VIOLET, x: 110, y: 38, icon: "webdev", href: "/projects", cta: "See projects" },
  { title: "Internships", text: "Real work and mentor guidance with the MyLoginn team.", color: GREEN, x: 190, y: 82, icon: "career", href: "/internships", cta: "View internships" },
  { title: "Services", text: "Web, mobile, AI and marketing solutions for businesses.", color: AMBER, x: 270, y: 38, icon: "business", href: "/services", cta: "Explore services" },
];
const JOURNEY_PATH = "M30 82 C70 82 70 38 110 38 S150 82 190 82 S230 38 270 38";

export function JourneyMonitor() {
  const { index, pick, reduced } = useAutoIndex(JOURNEY.length, 3600);
  const cur = JOURNEY[index];
  return (
    <MonitorFrame interactive title="myloginn · learning journey" label={`Stage ${index + 1} of ${JOURNEY.length}`} pill="Learn, Build, Grow" ariaLabel="Interactive learning journey from courses to projects, internships and services. Select a stage to read about it.">
      <div className="flex h-full flex-col justify-between gap-2">
        <div className="relative w-full" style={{ aspectRatio: "300 / 108" }}>
          <svg aria-hidden viewBox="0 0 300 108" className="absolute inset-0 h-full w-full" fill="none">
            <path d={JOURNEY_PATH} stroke="var(--story-line)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="0.5 6" />
            <motion.path d={JOURNEY_PATH} stroke={cur.color} strokeWidth="2.5" strokeLinecap="round" pathLength={1} initial={false} animate={{ pathLength: index / (JOURNEY.length - 1) }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
          </svg>
          {JOURNEY.map((n, i) => {
            const on = i === index;
            const reached = i <= index;
            return (
              <button key={n.title} type="button" aria-pressed={on} aria-label={n.title} onClick={() => pick(i)} className="absolute -translate-x-1/2 -translate-y-1/2 outline-none" style={{ left: `${(n.x / 300) * 100}%`, top: `${(n.y / 108) * 100}%` }}>
                <motion.span
                  className="grid h-11 w-11 place-items-center rounded-full bg-surface sm:h-12 sm:w-12"
                  animate={{ scale: on ? 1.18 : 1, opacity: reached ? 1 : 0.55 }}
                  whileHover={{ scale: on ? 1.18 : 1.08 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{ boxShadow: on ? `0 0 0 3px ${n.color}, 0 12px 22px -10px ${n.color}` : "0 4px 12px -6px rgba(11,31,77,0.35)" }}
                >
                  <ContentIcon keyword={n.icon} className="h-7 w-7 sm:h-8 sm:w-8" />
                </motion.span>
              </button>
            );
          })}
          {!reduced && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-story-cyan shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]"
              initial={false}
              animate={{ left: `${(cur.x / 300) * 100}%`, top: `${((cur.y + 26) / 108) * 100}%`, opacity: [0.2, 1, 0.2] }}
              transition={{ left: { type: "spring", stiffness: 140, damping: 20 }, top: { type: "spring", stiffness: 140, damping: 20 }, opacity: { duration: 1.6, repeat: Infinity } }}
            />
          )}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="flex items-center gap-3 rounded-2xl bg-story-mist px-3.5 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold" style={{ color: cur.color }}>{cur.title}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted">{cur.text}</p>
            </div>
            <Link href={cur.href} className="group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95" style={{ background: cur.color }}>
              {cur.cta}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </MonitorFrame>
  );
}
