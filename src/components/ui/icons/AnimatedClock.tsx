"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Filled gradient clock — hands sweep continuously while a tick blips at 12. */
export function AnimatedClock({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "ck" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="12" cy="12" r="9.4" fill={`url(#${id}g)`} />
          <circle cx="12" cy="12" r="7.4" fill="#0c4a6e" opacity="0.28" />

          {/* Hour markers */}
          {[0, 90, 180, 270].map((r) => (
            <rect key={r} x="11.6" y="5.4" width="0.8" height="1.7" rx="0.4" fill="#e0f2fe" transform={`rotate(${r} 12 12)`} />
          ))}

          {/* Minute hand — full sweep */}
          <motion.rect
            x="11.35"
            y="6.4"
            width="1.3"
            height="6"
            rx="0.65"
            fill="#f0f9ff"
            style={{ transformOrigin: "12px 12px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          {/* Hour hand — slow sweep */}
          <motion.rect
            x="11.35"
            y="8.4"
            width="1.3"
            height="4"
            rx="0.65"
            fill="#bae6fd"
            style={{ transformOrigin: "12px 12px" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
          />
          <circle cx="12" cy="12" r="1.1" fill="#f0f9ff" />
        </motion.g>

        {/* Tick blip at 12 */}
        <motion.circle
          cx="12"
          cy="2.6"
          r="0.9"
          fill="#38bdf8"
          style={{ transformOrigin: "12px 2.6px" }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
