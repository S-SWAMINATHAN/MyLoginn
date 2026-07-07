"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Project folder — a document slides up out of it in a loop while the flap breathes. */
export function AnimatedFolder({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "fd" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <defs>
          <linearGradient id={`${id}back`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id={`${id}front`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Folder back */}
        <path
          d="M3 6.2c0-1.2 1-2.2 2.2-2.2h4.1c.6 0 1.2.25 1.6.7l1 1.1h6.9c1.2 0 2.2 1 2.2 2.2v1H3Z"
          fill={`url(#${id}back)`}
        />

        {/* Document sliding up */}
        <motion.g
          animate={{ y: [1.5, -2.6, 1.5] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="7.4" y="6.6" width="9.2" height="9" rx="1.1" fill="#f8fafc" />
          {[8.6, 10.4, 12.2].map((y, i) => (
            <motion.rect
              key={i}
              x="9"
              y={y}
              width={i === 2 ? 4 : 6}
              height="0.9"
              rx="0.45"
              fill="#94a3b8"
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
            />
          ))}
        </motion.g>

        {/* Folder front — breathes open */}
        <motion.path
          d="M2.6 10.4c.15-.9.95-1.6 1.9-1.6h15c1.2 0 2.1 1.05 1.9 2.25l-1.35 7.6a2 2 0 0 1-1.95 1.65H5.9a2 2 0 0 1-1.95-1.65Z"
          fill={`url(#${id}front)`}
          style={{ transformOrigin: "12px 20.3px" }}
          animate={{ scaleY: [1, 0.96, 1], skewX: [0, -1.5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Sparkle */}
        <motion.path
          d="M20.8 2.2 21.3 3.5 22.6 4 21.3 4.5 20.8 5.8 20.3 4.5 19 4 20.3 3.5Z"
          fill="#fde68a"
          style={{ transformOrigin: "20.8px 4px" }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.15, 0.4] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
        />
      </svg>
    </span>
  );
}
