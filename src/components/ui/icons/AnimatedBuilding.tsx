"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Office building — windows light up one by one, antenna beacon blinks. */
export function AnimatedBuilding({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "bd" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const windows = [
    [7.4, 6.4],
    [11.2, 6.4],
    [15, 6.4],
    [7.4, 10.4],
    [11.2, 10.4],
    [15, 10.4],
    [7.4, 14.4],
    [11.2, 14.4],
    [15, 14.4],
  ];

  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <filter id={`${id}glow`}>
            <feGaussianBlur stdDeviation="0.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="4.6" y="19.4" width="14.8" height="1.3" rx="0.6" fill="#1e3a8a" opacity="0.25" />

        <rect x="1.8" y="10.6" width="1.6" height="4" rx="0.7" fill="#1e40af" />
        <line x1="2.6" y1="4.6" x2="2.6" y2="10.6" stroke="#1e40af" strokeWidth="1.4" strokeLinecap="round" />
        <motion.circle
          cx="2.6"
          cy="4"
          r="1"
          fill="#22d3ee"
          filter={`url(#${id}glow)`}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />

        <rect x="4.6" y="4.6" width="14.8" height="14.8" rx="1.4" fill={`url(#${id}g)`} filter={`url(#${id}glow)`} />

        {windows.map(([x, y], i) => (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width="1.8"
            height="1.8"
            rx="0.35"
            fill="#fde68a"
            style={{ transformOrigin: `${x + 0.9}px ${y + 0.9}px` }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: (i % 5) * 0.3 }}
          />
        ))}
      </svg>
    </span>
  );
}
