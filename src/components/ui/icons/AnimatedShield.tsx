"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Shield — breathes with a glowing pulse ring and a check that draws itself. */
export function AnimatedShield({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "sh" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="100%" stopColor="#16a34a" />
          </linearGradient>
          <filter id={`${id}glow`}>
            <feGaussianBlur stdDeviation="0.7" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Pulse ring */}
        <motion.path
          d="M12 2.4 4.6 5.2a1 1 0 0 0-.65.95c.1 6.35 2.65 11.4 7.6 13.9a1 1 0 0 0 .9 0c4.95-2.5 7.5-7.55 7.6-13.9a1 1 0 0 0-.65-.95Z"
          fill="none"
          stroke="#4ade80"
          strokeWidth="1"
          style={{ transformOrigin: "12px 12px" }}
          animate={{ scale: [1, 1.22, 1.35], opacity: [0.5, 0.2, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
        />

        {/* Shield body — breathes */}
        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M12 2.4 4.6 5.2a1 1 0 0 0-.65.95c.1 6.35 2.65 11.4 7.6 13.9a1 1 0 0 0 .9 0c4.95-2.5 7.5-7.55 7.6-13.9a1 1 0 0 0-.65-.95Z"
            fill={`url(#${id}g)`}
            filter={`url(#${id}glow)`}
          />
          {/* Check draws itself */}
          <motion.path
            d="m8.4 11.8 2.5 2.5 4.7-4.9"
            stroke="#f0fdf4"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 1, 0] }}
            transition={{ duration: 2.4, times: [0, 0.35, 0.85, 1], repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
      </svg>
    </span>
  );
}
