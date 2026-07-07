"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Magnifier — scans side to side with a sweeping glint inside the lens. */
export function AnimatedSearch({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "se" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <radialGradient id={`${id}lens`} cx="0.35" cy="0.35" r="0.9">
            <stop offset="0%" stopColor="#ede9fe" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.5" />
          </radialGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "11px 11px" }}
          animate={{ x: [0, 1.6, -1.2, 0], y: [0, -1.2, 1.4, 0], rotate: [0, 4, -3, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Lens */}
          <circle cx="10.5" cy="10.5" r="6.6" fill={`url(#${id}lens)`} />
          {/* Rim (filled ring) */}
          <path
            d="M10.5 2.4a8.1 8.1 0 1 0 0 16.2 8.1 8.1 0 0 0 0-16.2Zm0 2.2a5.9 5.9 0 1 1 0 11.8 5.9 5.9 0 0 1 0-11.8Z"
            fill={`url(#${id}g)`}
          />
          {/* Handle */}
          <rect x="15.9" y="14.6" width="6.4" height="2.9" rx="1.45" transform="rotate(45 15.9 14.6)" fill={`url(#${id}g)`} />
          {/* Glint */}
          <motion.path
            d="M7.1 8.2c.5-1.2 1.5-2.1 2.8-2.5"
            stroke="#f5f3ff"
            strokeWidth="1.3"
            strokeLinecap="round"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* Found dot — blips */}
        <motion.circle
          cx="10.5"
          cy="10.5"
          r="1.4"
          fill="#22d3ee"
          style={{ transformOrigin: "10.5px 10.5px" }}
          animate={{ scale: [0, 1.25, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 4.2, times: [0.55, 0.7, 0.85], repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
