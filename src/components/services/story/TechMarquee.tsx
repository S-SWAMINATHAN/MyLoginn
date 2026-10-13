"use client";

import { useState, type CSSProperties } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";

const ACCENTS = ["#2563eb", "#7c3aed", "#059669", "#d97706", "#e11d48"];

function Row({ tools, hidden }: { tools: string[]; hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-3 pr-3">
      {tools.map((t, i) => {
        const c = ACCENTS[i % ACCENTS.length];
        return (
          <li
            key={t}
            style={{ "--c": c } as CSSProperties}
            className="group flex shrink-0 cursor-default items-center gap-2.5 rounded-xl border border-border-soft bg-surface px-4 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--c)] hover:shadow-[0_10px_22px_-12px_var(--c)]"
          >
            <span aria-hidden className="relative grid h-2.5 w-2.5 place-items-center">
              <span className="absolute inset-0 rounded-full opacity-30 transition-transform duration-300 group-hover:scale-[2.2]" style={{ background: c }} />
              <span className="relative h-2 w-2 rounded-full" style={{ background: c }} />
            </span>
            <span className="whitespace-nowrap">{t}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** One continuous line of technology chips that glides by on its own and pauses on hover. Static and scrollable with reduced motion. */
export function TechMarquee({ tools }: { tools: string[] }) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const duration = Math.max(18, tools.length * 3.2);

  if (reduced) {
    return (
      <div className="no-scrollbar mt-6 overflow-x-auto py-2">
        <Row tools={tools} />
      </div>
    );
  }

  return (
    <div
      className="mt-6 overflow-hidden py-3 [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div
        className="flex w-max"
        style={{ animation: `tech-marquee ${duration}s linear infinite`, animationPlayState: paused ? "paused" : "running" }}
      >
        <Row tools={tools} />
        <Row tools={tools} hidden />
      </div>
      <style>{`@keyframes tech-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
