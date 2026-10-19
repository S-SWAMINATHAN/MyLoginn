"use client";

import { useEffect, useRef, useState } from "react";
import { FancyLink } from "@/components/ui/FancyButton";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { SCENARIOS } from "@/components/sections/hero/heroScenarios";
import { AppPhonesPreview } from "@/components/sections/home/showcase/WebAppTours";
import { CORE_SERVICES, type CoreServiceId } from "@/lib/coreServices";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Node positions on a 100 × 100 map: the five services sit on a ring around the MyLoginn core. */
const RING = 37;
const NODES = CORE_SERVICES.map((s, i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180);
  return { ...s, x: 50 + RING * Math.cos(angle), y: 50 + RING * Math.sin(angle) };
});

/** A small live screen for the selected service, reusing the hero's product screens; apps show on iOS and Android. */
function ServiceScreen({ id }: { id: CoreServiceId }) {
  if (id === "mobile") return <AppPhonesPreview className="h-[262px]" />;
  const scenario = SCENARIOS.find((s) => s.id === id)!;
  const Screen = scenario.screens.desktop;
  return (
    <div className="overflow-hidden rounded-xl border border-border-soft bg-white shadow-[var(--shadow-soft)] dark:bg-surface">
      <div className="flex items-center gap-1.5 border-b border-[#e3e7ee] bg-[#f4f6f9] px-3 py-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 truncate font-mono text-[9px] text-muted">{scenario.url}</span>
      </div>
      <div className="relative h-[230px]">
        <Screen />
      </div>
    </div>
  );
}

const AUTO_MS = 4500;

/**
 * 02 — Core technologies, drawn as an interactive technology map: MyLoginn at the centre, the five services around
 * it. The map walks through the services on its own (a segmented timer shows where it is) and holds while the pointer
 * is on it. Pointing at, tapping or focusing a service lights its connection, enlarges the node and opens what that
 * service delivers beside a live product screen.
 */
