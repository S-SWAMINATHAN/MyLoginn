"use client";

import { Lottie } from "lottie-react";
import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const DURATION_ANIMATION_URL =
  "https://lottie.host/4cb6482a-2801-42f8-8aeb-739fd70505da/L1Am1ufbTO.json";

export function AnimatedClock({ className, style }: { className?: string; style?: CSSProperties }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={style}
      aria-hidden="true"
    >
      <Lottie
        src={DURATION_ANIMATION_URL}
        autoplay={!prefersReducedMotion}
        loop={!prefersReducedMotion}
        className="h-full w-full"
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
      />
    </span>
  );
}
