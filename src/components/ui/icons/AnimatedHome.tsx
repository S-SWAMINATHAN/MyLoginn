"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** House — bobs gently, window glows warm, chimney puffs a drifting smoke ring. */
export function AnimatedHome({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "hm" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <linearGradient id={`${id}roof`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 20px" }}
          animate={{ y: [0, -0.8, 0], scaleY: [1, 1.015, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Chimney */}
          <rect x="16.2" y="4.6" width="2.4" height="4.4" rx="0.7" fill={`url(#${id}roof)`} />
          {/* Body */}
          <path
            d="M5 11.2h14v7.6a2.2 2.2 0 0 1-2.2 2.2H7.2A2.2 2.2 0 0 1 5 18.8Z"
            fill={`url(#${id}g)`}
          />
          {/* Roof */}
          <path
            d="M11 3.6a1.6 1.6 0 0 1 2 0l7.3 5.9c.9.72.38 2.16-.77 2.16H4.47c-1.15 0-1.66-1.44-.77-2.16Z"
            fill={`url(#${id}roof)`}
          />
          {/* Door */}
          <path d="M10.4 21v-4.6c0-.9.7-1.6 1.6-1.6s1.6.7 1.6 1.6V21Z" fill="#ede9fe" />
          {/* Window — glows */}
          <motion.rect
            x="10.6"
            y="6.2"
            width="2.8"
            height="2.8"
            rx="1.4"
            fill="#fde68a"
            style={{ transformOrigin: "12px 7.6px" }}
            animate={{ opacity: [0.55, 1, 0.55], scale: [1, 1.18, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />
        </motion.g>

        {/* Smoke puff drifting up from the chimney */}
        <motion.circle
          cx="17.4"
          cy="3.6"
          r="1.1"
          fill="#ddd6fe"
          animate={{ y: [0.5, -2.6], opacity: [0, 0.9, 0], scale: [0.5, 1.2] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
        />
      </svg>
    </span>
  );
}
