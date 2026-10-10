"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotion } from "@/lib/useReducedMotion";

const SECONDS_PER_STEP = 2.6;

function Node({ label, index, live, delay }: { label: string; index: number; live: boolean; delay: string }) {
  const color = live ? "var(--story-cyan)" : "var(--border-soft)";
  return (
    <div className="relative flex min-w-[5.5rem] flex-1 basis-0 flex-col items-center gap-2.5 px-1 text-center">
      {/* The coupling to the next carriage; the last one reaches into the next copy so the line never breaks. */}
      <span aria-hidden className="absolute left-1/2 top-5 z-0 h-[3px] w-full -translate-y-1/2">
        <span className="block h-full w-full rounded-full" style={{ background: color, opacity: live ? 0.55 : 1 }} />
        {live && <span className="animate-flow-dot absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-story-cyan" style={{ boxShadow: "0 0 10px 3px rgba(34,211,238,0.7)", animationDelay: delay }} />}
      </span>
      <span
        className={cn(
          "relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold tabular-nums",
          live ? "border-story-royal bg-story-royal text-white shadow-[0_8px_18px_-8px_rgba(31,86,214,0.8)]" : "border-border-soft bg-surface text-muted"
        )}
      >
        {index + 1}
      </span>
      <span className={cn("text-xs font-semibold leading-tight sm:text-sm", live ? "text-story-navy dark:text-foreground" : "text-muted")}>{label}</span>
    </div>
  );
}

function Carriages({ steps, offset, liveLimit, hidden }: { steps: string[]; offset: number; liveLimit: number; hidden?: boolean }) {
  return (
    <div aria-hidden={hidden || undefined} className="flex min-w-[100cqw] shrink-0 items-start">
      {steps.map((step, i) => <Node key={step} label={step} index={offset + i} live={offset + i <= liveLimit} delay={`${(offset + i) * 0.35}s`} />)}
    </div>
  );
}

/** One line of steps that glides sideways on its own, like a train passing through: two copies loop seamlessly. */
function Train({ steps, offset, liveLimit, animate }: { steps: string[]; offset: number; liveLimit: number; animate: boolean }) {
  const duration = `${Math.max(12, steps.length * SECONDS_PER_STEP)}s`;
  return (
    <div
      role="list"
      aria-label="Process steps"
      className="no-scrollbar w-full min-w-0 max-w-full overflow-x-auto py-2 [container-type:inline-size] [mask-image:linear-gradient(90deg,transparent,#000_2rem,#000_calc(100%-2rem),transparent)]"
    >
      <div
        className={cn("flex w-max", animate && "pipe-train hover:[animation-play-state:paused]")}
        style={{ "--pipe-duration": duration } as CSSProperties}
      >
        <Carriages steps={steps} offset={offset} liveLimit={liveLimit} />
        {animate && <Carriages steps={steps} offset={offset} liveLimit={liveLimit} hidden />}
      </div>
    </div>
  );
}

/** The vertical dashed drop between a main chain and a branch row below it. */
function BranchDrop({ live }: { live: boolean }) {
  const color = live ? "var(--story-cyan)" : "var(--border-soft)";
  return (
    <div className="flex justify-center py-2" aria-hidden>
      <span
        className="relative h-6 w-px"
        style={{ backgroundImage: `repeating-linear-gradient(180deg, ${color} 0, ${color} 5px, transparent 5px, transparent 10px)` }}
      >
        {live && (
          <span
            className="animate-flow-dot absolute left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-story-cyan"
            style={{ boxShadow: "0 0 10px 3px rgba(34,211,238,0.7)", top: "-2px" }}
          />
        )}
      </span>
    </div>
  );
}

/**
 * A single-line labeled-step flow that moves on its own like a train: numbered
 * carriages joined by a glowing line glide past in an endless loop, pausing while
 * hovered. With reduced motion the line is static and scrolls by hand instead.
 * An optional `branch` renders a second moving row underneath for flows that fork.
 */
export function Pipeline({
  steps,
  activeIndex,
  branch,
  className,
}: {
  steps: string[];
  activeIndex?: number;
  branch?: string[];
  className?: string;
}) {
  const animate = !useReducedMotion();
  const total = steps.length + (branch?.length ?? 0);
  const liveLimit = activeIndex ?? total - 1;
  return (
    <div className={cn("flex w-full min-w-0 max-w-full flex-col", className)}>
      <Train steps={steps} offset={0} liveLimit={liveLimit} animate={animate} />
      {branch && branch.length > 0 && (
        <>
          <BranchDrop live={liveLimit >= steps.length} />
          <Train steps={branch} offset={steps.length} liveLimit={liveLimit} animate={animate} />
        </>
      )}
    </div>
  );
}
