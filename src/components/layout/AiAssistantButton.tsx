"use client";

import { AnimatedAgent } from "@/components/ui/icons/AnimatedAgent";
import { OPEN_AGENT_EVENT } from "./AiAgentWidget";

/** Header trigger for the AI agent — opens the floating chat anchored at the bottom-right corner. */
export function AiAssistantButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event(OPEN_AGENT_EVENT))}
      aria-label="Open AI agent chat"
      className="group flex h-10 w-10 cursor-pointer items-center justify-center bg-transparent transition-transform duration-300 active:scale-95"
    >
      <AnimatedAgent className="h-7 w-7 transition-transform duration-300 group-hover:scale-110" />
    </button>
  );
}
