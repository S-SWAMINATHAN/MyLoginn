"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Glowing AI brain — pulsing gradient core, firing neural nodes, orbiting spark. */
export function AnimatedAi({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "ai" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <filter id={`${id}glow`}>
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Brain body: two filled lobes */}
          <path
            d="M11.2 3.2c-1.9 0-3.3 1.2-3.7 2.7-1.7.3-3 1.7-3 3.5 0 .9.3 1.7.9 2.3-.6.6-.9 1.4-.9 2.3 0 1.8 1.3 3.2 3 3.5.4 1.5 1.8 2.7 3.7 2.7.3 0 .6-.3.6-.6V3.8c0-.3-.3-.6-.6-.6Z"
            fill={`url(#${id}g)`}
            filter={`url(#${id}glow)`}
          />
          <path
            d="M12.8 3.2c1.9 0 3.3 1.2 3.7 2.7 1.7.3 3 1.7 3 3.5 0 .9-.3 1.7-.9 2.3.6.6.9 1.4.9 2.3 0 1.8-1.3 3.2-3 3.5-.4 1.5-1.8 2.7-3.7 2.7-.3 0-.6-.3-.6-.6V3.8c0-.3.3-.6.6-.6Z"
            fill={`url(#${id}g)`}
            filter={`url(#${id}glow)`}
            opacity="0.85"
          />
        </motion.g>

        {/* Firing neural nodes */}
        {[
          { cx: 8.4, cy: 8, d: 0 },
          { cx: 8, cy: 13.6, d: 0.55 },
          { cx: 15.6, cy: 9.4, d: 1.1 },
          { cx: 15.9, cy: 14.4, d: 1.65 },
        ].map((n, i) => (
          <motion.circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r="1.1"
            fill="#f5f3ff"
            animate={{ opacity: [0.15, 1, 0.15], scale: [0.7, 1.25, 0.7] }}
            style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: n.d }}
          />
        ))}

        {/* Orbiting spark */}
        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <motion.path
            d="M12 -0.6 12.7 1.2 14.5 1.9 12.7 2.6 12 4.4 11.3 2.6 9.5 1.9 11.3 1.2Z"
            fill="#22d3ee"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
      </svg>
    </span>
  );
}
