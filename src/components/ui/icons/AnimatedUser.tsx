"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/**
 * Lifelike single-person glyph — gentle breathing, occasional blink,
 * subtle head tilt and a pulsing presence dot.
 */
export function AnimatedUser({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "ur" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}skin`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={`${id}body`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>

        {/* Shoulders/body — breathes */}
        <motion.path
          d="M4.2 20.4c.4-4.6 3.4-7.5 7.8-7.5s7.4 2.9 7.8 7.5a.7.7 0 0 1-.7.8H4.9a.7.7 0 0 1-.7-.8Z"
          fill={`url(#${id}body)`}
          style={{ transformOrigin: "12px 21px" }}
          animate={{ scaleY: [1, 1.045, 1], scaleX: [1, 1.02, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Head — subtle tilt */}
        <motion.g
          style={{ transformOrigin: "12px 9.5px" }}
          animate={{ rotate: [0, 2.5, 0, -2.5, 0], y: [0, -0.3, 0] }}
          transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="12" cy="7.4" r="4.1" fill={`url(#${id}skin)`} />
          {/* Eyes — blink */}
          <motion.g
            style={{ transformOrigin: "12px 7.2px" }}
            animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
            transition={{ duration: 3.8, times: [0, 0.44, 0.5, 0.56, 1], repeat: Infinity, ease: "easeInOut" }}
          >
            <circle cx="10.5" cy="7.2" r="0.62" fill="#eef2ff" />
            <circle cx="13.5" cy="7.2" r="0.62" fill="#eef2ff" />
          </motion.g>
          {/* Smile */}
          <path d="M10.6 9.3c.45.5.185.75 1.4.75s.95-.25 1.4-.75" stroke="#eef2ff" strokeWidth="0.7" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* Presence dot */}
        <motion.circle
          cx="18.4"
          cy="17.6"
          r="1.8"
          fill="#4ade80"
          stroke="white"
          strokeWidth="1"
          style={{ transformOrigin: "18.4px 17.6px" }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
