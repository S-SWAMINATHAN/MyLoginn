"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Open book — breathes as a page flips across it in a loop, sparkle of ideas above. */
export function AnimatedBook({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "bk" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}l`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 14px" }}
          animate={{ y: [0, -0.8, 0], rotate: [0, -1, 0, 1, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Left page */}
          <path
            d="M12 6.4C10.3 5 7.9 4.4 5.2 4.4c-.9 0-1.7.1-2.4.25-.5.1-.8.55-.8 1.05v11.6c0 .65.6 1.1 1.25 1 .6-.1 1.25-.15 1.95-.15 2.7 0 5.1.65 6.8 2Z"
            fill={`url(#${id}l)`}
          />
          {/* Right page */}
          <path
            d="M12 6.4c1.7-1.4 4.1-2 6.8-2 .9 0 1.7.1 2.4.25.5.1.8.55.8 1.05v11.6c0 .65-.6 1.1-1.25 1-.6-.1-1.25-.15-1.95-.15-2.7 0-5.1.65-6.8 2Z"
            fill={`url(#${id}r)`}
          />
          {/* Text lines fading in */}
          {[8.4, 10.6, 12.8].map((y, i) => (
            <motion.rect
              key={i}
              x="14"
              y={y}
              width={i === 2 ? 3.6 : 5.2}
              height="0.9"
              rx="0.45"
              fill="#eff6ff"
              animate={{ opacity: [0.35, 0.95, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
            />
          ))}
          {/* Flipping page */}
          <motion.path
            d="M12 6.4c1.7-1.4 4.1-2 6.8-2 .55 0 1.05.04 1.55.1L12 18.4Z"
            fill="#dbeafe"
            opacity="0.9"
            style={{ transformOrigin: "12px 12px" }}
            animate={{ scaleX: [1, -0.9, 1], opacity: [0, 0.9, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
          />
        </motion.g>

        {/* Sparkle */}
        <motion.path
          d="M12 0.8 12.45 2.1 13.75 2.55 12.45 3 12 4.3 11.55 3 10.25 2.55 11.55 2.1Z"
          fill="#7dd3fc"
          style={{ transformOrigin: "12px 2.55px" }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.15, 0.4] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
      </svg>
    </span>
  );
}
