"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Chat bubble — bobs gently with live typing dots inside. */
export function AnimatedChat({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "ch" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 20px" }}
          animate={{ y: [0, -1, 0], scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M12 2.8c-5.3 0-9.4 3.6-9.4 8.2 0 2.3 1.05 4.35 2.75 5.8-.15 1.2-.65 2.4-1.6 3.4-.25.25-.05.7.3.65 2-.25 3.6-.95 4.75-1.7 1 .3 2.1.45 3.2.45 5.3 0 9.4-3.6 9.4-8.2S17.3 2.8 12 2.8Z"
            fill={`url(#${id}g)`}
          />
          {/* Typing dots */}
          {[8.3, 12, 15.7].map((cx, i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy="11"
              r="1.25"
              fill="#f0fdfa"
              animate={{ y: [0, -1.7, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.18 }}
            />
          ))}
        </motion.g>

        {/* Reaction heart popping */}
        <motion.path
          d="M20.3 3.1c-.5-.5-1.3-.5-1.8 0l-.2.2-.2-.2c-.5-.5-1.3-.5-1.8 0s-.5 1.3 0 1.8l2 2 2-2c.5-.5.5-1.3 0-1.8Z"
          fill="#fb7185"
          style={{ transformOrigin: "18.3px 4.6px" }}
          animate={{ scale: [0, 1.15, 1, 0], opacity: [0, 1, 1, 0], y: [2, -1, -2, -4] }}
          transition={{ duration: 3, times: [0, 0.25, 0.6, 1], repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
        />
      </svg>
    </span>
  );
}
