"use client";

import { cn } from "@/lib/cn";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";

function FlowConnector({ live }: { live: boolean }) {
  return (
    <span className="relative flex h-[2px] w-5 shrink-0 items-center overflow-visible sm:w-7" aria-hidden>
      <span
        className="h-full w-full rounded-full transition-colors duration-500"
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, ${
            live ? "var(--story-cyan)" : "var(--border-soft)"
          } 0, ${live ? "var(--story-cyan)" : "var(--border-soft)"} 4px, transparent 4px, transparent 8px)`,
        }}
      />
      {live && (
        <span
          className="animate-flow-dot absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-story-cyan"
          style={{ boxShadow: "0 0 8px 2px rgba(34,211,238,0.7)" }}
        />
      )}
    </span>
  );
}

function FlowCap({ live }: { live: boolean }) {
  return (
    <span
      className="h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-500"
      style={{
        background: live ? "var(--story-cyan)" : "var(--border-soft)",
        boxShadow: live ? "0 0 8px 2px rgba(34,211,238,0.55)" : undefined,
      }}
      aria-hidden
    />
  );
}

/** The vertical dashed drop between a main chain and a branch row below it. */
function BranchDrop({ live }: { live: boolean }) {
  return (
    <div className="flex justify-center py-1.5" aria-hidden>
      <span
        className="relative h-5 w-px"
        style={{
          backgroundImage: `repeating-linear-gradient(180deg, ${
            live ? "var(--story-cyan)" : "var(--border-soft)"
          } 0, ${live ? "var(--story-cyan)" : "var(--border-soft)"} 4px, transparent 4px, transparent 8px)`,
        }}
      >
        {live && (
          <span
            className="animate-flow-dot absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-story-cyan"
            style={{ boxShadow: "0 0 8px 2px rgba(34,211,238,0.7)", top: "-2px" }}
          />
        )}
      </span>
    </div>
  );
}

function Pill({ label, isLive }: { label: string; isLive: boolean }) {
  return (
    <span
      className={cn(
        "card-shine relative isolate overflow-hidden whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-semibold transition-all duration-300 sm:text-sm",
        "hover:-translate-y-1 hover:scale-[1.05]",
        isLive ? "text-white" : "border border-border-soft bg-surface text-muted"
      )}
      style={
        isLive
          ? {
              background: "linear-gradient(150deg, var(--story-navy), var(--story-royal) 55%, var(--story-electric))",
              boxShadow: "0 1px 0 rgba(255,255,255,0.25) inset, 0 10px 26px -6px rgba(31,86,214,0.55)",
            }
          : undefined
      }
    >
      {isLive && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full bg-gradient-to-b from-white/35 to-transparent"
        />
      )}
      <span className="relative">{label}</span>
    </span>
  );
}

function PillRow({ steps, offset, activeIndex }: { steps: string[]; offset: number; activeIndex?: number }) {
  return (
    <RevealGroup
      className="no-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto px-1 py-2 sm:flex-wrap sm:justify-center"
      stagger={0.06}
    >
      <FlowCap live={activeIndex === undefined || offset <= activeIndex} />
      {steps.map((step, i) => {
        const isLive = activeIndex === undefined || offset + i <= activeIndex;
        return (
          <RevealItem key={step} className="flex shrink-0 items-center gap-1.5">
            <Pill label={step} isLive={isLive} />
            {i < steps.length - 1 && <FlowConnector live={isLive} />}
          </RevealItem>
        );
      })}
      <FlowCap live={activeIndex === undefined || offset + steps.length - 1 <= activeIndex} />
    </RevealGroup>
  );
}

/**
 * A horizontal labeled-step flow (scrolls on narrow screens, wraps on wide
 * ones). An optional `branch` renders a second row underneath, connected by
 * a dashed vertical drop, for flows that fork off the main chain (e.g. an
 * agent handing off to a validation step) instead of just continuing it.
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
  return (
    <div className={cn("flex flex-col", className)}>
      <PillRow steps={steps} offset={0} activeIndex={activeIndex} />
      {branch && branch.length > 0 && (
        <>
          <BranchDrop live={activeIndex === undefined || steps.length <= activeIndex} />
          <PillRow steps={branch} offset={steps.length} activeIndex={activeIndex} />
        </>
      )}
    </div>
  );
}
