"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Rupee coin — gently bobs with a looping sheen sweep and sparkle. */
export function AnimatedRupee({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "rp" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}coin`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <clipPath id={`${id}clip`}>
            <circle cx="12" cy="12" r="9.2" />
          </clipPath>
        </defs>

        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ y: [0, -1, 0], rotate: [0, -4, 0, 4, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="12" cy="12" r="9.2" fill={`url(#${id}coin)`} />
          <circle cx="12" cy="12" r="7.1" fill="#b45309" opacity="0.25" />
          {/* ₹ symbol */}
          <path
            d="M8.6 6.8h6.8M8.6 9.6h6.8M9.8 6.8c2.6 0 3.8 1 3.8 2.6s-1.2 2.6-3.8 2.6H8.6l5 5.2"
            stroke="#fffbeb"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sheen sweep */}
          <g clipPath={`url(#${id}clip)`}>
            <motion.rect
              x="-6"
              y="0"
              width="5"
              height="24"
              fill="white"
              opacity="0.35"
              transform="skewX(-20)"
              animate={{ x: [-8, 30] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
            />
          </g>
        </motion.g>

        {/* Sparkle */}
        <motion.path
          d="M20.2 3.4 20.7 4.7 22 5.2 20.7 5.7 20.2 7 19.7 5.7 18.4 5.2 19.7 4.7Z"
          fill="#fde68a"
          style={{ transformOrigin: "20.2px 5.2px" }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 90] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
      </svg>
    </span>
  );
}
