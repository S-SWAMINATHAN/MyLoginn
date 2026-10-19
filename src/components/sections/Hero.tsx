"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Chapter } from "@/components/experience/Chapter";
import { FancyLink } from "@/components/ui/FancyButton";
import { PlanButton } from "@/components/ui/PlanButton";
import { ServiceGlyph } from "@/components/ui/ServiceGlyph";
import { openProjectRequest } from "@/components/services/ProjectRequestModal";
import { HeroShowroom } from "@/components/sections/hero/HeroShowroom";
import { HeroStageLabel } from "@/components/sections/hero/HeroStageLabel";
import { HeroWordmark } from "@/components/sections/hero/HeroWordmark";
import { SCENARIOS, withSet, type DeviceId, type ScenarioId } from "@/components/sections/hero/heroScenarios";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

const SCENARIO_MS = 6500;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Opening sequence, in seconds: hologram → kinetic headline → devices → services start rotating. */
const T_HEADLINE = 0;
const T_DEVICES = 0;

/** Each headline verb owns the services it stands for; the verb for the service on screen lights up. */
const WORDS: { w: string; ids: ScenarioId[] }[] = [
  { w: "Build.", ids: ["web", "mobile", "software"] },
  { w: "Automate.", ids: ["ai"] },
  { w: "Grow.", ids: ["marketing"] },
];

const GRADIENT = "linear-gradient(100deg, var(--story-royal), var(--story-electric) 55%, var(--story-cyan))";

/** The project-request form has no separate AI option; AI agent work is requested as custom software. */
const REQUEST: Record<ScenarioId, "web" | "mobile" | "software" | "marketing"> = { web: "web", mobile: "mobile", software: "software", ai: "software", marketing: "marketing" };

/** A service disc on the module rail. The disc for the service on show carries a ring that fills until the next one. */
function ModuleDisc({ id, on, timed, reduced }: { id: ScenarioId; on: boolean; timed: boolean; reduced: boolean }) {
  return (
    <span className="relative grid h-11 w-11 place-items-center">
      <motion.span className="absolute inset-[3px] rounded-full" initial={false} animate={{ backgroundColor: on ? "#1f56d6" : "#eaf1ff" }} transition={{ duration: 0.3 }} />
      <ServiceGlyph name={id} active={on} className="relative h-6 w-6" />
      {on && (
        <svg aria-hidden viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
          <circle cx="22" cy="22" r="20.5" fill="none" stroke="rgba(31,86,214,0.15)" strokeWidth="1.5" />
          <motion.circle
            cx="22" cy="22" r="20.5" fill="none" stroke="var(--story-royal)" strokeWidth="1.5" strokeLinecap="round"
            initial={{ pathLength: timed && !reduced ? 0 : 1 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: timed && !reduced ? SCENARIO_MS / 1000 : 0, ease: "linear" }}
          />
        </svg>
      )}
    </span>
  );
}

