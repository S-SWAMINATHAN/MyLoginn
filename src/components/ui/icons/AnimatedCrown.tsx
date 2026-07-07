"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Featured crown — shimmers, tips glow in sequence, jewel pulses. */
export function AnimatedCrown({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "cr" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <filter id={`${id}glow`}>
            <feGaussianBlur stdDeviation="0.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 14px" }}
          animate={{ y: [0, -0.8, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M3.2 8.2a.75.75 0 0 1 1.15-.7l3.4 2.3a1 1 0 0 0 1.45-.35l2.1-4.1a.78.78 0 0 1 1.4 0l2.1 4.1a1 1 0 0 0 1.45.35l3.4-2.3a.75.75 0 0 1 1.15.7l-1.15 8.3a1.6 1.6 0 0 1-1.6 1.4H5.95a1.6 1.6 0 0 1-1.6-1.4Z"
            fill={`url(#${id}g)`}
            filter={`url(#${id}glow)`}
          />
          {/* Jewel */}
          <motion.circle
            cx="12"
            cy="13.4"
            r="1.5"
            fill="#fff7ed"
            style={{ transformOrigin: "12px 13.4px" }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* Tip glints firing in sequence */}
        {[
          { x: 3.6, y: 6.4, d: 0 },
          { x: 12, y: 3.4, d: 0.4 },
          { x: 20.4, y: 6.4, d: 0.8 },
        ].map((t, i) => (
          <motion.circle
            key={i}
            cx={t.x}
            cy={t.y}
            r="1"
            fill="#fef3c7"
            style={{ transformOrigin: `${t.x}px ${t.y}px` }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: t.d }}
          />
        ))}
      </svg>
    </span>
  );
}
