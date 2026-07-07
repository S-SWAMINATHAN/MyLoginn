"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Code brackets — angle brackets pulse apart while the slash types itself and a cursor blinks. */
export function AnimatedCode({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "cd" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#99f6e4" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>

        {/* Left bracket */}
        <motion.path
          d="M8.6 6.4 3.9 11a1.4 1.4 0 0 0 0 2l4.7 4.6a1.55 1.55 0 0 0 2.2-2.2L7.4 12l3.4-3.4a1.55 1.55 0 1 0-2.2-2.2Z"
          fill={`url(#${id}g)`}
          animate={{ x: [0, -1.1, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Right bracket */}
        <motion.path
          d="M15.4 6.4 20.1 11a1.4 1.4 0 0 1 0 2l-4.7 4.6a1.55 1.55 0 0 1-2.2-2.2l3.4-3.4-3.4-3.4a1.55 1.55 0 1 1 2.2-2.2Z"
          fill={`url(#${id}g)`}
          animate={{ x: [0, 1.1, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Slash — draws itself */}
        <motion.path
          d="M13.7 4.2 10.3 19.8"
          stroke={`url(#${id}s)`}
          strokeWidth="2.4"
          strokeLinecap="round"
          animate={{ pathLength: [0.2, 1, 0.2], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Blinking cursor sparkle */}
        <motion.rect
          x="20.6"
          y="2.4"
          width="1.6"
          height="3.4"
          rx="0.8"
          fill="#5eead4"
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.6, 1] }}
        />
      </svg>
    </span>
  );
}
