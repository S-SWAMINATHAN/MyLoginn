"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Filled gradient rocket — hovers with flickering flame and passing speed lines. */
export function AnimatedRocket({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "rk" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}body`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="55%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id={`${id}fin`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3730a3" />
          </linearGradient>
          <linearGradient id={`${id}flame`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ y: [0, -1.6, 0], rotate: [-2, 2, -2] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Fins */}
          <path d="M8.9 12.6c-2 .8-3.1 2.5-3.4 5 1.7-.2 3.2-.9 4.3-2.2Z" fill={`url(#${id}fin)`} />
          <path d="M15.1 12.6c2 .8 3.1 2.5 3.4 5-1.7-.2-3.2-.9-4.3-2.2Z" fill={`url(#${id}fin)`} />
          {/* Body */}
          <path
            d="M12 1.6c3 1.9 4.6 5 4.6 8.7 0 2.4-.7 4.5-1.9 6.1a1.3 1.3 0 0 1-1.05.5h-3.3a1.3 1.3 0 0 1-1.05-.5c-1.2-1.6-1.9-3.7-1.9-6.1 0-3.7 1.6-6.8 4.6-8.7Z"
            fill={`url(#${id}body)`}
          />
          {/* Window */}
          <motion.circle
            cx="12"
            cy="8.6"
            r="1.9"
            fill="#22d3ee"
            style={{ transformOrigin: "12px 8.6px" }}
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.12, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <circle cx="12" cy="8.6" r="1.9" fill="none" stroke="#e0e7ff" strokeWidth="0.7" />

          {/* Flame — flickers */}
          <motion.path
            d="M12 17.6c1.15 0 1.9.4 1.9 1.5 0 1.5-.9 2.9-1.9 3.9-1-1-1.9-2.4-1.9-3.9 0-1.1.75-1.5 1.9-1.5Z"
            fill={`url(#${id}flame)`}
            style={{ transformOrigin: "12px 17.8px" }}
            animate={{ scaleY: [0.75, 1.25, 0.9, 1.2, 0.75], scaleX: [1, 0.85, 1.05, 0.9, 1], opacity: [0.8, 1, 0.9, 1, 0.8] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>

        {/* Speed lines */}
        {[
          { x: 4.2, y1: 4, d: 0 },
          { x: 20, y1: 7, d: 0.5 },
        ].map((l, i) => (
          <motion.line
            key={i}
            x1={l.x}
            y1={l.y1}
            x2={l.x}
            y2={l.y1 + 3.4}
            stroke="#a5b4fc"
            strokeWidth="1.1"
            strokeLinecap="round"
            animate={{ y: [-2, 4], opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeIn", delay: l.d }}
          />
        ))}
      </svg>
    </span>
  );
}
