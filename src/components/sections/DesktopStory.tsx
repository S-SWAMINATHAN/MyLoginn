"use client";

import { motion } from "framer-motion";
import { Chapter } from "@/components/experience/Chapter";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { openProjectRequest } from "@/components/services/ProjectRequestModal";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SIDEBAR_ITEMS = ["Dashboard", "Analytics", "Workflow", "Users", "Reports"];
const METRICS = ["Revenue", "Active users", "Tasks done"];
const SPARK_ROWS = [
  [30, 55, 42, 68],
  [45, 32, 60, 50],
  [58, 40, 70, 48],
];
const BARS = [38, 62, 46, 80, 54, 70, 42];

function StatTile({ label, sparks, delay }: { label: string; sparks: number[]; delay: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="card-shine relative overflow-hidden rounded-xl border border-border-soft bg-surface/70 p-2.5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-story-cyan opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-story-cyan" />
        </span>
        <p className="text-[9px] uppercase tracking-wide text-muted">{label}</p>
      </div>
      <div className="mt-2 flex h-5 items-end gap-1">
        {sparks.map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 rounded-full"
            style={{ background: i % 2 === 0 ? "var(--story-royal)" : "var(--story-cyan)" }}
            animate={
              reducedMotion
                ? { height: `${h}%` }
                : { height: [`${Math.max(20, h - 25)}%`, `${h}%`, `${Math.max(20, h - 25)}%`] }
            }
            transition={{
              duration: 1.7 + i * 0.2,
              repeat: reducedMotion ? 0 : Infinity,
              ease: "easeInOut",
              delay: delay + i * 0.12,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function BarChart() {
  return (
    <div className="relative mt-3 flex h-24 items-end gap-1.5 overflow-hidden rounded-xl border border-border-soft p-3">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 animate-[icon-thumb-shimmer_3.4s_linear_infinite] bg-[length:200%_100%] bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.5)_50%,transparent_60%)]"
      />
      {BARS.map((h, i) => (
        <motion.div
          key={i}
          className="relative flex-1 animate-bar-bob rounded-t-sm"
          style={{
            background: i % 2 === 0 ? "var(--story-royal)" : "var(--story-cyan)",
            opacity: 0.85,
            animationDelay: `${1 + i * 0.12}s`,
          }}
          initial={{ height: "0%" }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="gradient-border relative mx-auto w-full max-w-lg overflow-hidden rounded-2xl">
      <div className="story-panel card-shine relative overflow-hidden rounded-2xl">
        <div className="flex items-center gap-1.5 border-b border-border-soft px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-brand-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-brand-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-story-cyan" />
          <span className="ml-3 h-2 w-24 rounded-full bg-surface-2" />
        </div>
        <div className="flex">
          <div className="hidden w-32 shrink-0 flex-col gap-1 border-r border-border-soft p-3 sm:flex">
            {SIDEBAR_ITEMS.map((item, i) => (
              <span
                key={item}
                className="rounded-lg px-2.5 py-2 text-[11px] font-medium transition-colors duration-300"
                style={i === 0 ? { background: "var(--brand-50)", color: "var(--story-royal)" } : { color: "var(--muted)" }}
              >
                {item}
              </span>
            ))}
          </div>
          <div className="flex-1 p-4">
            <div className="grid grid-cols-3 gap-2.5">
              {METRICS.map((label, i) => (
                <StatTile key={label} label={label} sparks={SPARK_ROWS[i]} delay={i * 0.15} />
              ))}
            </div>
            <BarChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DesktopStory() {
  return (
    <Chapter formation="grid" variant="desktop" title="Desktop and custom software">
      <div className="mx-auto w-full max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="story-eyebrow justify-center">Desktop &amp; custom software</span>
        </Reveal>

        <SplitHeadline
          as="h2"
          text="Software that fits the business."
          className="story-subheading mx-auto mt-4 max-w-xl text-story-navy"
        />

        <Reveal direction="up" delay={0.15}>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted sm:text-base">
            Different businesses need different technology. We build the internal tools, dashboards and desktop
            software that off-the-shelf products can&apos;t &mdash; shaped around how your team actually works.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.3} className="mt-10">
          <DashboardMockup />
        </Reveal>

        <Reveal direction="up" delay={0.45} className="mt-8">
          <Button type="button" onClick={() => openProjectRequest("software")} variant="outline">
            Talk about custom software
          </Button>
        </Reveal>
      </div>
    </Chapter>
  );
}
