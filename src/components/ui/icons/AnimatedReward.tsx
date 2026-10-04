"use client";

import { Lottie } from "lottie-react";
import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const REWARD_ANIMATION_URL =
  "https://lottie.host/7c727c44-ff27-4d36-9926-51f802ed126e/TUOUrQgvd9.json";

export function AnimatedReward({ className, style }: { className?: string; style?: CSSProperties }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={style}
      aria-hidden="true"
    >
      <Lottie
        src={REWARD_ANIMATION_URL}
        autoplay={!prefersReducedMotion}
        loop={!prefersReducedMotion}
        className="h-full w-full scale-200"
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
      />
    </span>
  );
}