export function CoreTechnologies() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<CoreServiceId>("web");
  const index = CORE_SERVICES.findIndex((s) => s.id === active);
  const service = CORE_SERVICES[index];
  const Icon = service.icon;

  // The map advances through the services on its own while it is on screen, and holds while the pointer is on it.
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { margin: "-10% 0px" });
  const [held, setHeld] = useState(false);
  const auto = inView && !held && !reduced;
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => setActive(CORE_SERVICES[(index + 1) % CORE_SERVICES.length].id), AUTO_MS);
    return () => clearTimeout(t);
  }, [auto, index]);

  return (
    <Chapter formation="network" variant="core-technologies" id="core-technologies" title="MyLoginn core technologies">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Reveal><span className="story-eyebrow">Core technologies</span></Reveal>
          <SplitHeadline as="h2" text="Five capabilities. One connected team." className="story-subheading mt-4 text-story-navy" />
        </div>

        <div ref={stage} onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} className="mt-10 grid items-center gap-8 lg:mt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-12">
          {/* the map */}
          <div className="relative mx-auto aspect-square w-full max-w-[480px]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
              <circle cx="50" cy="50" r={RING + 9} fill="var(--story-mist)" opacity="0.55" />
              <circle cx="50" cy="50" r={RING} fill="none" stroke="var(--story-line)" strokeWidth="0.3" strokeDasharray="1 1.5" />
              <circle cx="50" cy="50" r={RING - 17} fill="none" stroke="var(--story-line)" strokeWidth="0.25" />
              {NODES.map((n) => {
                const on = n.id === active;
                const d = `M50 50 L${n.x} ${n.y}`;
                return (
                  <g key={n.id}>
                    <path d={d} stroke="var(--story-line)" strokeWidth="0.5" />
                    <motion.path
                      d={d}
                      stroke="var(--story-royal)"
                      strokeWidth="0.9"
                      strokeLinecap="round"
                      initial={false}
                      animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
                      transition={{ duration: 0.55, ease: EASE }}
                    />
                    {on && !reduced && (
                      <circle r="1.3" fill="var(--story-cyan)">
                        <animateMotion dur="1.3s" repeatCount="indefinite" path={d} />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* the MyLoginn core: a flat disc that sends out a ripple whenever the connection moves */}
            <div className="absolute left-1/2 top-1/2 grid h-[25%] w-[25%] -translate-x-1/2 -translate-y-1/2 place-items-center">
              {!reduced && <motion.span key={active} aria-hidden className="absolute inset-0 rounded-full border-2 border-story-royal" initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 1.9, opacity: 0 }} transition={{ duration: 1.1, ease: "easeOut" }} />}
              <span className="relative grid h-full w-full place-items-center rounded-full bg-story-royal text-center shadow-[0_18px_40px_-18px_rgba(31,86,214,0.8)]">
                <span aria-hidden className="absolute inset-[7%] rounded-full border border-white/25" />
                <span className="relative text-[9px] font-black tracking-[0.2em] text-white sm:text-[11px]">MYLOGINN</span>
              </span>
            </div>

            {/* service nodes */}
            {NODES.map((n) => {
              const on = n.id === active;
              const NodeIcon = n.icon;
              return (
                <motion.button
                  key={n.id}
                  type="button"
                  aria-pressed={on}
                  aria-label={n.name}
                  onMouseEnter={() => setActive(n.id)}
                  onFocus={() => setActive(n.id)}
                  onClick={() => setActive(n.id)}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 outline-none"
                  style={{ left: `${n.x}%`, top: `${n.y}%` }}
                  initial={false}
                  animate={{ scale: on ? 1.12 : 1, opacity: on ? 1 : 0.7 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <span
                    className={cn(
                      "grid h-12 w-12 place-items-center rounded-2xl border transition-colors duration-300 sm:h-14 sm:w-14",
                      on ? "border-story-royal bg-story-royal text-white shadow-[0_14px_30px_-12px_rgba(31,86,214,0.8)]" : "border-border-soft bg-surface text-story-royal shadow-[var(--shadow-soft)]",
                    )}
                  >
                    <NodeIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </span>
                  <span className={cn("whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors sm:text-xs", on ? "bg-story-royal text-white" : "bg-surface/80 text-story-navy dark:text-foreground")}>{n.short}</span>
                </motion.button>
              );
            })}
          </div>

          {/* what the selected service delivers */}
          <div className="min-w-0 rounded-3xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] sm:p-7">
            {/* segmented timer: one segment per service; the current one fills until the map moves on */}
            <div className="flex gap-1.5" role="tablist" aria-label="Services">
              {CORE_SERVICES.map((s, i) => (
                <button key={s.id} role="tab" aria-selected={i === index} aria-label={s.name} onClick={() => setActive(s.id)} className="group h-5 flex-1 outline-none">
                  <span className="relative block h-1 overflow-hidden rounded-full bg-border-soft">
                    <motion.span
                      key={`${s.id}-${i === index ? `${auto}` : "x"}`}
                      className="absolute inset-y-0 left-0 rounded-full bg-story-royal"
                      initial={{ width: i < index ? "100%" : 0 }}
                      animate={{ width: i <= index ? "100%" : 0 }}
                      transition={{ duration: i === index && auto ? AUTO_MS / 1000 : 0.25, ease: i === index && auto ? "linear" : EASE }}
                    />
                  </span>
                </button>
              ))}
            </div>

            <div className="relative mt-5 min-h-[470px] sm:min-h-[440px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 shrink-0 text-story-royal" />
                    <h3 className="min-w-0 flex-1 text-2xl font-bold tracking-tight text-story-navy dark:text-foreground">{service.name}</h3>
                    <span className="shrink-0 text-xs font-bold tabular-nums tracking-[0.16em] text-muted">0{index + 1} / 0{CORE_SERVICES.length}</span>
                  </div>
                  <p className="mt-3 text-base leading-7 text-muted">{service.summary}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                    {service.points.map((p, i) => (
                      <motion.li key={p} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.07, duration: 0.35 }} className="flex items-start gap-2 rounded-xl bg-story-mist px-3 py-2.5 text-[13px] font-semibold leading-snug text-story-navy dark:text-foreground">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-story-royal" strokeWidth={3} />
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-5"><ServiceScreen id={service.id} /></div>
                  <div className="mt-5"><FancyLink href={service.href} variant="primary" className="whitespace-nowrap">Explore {service.name.toLowerCase()}</FancyLink></div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </Chapter>
  );
}
