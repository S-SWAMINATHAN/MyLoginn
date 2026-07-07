"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export function AnimatedFlame({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "fl" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <motion.span
        className="inline-flex h-full w-full"
        style={{ transformOrigin: "50% 100%" }}
        animate={{ scaleY: [1, 1.1, 0.95, 1.07, 1], scaleX: [1, 0.95, 1.05, 0.97, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <defs>
            <linearGradient id={`${id}outer`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#b91c1c" />
              <stop offset="55%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fde68a" />
            </linearGradient>
            <linearGradient id={`${id}inner`} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
            <filter id={`${id}glow`}>
              <feGaussianBlur stdDeviation="1.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter={`url(#${id}glow)`}>
            <path
              d="M32 6c3 8-6 12-6 21 0 4 2 7 5 9-4-1-9-6-9-14 0-3 1-6 2-8-5 5-9 13-9 21 0 12 8 21 17 21s17-9 17-21c0-11-9-19-17-29Z"
              fill={`url(#${id}outer)`}
            >
              <animate attributeName="opacity" values=".92;1;.92" dur="1.1s" repeatCount="indefinite" />
            </path>
            <path
              d="M32 26c1.5 4-3 6-3 11 0 5 3 9 7 10-6 0-12-5-12-13 0-6 4-9 8-8Z"
              fill={`url(#${id}inner)`}
              opacity=".85"
            >
              <animate attributeName="opacity" values=".6;1;.6" dur=".9s" begin=".15s" repeatCount="indefinite" />
            </path>
          </g>
        </svg>
      </motion.span>
    </span>
  );
}
