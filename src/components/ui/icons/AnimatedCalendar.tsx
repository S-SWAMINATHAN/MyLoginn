"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Calendar — rings wiggle, date cells light up in sequence, today pulses. */
export function AnimatedCalendar({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "cl" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const cells = [
    { x: 6.2, y: 12.2 },
    { x: 10.6, y: 12.2 },
    { x: 15, y: 12.2 },
    { x: 6.2, y: 16.2 },
  ];
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5b4fc" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id={`${id}top`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        {/* Body */}
        <rect x="2.8" y="4.6" width="18.4" height="16.6" rx="2.8" fill={`url(#${id}g)`} />
        {/* Header band */}
        <path d="M2.8 9.4h18.4V7.4a2.8 2.8 0 0 0-2.8-2.8H5.6a2.8 2.8 0 0 0-2.8 2.8Z" fill={`url(#${id}top)`} />

        {/* Binder rings — wiggle */}
        {[7.4, 16.6].map((x, i) => (
          <motion.rect
            key={i}
            x={x - 0.85}
            y="1.6"
            width="1.7"
            height="4.6"
            rx="0.85"
            fill="#c7d2fe"
            style={{ transformOrigin: `${x}px 4.4px` }}
            animate={{ rotate: [0, -7, 0, 7, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        ))}

        {/* Date cells lighting up */}
        {cells.map((c, i) => (
          <motion.rect
            key={i}
            x={c.x}
            y={c.y}
            width="2.8"
            height="2.8"
            rx="0.8"
            fill="#e0e7ff"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}

        {/* Today — pulsing highlight */}
        <motion.rect
          x="14.6"
          y="15.8"
          width="3.6"
          height="3.6"
          rx="1"
          fill="#22d3ee"
          style={{ transformOrigin: "16.4px 17.6px" }}
          animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
