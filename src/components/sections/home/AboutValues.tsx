"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Lightbulb, ShieldCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { FancyLink } from "@/components/ui/FancyButton";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const VALUES: { name: string; line: string; icon: LucideIcon }[] = [
  { name: "Intelligence", line: "We bring data and AI into decisions, so every product is smarter than the last.", icon: Brain },
  { name: "Innovation", line: "We apply modern technology to practical business problems, not trends for their own sake.", icon: Lightbulb },
  { name: "Integrity", line: "Clear scope, honest timelines and open communication from the first call to go-live.", icon: ShieldCheck },
  { name: "Impact", line: "We measure success by what changes for your business after launch.", icon: TrendingUp },
];

/**
 * 07 — Who we are and what we value. The four values form one interactive system: the chosen value expands and
 * explains itself while the others narrow, horizontally on large screens and as an accordion on small ones.
 */
export function AboutValues() {
  const [active, setActive] = useState(0);

  return (
    <Chapter formation="grid" variant="about" id="about" title="About MyLoginn">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <div>
            <Reveal><span className="story-eyebrow">Who we are</span></Reveal>
            <SplitHeadline as="h2" text="A technology company built to deliver." className="story-subheading mt-4 text-story-navy" />
            <Reveal direction="up" delay={0.1}>
              <p className="mt-5 max-w-md text-base leading-7 text-muted">
                MyLoginn Tech is an India-based IT company. One team designs, builds, markets and launches digital products for businesses across India and worldwide.
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.18} className="mt-6"><FancyLink href="/about" variant="primary" arrow="right">About MyLoginn</FancyLink></Reveal>
          </div>

          <div className="flex flex-col gap-2 lg:h-[340px] lg:flex-row">
            {VALUES.map((v, i) => {
              const on = i === active;
              const Icon = v.icon;
              return (
                <motion.button
                  key={v.name}
                  type="button"
                  aria-expanded={on}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  layout
                  transition={{ layout: { duration: 0.5, ease: EASE } }}
                  className={cn(
                    "relative overflow-hidden rounded-3xl border text-left outline-none focus-visible:ring-2 focus-visible:ring-story-royal",
                    on ? "border-transparent text-white lg:flex-[3]" : "border-border-soft bg-surface lg:flex-1",
                  )}
                  style={on ? { backgroundImage: "radial-gradient(120% 100% at 100% 0%, var(--story-electric), var(--story-royal) 45%, var(--story-navy))" } : undefined}
                >
                  {on && <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />}
                  <div className="relative flex h-full flex-col p-5 lg:p-6">
                    <div className="flex items-center gap-3 lg:flex-col lg:items-start">
                      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", on ? "bg-white/15" : "bg-story-mist text-story-royal")}><Icon className="h-5 w-5" /></span>
                      <span className="font-mono text-xs opacity-70">0{i + 1}</span>
                    </div>
                    <h3 className={cn("mt-3 text-xl font-bold tracking-tight lg:mt-auto", on ? "text-white" : "text-story-navy dark:text-foreground", !on && "lg:[writing-mode:vertical-rl] lg:rotate-180 lg:self-start")}>{v.name}</h3>
                    <AnimatePresence initial={false}>
                      {on && (
                        <motion.p
                          initial={{ opacity: 0, height: 0, y: 8 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
                          className="mt-2 max-w-sm text-sm leading-6 text-white/85"
                        >
                          {v.line}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </Chapter>
  );
}
