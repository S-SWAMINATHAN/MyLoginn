"use client";

import { Lottie } from "lottie-react";
import { useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const STREAK_ANIMATION_URL =
  "https://lottie.host/d4d70575-6032-445d-995f-4e7bd283782e/sC4CqMGQGl.json";

export function AnimatedFlame({ className, style }: { className?: string; style?: CSSProperties }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={style}
      aria-hidden="true"
    >
      <Lottie
        src={STREAK_ANIMATION_URL}
        autoplay={!prefersReducedMotion}
        loop={!prefersReducedMotion}
        className="h-full w-full"
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
      />
    </span>
  );
}
