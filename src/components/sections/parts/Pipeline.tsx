"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

const STEP_SECONDS = 0.6;

/** The dashed rail that runs from a step's number to the edge of its card, so adjacent cards read as one track. */
function Rail({ live, delay }: { live: boolean; delay: string }) {
  const color = live ? "var(--story-cyan)" : "var(--border-soft)";
  return (
    <span className="relative ml-3 h-[2px] flex-1 overflow-visible" aria-hidden>
      <span
        className="block h-full w-full rounded-full transition-colors duration-500"
        style={{ backgroundImage: `repeating-linear-gradient(90deg, ${color} 0, ${color} 5px, transparent 5px, transparent 10px)` }}
      />
      {live && (
        <span
          className="animate-flow-dot absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-story-cyan"
          style={{ boxShadow: "0 0 10px 3px rgba(34,211,238,0.7)", animationDelay: delay }}
        />
      )}
    </span>
  );
}

function StepCard({ label, index, live, total, delay }: { label: string; index: number; live: boolean; total: number; delay: string }) {
  const rest = live ? "0 12px 28px -14px rgba(31,86,214,0.45)" : "0 0 0 0 transparent";
  return (
    <div
      className={cn(
        "pipe-card group relative isolate flex h-full min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-2xl border p-4 text-left backdrop-blur transition-colors duration-300",
        live ? "border-story-royal/25 bg-surface/80" : "border-border-soft bg-surface/50 opacity-70"
      )}
      style={{ "--pipe-rest": rest, "--pipe-total": `${total * STEP_SECONDS}s`, "--pipe-delay": delay } as CSSProperties}
    >
      {live && (
        <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-story-royal/10 via-transparent to-story-cyan/15" />
      )}
      {live && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent pipe-sheen" style={{ "--pipe-delay": delay } as CSSProperties} />
      )}
      <div className="flex items-center">
        <span
          className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold tabular-nums", live ? "text-white" : "bg-surface-2 text-muted")}
          style={live ? { background: "linear-gradient(150deg, var(--story-navy), var(--story-royal) 55%, var(--story-electric))", boxShadow: "0 8px 18px -6px rgba(31,86,214,0.7)" } : undefined}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <Rail live={live} delay={delay} />
      </div>
      <p className={cn("text-sm font-semibold leading-tight sm:text-base", live ? "text-story-navy dark:text-foreground" : "text-muted")}>{label}</p>
    </div>
  );
}

function StepGrid({ steps, offset, total, activeIndex }: { steps: string[]; offset: number; total: number; activeIndex?: number }) {
  return (
    <RevealGroup className="grid w-full gap-3 [grid-template-columns:repeat(auto-fit,minmax(9rem,1fr))]" stagger={0.06}>
      {steps.map((step, i) => (
        <RevealItem key={step} className="min-w-0">
          <StepCard
            label={step}
            index={offset + i}
            total={total}
            live={activeIndex === undefined || offset + i <= activeIndex}
            delay={`${(offset + i) * STEP_SECONDS}s`}
          />
        </RevealItem>
      ))}
    </RevealGroup>
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
 * A full-width labeled-step flow: numbered cards stretch to fill the row, a
 * glowing dot runs along each rail, and a spotlight walks through the steps in
 * order. An optional `branch` renders a second row underneath, connected by a
 * dashed vertical drop, for flows that fork off the main chain.
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
  const total = steps.length + (branch?.length ?? 0);
  return (
    <div className={cn("flex w-full flex-col", className)}>
      <StepGrid steps={steps} offset={0} total={total} activeIndex={activeIndex} />
      {branch && branch.length > 0 && (
        <>
          <BranchDrop live={activeIndex === undefined || steps.length <= activeIndex} />
          <StepGrid steps={branch} offset={steps.length} total={total} activeIndex={activeIndex} />
        </>
      )}
    </div>
  );
}
