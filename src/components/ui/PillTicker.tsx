"use client";

import { useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

function Row({ items, hidden }: { items: string[]; hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-2.5 pr-2.5">
      {items.map((t) => (
        <li key={t} className="flex shrink-0 items-center gap-2 rounded-full border border-border-soft bg-surface py-1.5 pl-1.5 pr-4 text-xs font-semibold shadow-sm">
          <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-story-royal text-[10px] font-bold text-white">✓</span>
          <span className="whitespace-nowrap">{t}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A single line of tick pills that glides by on its own and pauses on hover or touch. It never wraps, so it stays
 * one tidy line on phones; with reduced motion it becomes a plain horizontally scrollable row.
 */
export function PillTicker({ items, className }: { items: string[]; className?: string }) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const duration = Math.max(16, items.length * 4);

  if (reduced) {
    return (
      <div className={`no-scrollbar overflow-x-auto py-1 ${className ?? ""}`}>
        <Row items={items} />
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden py-1 [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] ${className ?? ""}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="flex w-max" style={{ animation: `pill-ticker ${duration}s linear infinite`, animationPlayState: paused ? "paused" : "running" }}>
        <Row items={items} />
        <Row items={items} hidden />
      </div>
      <style>{`@keyframes pill-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
