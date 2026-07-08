"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedClose({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "cl" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a89dff" />
            <stop offset="100%" stopColor="#5934f0" />
          </linearGradient>
        </defs>
        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ rotate: [0, 90, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="10.7" y="3.8" width="2.6" height="16.4" rx="1.3" transform="rotate(45 12 12)" fill={`url(#${id}g)`} />
          <rect x="10.7" y="3.8" width="2.6" height="16.4" rx="1.3" transform="rotate(-45 12 12)" fill={`url(#${id}g)`} />
        </motion.g>
      </svg>
    </span>
  );
}
