"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Chapter } from "@/components/experience/Chapter";
import { FancyLink } from "@/components/ui/FancyButton";
import { HeroShowroom } from "@/components/sections/hero/HeroShowroom";
import { HeroWordmark } from "@/components/sections/hero/HeroWordmark";
import { SCENARIOS, withSet, type DeviceId, type ScenarioId } from "@/components/sections/hero/heroScenarios";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SCENARIO_MS = 6500;
const EASE = [0.16, 1, 0.3, 1] as const;

/** Opening sequence, in seconds: hologram → kinetic headline → devices → services start rotating. */
const T_HEADLINE = 0.35;
const T_DEVICES = 1.3;

/** Each headline verb owns the services it stands for; the verb for the service on screen lights up. */
const WORDS: { w: string; ids: ScenarioId[] }[] = [
  { w: "Build.", ids: ["web", "mobile", "software"] },
  { w: "Automate.", ids: ["ai"] },
  { w: "Grow.", ids: ["marketing"] },
];

const GRADIENT = "linear-gradient(100deg, var(--story-royal), var(--story-electric) 55%, var(--story-cyan))";

/**
 * Home hero as a white technology showroom: "Build. Automate. Grow." and the service on show sit above it; a tablet, a monitor and a phone stand on a lit platform and cycle through the five core services;
 * glass consoles at the front hold the actions and the service selector. Pointing at a device or a service pauses
 * the tour and brings that service forward.
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
            initial={reduced ? false : { opacity: 0, scale: 0.94, filter: "blur(8px)" }}
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
                          initial={reduced ? false : { y: "105%" }}
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
                <span className="sr-only"> MyLoginn is an IT company for web development, app development, AI agents, digital marketing and custom software and desktop applications.</span>
              </h1>

              {/* the service on show */}
              <div className="mt-3 grid" aria-live="polite">
                {SCENARIOS.map((s, i) => {
                  const on = i === index;
                  return (
                    <motion.div
                      key={s.id}
                      aria-hidden={on ? undefined : true}
                      className="col-start-1 row-start-1"
                      style={{ visibility: on ? "visible" : "hidden" }}
                      initial={false}
                      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 8 }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <p className="text-sm font-bold uppercase tracking-[0.16em] text-story-royal sm:text-lg">0{i + 1} — {s.area}</p>
                      <p className="mt-1 text-sm text-muted sm:text-base">{s.tagline}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* the showroom, with the calls to action centred under the monitor */}
          <div className="mt-2 sm:mt-0">
            <HeroShowroom
              scenario={scenario}
              focus={scenario.device}
              exploring={exploring}
              onExplore={exploreDevice}
              onLeave={leave}
              introDelay={at(T_DEVICES)}
              below={
                <motion.div
                  className="flex items-center gap-3"
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: at(T_DEVICES + 0.5) }}
                >
                  <FancyLink href="/contact" variant="primary" arrow="right" className="whitespace-nowrap">Start your project</FancyLink>
                </motion.div>
              }
            />
          </div>
        </div>
      </div>
    </Chapter>
  );
}
