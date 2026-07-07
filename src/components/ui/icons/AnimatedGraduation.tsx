"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Graduation cap — hovers with a swinging tassel and rising sparkles. */
export function AnimatedGraduation({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "gr" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id={`${id}base`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ y: [0, -1.1, 0], rotate: [0, -1.5, 0, 1.5, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Rolled base */}
          <path
            d="M6.6 11.2v4.1c0 .5.25.95.7 1.2 1.4.8 2.98 1.3 4.7 1.3s3.3-.5 4.7-1.3c.45-.25.7-.7.7-1.2v-4.1l-4.9 2.1a1.3 1.3 0 0 1-1 0Z"
            fill={`url(#${id}base)`}
          />
          {/* Mortarboard */}
          <path
            d="M11.5 4.3 2.6 8.1a.6.6 0 0 0 0 1.1l8.9 3.8a1.3 1.3 0 0 0 1 0l8.9-3.8a.6.6 0 0 0 0-1.1l-8.9-3.8a1.3 1.3 0 0 0-1 0Z"
            fill={`url(#${id}g)`}
          />
          {/* Tassel — swings */}
          <motion.g
            style={{ transformOrigin: "20.4px 9.2px" }}
            animate={{ rotate: [0, 10, 0, -8, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          >
            <path d="M20.4 9.2v4.6" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="20.4" cy="14.6" r="1.15" fill="#f59e0b" />
          </motion.g>
        </motion.g>

        {/* Rising sparkles */}
        {[
          { x: 4.6, d: 0 },
          { x: 18, d: 1.1 },
        ].map((s, i) => (
          <motion.path
            key={i}
            d={`M${s.x} 3.4 ${s.x + 0.4} 4.4 ${s.x + 1.4} 4.8 ${s.x + 0.4} 5.2 ${s.x} 6.2 ${s.x - 0.4} 5.2 ${s.x - 1.4} 4.8 ${s.x - 0.4} 4.4Z`}
            fill="#c4b5fd"
            style={{ transformOrigin: `${s.x}px 4.8px` }}
            animate={{ opacity: [0, 1, 0], y: [1.5, -1.5], scale: [0.5, 1.1, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: s.d }}
          />
        ))}
      </svg>
    </span>
  );
}