/**
 * Home hero as a white technology showroom: "Build. Automate. Grow." and one line on what MyLoginn delivers sit above
 * it; a tablet, a monitor and a phone cycle through the five core services, with the service on show named on the
 * stage beneath them. The module rail and the actions sit underneath. Pointing at a device or a module pauses the tour
 * and brings that service forward; on phones a sideways swipe across the devices moves between services.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [exploring, setExploring] = useState(false);
  // Bumped on every scenario change so the selector ring restarts.
  const [run, setRun] = useState(0);
  // The headline verbs light up one after another on their own; pointing at a verb lights that one instead.
  const [word, setWord] = useState(0);
  const [hoverWord, setHoverWord] = useState<number | null>(null);

  // How many times each service has come round; every visit plays its next sample set.
  const [visits, setVisits] = useState<number[]>(() => SCENARIOS.map(() => 0));
  const scenario = withSet(SCENARIOS[index], visits[index]);

  useEffect(() => {
    if (reduced || hoverWord !== null) return;
    const id = window.setInterval(() => setWord((w) => (w + 1) % WORDS.length), 1800);
    return () => window.clearInterval(id);
  }, [reduced, hoverWord]);
  const litWord = hoverWord ?? word;

  const indexRef = useRef(0);
  const select = useCallback((i: number) => {
    // count the service being left, so each service opens on its first sample set and shows the next one next time
    const left = indexRef.current;
    if (i !== left) setVisits((v) => v.map((n, k) => (k === left ? n + 1 : n)));
    indexRef.current = i;
    setIndex(i);
    setRun((r) => r + 1);
  }, []);

  // Auto-advance unless the visitor is exploring. The first change also waits for the opening sequence.
  useEffect(() => {
    if (reduced || exploring) return;
    const wait = SCENARIO_MS + (run === 0 ? T_DEVICES * 1000 : 0);
    const t = window.setTimeout(() => select((index + 1) % SCENARIOS.length), wait);
    return () => window.clearTimeout(t);
  }, [index, run, exploring, reduced, select]);

  const exploreDevice = useCallback((device: DeviceId) => {
    setExploring(true);
    if (SCENARIOS[index].device === device) return;
    const next = SCENARIOS.findIndex((s) => s.device === device);
    if (next >= 0) select(next);
  }, [index, select]);

  const exploreService = (i: number) => {
    setExploring(true);
    if (i !== index) select(i);
  };

  const leave = useCallback(() => { setExploring(false); setRun((r) => r + 1); }, []);
  const swipe = useCallback((dir: 1 | -1) => select((indexRef.current + dir + SCENARIOS.length) % SCENARIOS.length), [select]);

  const at = (s: number) => (reduced ? 0 : s);

  return (
    <Chapter formation="stream" variant="hero" title="MyLoginn — web development, app development, AI agents, digital marketing and custom software" className="!min-h-0 !py-0">
      <div className="relative overflow-hidden bg-white">
        {/* soft studio light from above and a faint floor grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(70% 55% at 50% 0%, rgba(47,111,237,0.10), transparent 70%), radial-gradient(60% 40% at 50% 100%, rgba(34,211,238,0.10), transparent 70%)" }} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-70"
          style={{
            backgroundImage: "linear-gradient(var(--story-line) 1px, transparent 1px), linear-gradient(90deg, var(--story-line) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "linear-gradient(to top, #000, transparent)",
            WebkitMaskImage: "linear-gradient(to top, #000, transparent)",
            transform: "perspective(600px) rotateX(55deg)",
            transformOrigin: "bottom",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-2 sm:px-8 sm:pt-3 lg:pb-14">
          {/* headline and the service on show */}
          <motion.div
            className="relative mx-auto max-w-3xl px-2 pb-6 pt-2 text-center sm:pb-8 sm:pt-3"
            initial={false}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="relative">
              <div className="mb-2 flex justify-center"><HeroWordmark delay={at(0.05)} /></div>
              <h1 className="text-[1.9rem] font-bold leading-tight tracking-[-0.03em] text-story-navy min-[400px]:text-[2.2rem] sm:text-5xl dark:text-foreground" onMouseLeave={() => { setHoverWord(null); if (exploring) leave(); }}>
                {WORDS.map(({ w, ids }, i) => {
                  const lit = i === litWord;
                  return (
                    <span key={w}>
                      <span className="relative inline-block overflow-hidden pb-[0.08em] align-bottom" onMouseEnter={() => { setHoverWord(i); exploreService(ids.includes(scenario.id) ? index : SCENARIOS.findIndex((s) => s.id === ids[0])); }}>
                        <motion.span
                          className="relative inline-grid"
                          initial={false}
                          animate={{ y: "0%" }}
                          transition={{ duration: 0.8, ease: EASE, delay: at(T_HEADLINE + i * 0.22) }}
                        >
                          <motion.span className="col-start-1 row-start-1" animate={{ opacity: lit ? 0 : 1 }} transition={{ duration: 0.5 }}>{w}</motion.span>
                          <motion.span aria-hidden className="col-start-1 row-start-1 bg-clip-text text-transparent" style={{ backgroundImage: GRADIENT }} animate={{ opacity: lit ? 1 : 0 }} transition={{ duration: 0.5 }}>{w}</motion.span>
                        </motion.span>
                      </span>
                      {i < WORDS.length - 1 && " "}
                    </span>
                  );
                })}
                <span className="sr-only"> MyLoginn is a technology company that builds websites, mobile apps, desktop applications, AI agents and digital marketing for businesses.</span>
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted sm:text-base sm:leading-7">
                Web platforms, mobile and desktop apps, AI agents and digital marketing, built around how your business works.
              </p>
            </div>
          </motion.div>

          {/* the showroom */}
          <div className="mt-2 sm:mt-0">
            <HeroShowroom
              scenario={scenario}
              focus={scenario.device}
              exploring={exploring}
              onExplore={exploreDevice}
              onLeave={leave}
              introDelay={at(T_DEVICES)}
              onSwipe={swipe}
              below={<HeroStageLabel scenario={scenario} n={index + 1} total={SCENARIOS.length} />}
            />
          </div>

          {/* the five modules, and the actions */}
          <div className="mt-6 flex flex-col items-center gap-5 lg:mt-8 lg:flex-row lg:justify-center lg:gap-8">
            <div role="tablist" aria-label="Our services" className="flex items-start gap-1 sm:gap-2" onMouseLeave={() => { if (exploring) leave(); }}>
              {SCENARIOS.map((s, i) => {
                const on = i === index;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-label={s.area}
                    onMouseEnter={() => exploreService(i)}
                    onFocus={() => exploreService(i)}
                    onClick={() => select(i)}
                    className="group flex w-[3.9rem] flex-col items-center gap-1 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-story-royal sm:w-[4.6rem]"
                  >
                    <ModuleDisc key={on ? `${s.id}-${run}` : s.id} id={s.id} on={on} timed={!exploring} reduced={reduced} />
                    <span className={cn("text-[11px] font-semibold leading-tight transition-colors", on ? "text-story-royal" : "text-muted group-hover:text-foreground")}>{s.label}</span>
                  </button>
                );
              })}
            </div>
            <span aria-hidden className="hidden h-10 w-px bg-border-soft lg:block" />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <FancyLink href="#services" variant="primary" className="whitespace-nowrap">Explore solutions</FancyLink>
              <PlanButton label="Start a project" tone="light" onClick={() => openProjectRequest(REQUEST[scenario.id])} />
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
