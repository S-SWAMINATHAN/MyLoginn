"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Trending-up glyph — gradient bars grow in a loop while an arrow glides upward. */
export function AnimatedTrending({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "tr" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
          <linearGradient id={`${id}a`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#a7f3d0" />
          </linearGradient>
        </defs>

        {/* Rising bars */}
        {[
          { x: 3, h: 6, d: 0 },
          { x: 8.4, h: 10, d: 0.18 },
          { x: 13.8, h: 14, d: 0.36 },
        ].map((b, i) => (
          <motion.rect
            key={i}
            x={b.x}
            y={21 - b.h}
            width="3.6"
            height={b.h}
            rx="1.4"
            fill={`url(#${id}g)`}
            style={{ transformOrigin: `${b.x + 1.8}px 21px` }}
            animate={{ scaleY: [0.55, 1, 1, 0.55], opacity: [0.6, 1, 1, 0.6] }}
            transition={{ duration: 2.6, times: [0, 0.35, 0.75, 1], repeat: Infinity, ease: "easeInOut", delay: b.d }}
          />
        ))}

        {/* Gliding arrow */}
        <motion.path
          d="M15.2 8.6 19.9 3.9M19.9 3.9h-3.6M19.9 3.9v3.6"
          stroke={`url(#${id}a)`}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ x: [-1.2, 0.8, -1.2], y: [1.2, -0.8, 1.2], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Spark at arrow tip */}
        <motion.circle
          cx="20.6"
          cy="3.2"
          r="1"
          fill="#a7f3d0"
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4] }}
          style={{ transformOrigin: "20.6px 3.2px" }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </svg>
    </span>
  );
}
