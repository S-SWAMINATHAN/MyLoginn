"use client";

import { Lottie } from "lottie-react";
import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const AGENT_ANIMATION_URL = "/animations/ai-agent.json?v=2";

export function AnimatedAgent({ className, style }: { className?: string; style?: CSSProperties }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center bg-transparent", className)}
      style={style}
      aria-hidden="true"
    >
      <Lottie
        src={AGENT_ANIMATION_URL}
        autoplay={!prefersReducedMotion}
        loop={!prefersReducedMotion}
        className="h-full w-full scale-[1.7] bg-transparent"
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
      />
    </span>
  );
}




