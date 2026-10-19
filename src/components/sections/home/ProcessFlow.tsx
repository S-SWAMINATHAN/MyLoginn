"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ClipboardList, CodeXml, FlaskConical, PenTool, Rocket, Search, TrendingUp } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  { label: "Discover", desc: "Understand your business, users and goals.", icon: Search },
  { label: "Plan", desc: "Scope, priorities and a clear delivery roadmap.", icon: ClipboardList },
  { label: "Design", desc: "Interfaces and journeys shaped around your users.", icon: PenTool },
  { label: "Develop", desc: "Clean, scalable code built in visible milestones.", icon: CodeXml },
  { label: "Test", desc: "Every key journey checked across devices.", icon: FlaskConical },
  { label: "Deploy", desc: "Hosting, domain, SSL and a smooth go-live.", icon: Rocket },
  { label: "Grow", desc: "Marketing, analytics and continuous improvement.", icon: TrendingUp },
];

/**
 * 05 — Process. A technology workflow rather than a numbered list: a line fills as the visitor scrolls, each step
 * activates as the line reaches it, and the current stage name changes in large kinetic type beside it.
 */
export function ProcessFlow() {
  const reduced = useReducedMotion();
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 65%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length))));
  });

  const current = STEPS[reduced ? STEPS.length - 1 : active];

  return (
    <Chapter formation="grid" variant="process" id="process" title="How we work">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <div className="lg:sticky lg:top-28">
            <Reveal><span className="story-eyebrow">How we work</span></Reveal>
            <SplitHeadline as="h2" text="From first idea to measurable growth." className="story-subheading mt-4 text-story-navy" />
            {/* the stage in progress, as kinetic type */}
            <div className="mt-8 hidden h-24 overflow-hidden lg:block" aria-hidden>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={current.label}
                  initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
                  animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: "-60%", opacity: 0, filter: "blur(8px)" }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="text-7xl font-bold tracking-tight text-story-royal"
                >
                  {current.label}
                </motion.p>
              </AnimatePresence>
            </div>
            <p className="mt-2 hidden font-mono text-sm text-muted lg:block">Step 0{STEPS.indexOf(current) + 1} of 0{STEPS.length}</p>
          </div>
        </div>

        <ol ref={listRef} className="relative">
          {/* the track and its scroll-linked fill */}
          <span aria-hidden className="absolute bottom-6 left-[21px] top-6 w-0.5 rounded-full bg-story-line" />
          <motion.span aria-hidden className="absolute bottom-6 left-[21px] top-6 w-0.5 origin-top rounded-full" style={{ scaleY: reduced ? 1 : fill, background: "var(--story-royal)" }} />

          {STEPS.map((s, i) => {
            const on = reduced || i <= active;
            const current = !reduced && i === active;
            // steps the line has passed are complete: their circle fills solid blue
            const done = reduced || i < active;
            const Icon = s.icon;
            return (
              <li key={s.label} className="group relative flex gap-5 py-4">
                {/* No box and no gradients: a solid ring draws itself round the step as the line reaches it, the icon
                    flips in, the current step sends out a thin ripple, and completed steps fill solid blue. */}
                <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center [perspective:400px]">
                  <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90 overflow-visible" aria-hidden>
                    <motion.circle cx="22" cy="22" r="20" stroke="var(--story-line)" strokeWidth="1.5" initial={false} animate={{ fill: done ? "#1f56d6" : "#ffffff" }} transition={{ duration: 0.45, ease: EASE, delay: done ? 0.25 : 0 }} />
                    <motion.circle cx="22" cy="22" r="20" fill="none" stroke="#1f56d6" strokeWidth="2.5" strokeLinecap="round" initial={false} animate={{ pathLength: on ? 1 : 0 }} transition={{ duration: 0.7, ease: EASE }} />
                    {current && (
                      <circle cx="22" cy="22" r="20" fill="none" stroke="#1f56d6" strokeWidth="1.2">
                        <animate attributeName="r" values="20;30" dur="1.6s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0" dur="1.6s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </svg>
                  <motion.span
                    key={on ? "on" : "off"}
                    className={cn("relative transition-colors duration-500", done ? "text-white" : on ? "text-story-royal" : "text-[#94a3b8] group-hover:text-story-royal")}
                    initial={reduced ? false : on ? { rotateY: 180, scale: 0.5, opacity: 0 } : { opacity: 0 }}
                    animate={{ rotateY: 0, scale: current ? 1.15 : 1, opacity: 1 }}
                    whileHover={reduced ? undefined : { rotate: [0, -12, 10, 0], transition: { duration: 0.5 } }}
                    transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={on ? 2.1 : 1.6} />
                  </motion.span>
                </span>
                <motion.div className="pt-1.5" initial={false} animate={{ x: on ? 0 : 6, opacity: on ? 1 : 0.55 }} transition={{ duration: 0.45, ease: EASE }}>
                  <h3 className={cn("text-lg font-semibold transition-colors duration-300", on ? "text-story-navy dark:text-foreground" : "text-muted")}>
                    <span className="mr-2 font-mono text-xs text-story-royal">0{i + 1}</span>{s.label}
                  </h3>
                  <p className="mt-0.5 text-sm leading-6 text-muted">{s.desc}</p>
                </motion.div>
              </li>
            );
          })}
        </ol>
      </div>
    </Chapter>
  );
}
