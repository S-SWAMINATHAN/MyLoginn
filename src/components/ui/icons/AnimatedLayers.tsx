"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Stacked layers — the three sheets float apart and settle back in a loop. */
export function AnimatedLayers({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "ly" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}a`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e7490" />
          </linearGradient>
          <linearGradient id={`${id}c`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Bottom layer */}
        <motion.path
          d="M12 14.6 3.2 10.9a.55.55 0 0 1 0-1l8.36-3.55a1.1 1.1 0 0 1 .88 0L20.8 9.9a.55.55 0 0 1 0 1Z"
          fill={`url(#${id}a)`}
          transform="translate(0 7)"
          animate={{ y: [0, 1.1, 0], opacity: [0.75, 0.9, 0.75] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Middle layer */}
        <motion.path
          d="M12 14.6 3.2 10.9a.55.55 0 0 1 0-1l8.36-3.55a1.1 1.1 0 0 1 .88 0L20.8 9.9a.55.55 0 0 1 0 1Z"
          fill={`url(#${id}b)`}
          transform="translate(0 3.5)"
          animate={{ y: [0, 0.3, 0], opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
        />
        {/* Top layer — lifts */}
        <motion.path
          d="M12 14.6 3.2 10.9a.55.55 0 0 1 0-1l8.36-3.55a1.1 1.1 0 0 1 .88 0L20.8 9.9a.55.55 0 0 1 0 1Z"
          fill={`url(#${id}c)`}
          animate={{ y: [0, -1.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Glint riding the top layer */}
        <motion.circle
          cx="12"
          cy="7.4"
          r="0.9"
          fill="#ecfeff"
          animate={{ opacity: [0, 1, 0], y: [0, -1.6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      </svg>
    </span>
  );
}
