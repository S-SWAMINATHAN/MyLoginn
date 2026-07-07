"use client";

import { AnimatedAgent } from "@/components/ui/icons/AnimatedAgent";
import { AnimatedSparkle } from "@/components/ui/icons/AnimatedSparkle";
import { OPEN_AGENT_EVENT } from "./AiAgentWidget";

/** Header trigger for the AI agent — opens the floating chat anchored at the bottom-right corner. */
export function AiAssistantButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(OPEN_AGENT_EVENT))}
      aria-label="Open AI agent chat"
      className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-border-soft bg-surface-2/60 cursor-pointer transition-all duration-300 hover:border-brand-400 hover:shadow-[0_4px_16px_rgba(108,77,255,0.25)] active:scale-95"
    >
      <span className="pointer-events-none absolute inset-0 rounded-full brand-gradient-bg opacity-25 blur-md animate-pulse" />
      <span className="pointer-events-none absolute -right-1 -top-1">
        <AnimatedSparkle className="h-3.5 w-3.5" />
      </span>
      <AnimatedAgent className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
    </button>
  );
}
