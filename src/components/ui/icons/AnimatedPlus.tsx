"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedPlus({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "pl" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e5e3ff" />
          </linearGradient>
        </defs>
        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ rotate: [0, 90, 90, 0], scale: [1, 1.12, 1.12, 1] }}
          transition={{ duration: 3.2, times: [0, 0.25, 0.75, 1], repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="10.6" y="4.4" width="2.8" height="15.2" rx="1.4" fill={`url(#${id}g)`} />
          <rect x="4.4" y="10.6" width="15.2" height="2.8" rx="1.4" fill={`url(#${id}g)`} />
        </motion.g>
      </svg>
    </span>
  );
}
