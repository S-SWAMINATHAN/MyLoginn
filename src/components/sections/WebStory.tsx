"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Pipeline } from "@/components/sections/parts/Pipeline";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { openProjectRequest } from "@/components/services/ProjectRequestModal";
import { useReducedMotion } from "@/lib/useReducedMotion";

const PIPELINE_STEPS = ["Idea", "Design", "Frontend", "Backend", "API", "Database", "Testing", "Deployment"];

type ScreenKey = "ui" | "api" | "database" | "auth" | "payments" | "admin" | "analytics";
const SCREENS: ScreenKey[] = ["ui", "api", "database", "auth", "payments", "admin", "analytics"];
const LABELS: Record<ScreenKey, string> = {
  ui: "UI",
  api: "API",
  database: "Database",
  auth: "Authentication",
  payments: "Payments",
  admin: "Admin",
  analytics: "Analytics",
};

function Bar({ w = "100%", h = "0.6rem", tone = "light" }: { w?: string; h?: string; tone?: "light" | "brand" | "dark" }) {
  const bg = tone === "brand" ? "var(--story-royal)" : tone === "dark" ? "var(--story-navy)" : "var(--story-mist)";
  return <div style={{ width: w, height: h, background: bg, borderRadius: 999 }} />;
}

function ScreenContent({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case "ui":
      return (
        <div className="flex h-full flex-col gap-3">
          <Bar w="40%" h="0.85rem" tone="dark" />
          <div className="grid flex-1 grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg" style={{ background: "var(--story-mist)" }} />
            ))}
          </div>
        </div>
      );
    case "api":
      return (
        <div className="flex h-full flex-col justify-center gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--story-cyan)" }} />
              <Bar w={i % 2 === 0 ? "70%" : "45%"} h="0.55rem" />
            </div>
          ))}
        </div>
      );
    case "database":
      return (
        <div className="flex h-full flex-col justify-center gap-2">
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Bar key={i} h="0.55rem" tone="dark" />
            ))}
          </div>
          {[0, 1, 2].map((row) => (
            <div key={row} className="grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((col) => (
                <Bar key={col} h="0.45rem" />
              ))}
            </div>
          ))}
        </div>
      );
    case "auth":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2.5">
          <div
            className="h-9 w-9 rounded-xl"
            style={{ background: "linear-gradient(135deg,var(--story-royal),var(--story-cyan))" }}
          />
          <div className="w-2/3 space-y-1.5">
            <Bar h="1.3rem" />
            <Bar h="1.3rem" />
          </div>
          <div className="w-2/3">
            <Bar h="1.5rem" tone="brand" />
          </div>
        </div>
      );
    case "payments":
      return (
        <div className="flex h-full flex-col justify-center gap-2.5 px-2">
          <div className="rounded-xl p-3" style={{ background: "linear-gradient(135deg,var(--story-navy),var(--story-royal))" }}>
            <div className="h-2.5 w-7 rounded-sm bg-white/70" />
            <div className="mt-4 h-1.5 w-20 rounded-full bg-white/60" />
          </div>
          <Bar h="1.5rem" tone="brand" />
        </div>
      );
    case "admin":
      return (
        <div className="flex h-full gap-2.5">
          <div className="flex w-1/4 flex-col gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <Bar key={i} h="0.5rem" />
            ))}
          </div>
          <div className="grid flex-1 grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg" style={{ background: "var(--story-mist)" }} />
            ))}
          </div>
        </div>
      );
    case "analytics":
      return (
        <div className="flex h-full items-end justify-center gap-2.5 px-2 pb-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-4 rounded-t-md"
              style={{
                height: `${30 + ((i * 37) % 55)}%`,
                background: i % 2 === 0 ? "var(--story-royal)" : "var(--story-cyan)",
              }}
            />
          ))}
        </div>
      );
  }
}

function ComputerMockup() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % SCREENS.length), 2400);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const screen = SCREENS[reducedMotion ? 0 : index];

  return (
    <div className="relative mx-auto flex flex-col items-center">
      <div
        className="relative w-full overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-lift)]"
        style={{ border: "6px solid var(--story-navy)" }}
      >
        <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: "var(--story-mist)" }}>
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--story-cyan)" }} />
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--story-royal)" }} />
          <span className="h-2 w-2 rounded-full" style={{ background: "var(--story-navy)" }} />
          <div className="ml-2 h-3 flex-1 rounded-full" style={{ background: "var(--story-mist)" }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="h-[150px] w-full p-3.5 min-[380px]:h-[210px] min-[380px]:p-5"
          >
            <ScreenContent screen={screen} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="h-4 w-16"
        style={{ background: "var(--story-navy)", clipPath: "polygon(30% 0, 70% 0, 90% 100%, 10% 100%)" }}
      />
      <div className="h-1.5 w-28 rounded-full" style={{ background: "var(--story-navy)" }} />

      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted">{LABELS[screen]}</p>

      <svg width="150" height="46" viewBox="0 0 150 46" className="mt-1 hidden sm:block" aria-hidden>
        <path d="M5,8 C55,-5 95,50 145,20" fill="none" stroke="var(--story-line)" strokeWidth="2" />
        {!reducedMotion && (
          <circle r="4" fill="var(--story-cyan)">
            <animateMotion dur="2.4s" repeatCount="indefinite" path="M5,8 C55,-5 95,50 145,20" />
          </circle>
        )}
      </svg>
      <span className="story-panel rounded-full px-4 py-1.5 text-xs font-semibold text-story-navy">Full-Stack Engineering</span>
    </div>
  );
}

export function WebStory() {
  return (
    <Chapter formation="grid" variant="web" title="Web development">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-10 px-4 sm:gap-12 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="min-w-0 text-center lg:text-left">
          <Reveal>
            <span className="story-eyebrow justify-center lg:justify-start">Web development</span>
          </Reveal>

          <SplitHeadline
            as="h2"
            text="We build digital experiences."
            className="story-subheading mx-auto mt-4 max-w-lg text-story-navy lg:mx-0"
          />

          <Reveal direction="up" delay={0.15}>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted sm:text-base lg:mx-0">
              From high-performance websites to complex web applications, we design and build digital products
              around real business needs &mdash; not templates.
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.3} className="mt-8">
            <Pipeline steps={PIPELINE_STEPS} className="justify-center lg:justify-start" />
          </Reveal>

          <Reveal direction="up" delay={0.4} className="mt-8 flex justify-center lg:justify-start">
            <Button type="button" onClick={() => openProjectRequest("web")} variant="outline">
              Plan a web project
            </Button>
          </Reveal>
        </div>

        <div className="mx-auto w-full max-w-[14rem] min-w-0 min-[380px]:max-w-sm">
          <ComputerMockup />
        </div>
      </div>
    </Chapter>
  );
}
