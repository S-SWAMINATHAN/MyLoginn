"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** AI agent bot — gradient robot head with pulsing antenna, blinking eyes, talking waveform and orbiting spark. */
export function AnimatedAgent({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = "agent" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={style}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
          <linearGradient id={`${id}v`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
          <filter id={`${id}glow`}>
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Head bobbing gently */}
        <motion.g
          animate={{ y: [0, -0.7, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Antenna */}
          <motion.line
            x1="12"
            y1="5.6"
            x2="12"
            y2="3.4"
            stroke={`url(#${id}g)`}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <motion.circle
            cx="12"
            cy="2.6"
            r="1.25"
            fill="#22d3ee"
            filter={`url(#${id}glow)`}
            style={{ transformOrigin: "12px 2.6px" }}
            animate={{ scale: [0.75, 1.25, 0.75], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Signal rings from the antenna */}
          <motion.circle
            cx="12"
            cy="2.6"
            r="2.4"
            stroke="#22d3ee"
            strokeWidth="0.7"
            fill="none"
            style={{ transformOrigin: "12px 2.6px" }}
            animate={{ scale: [0.5, 1.5], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />

          {/* Robot head */}
          <rect
            x="4.6"
            y="5.8"
            width="14.8"
            height="12.6"
            rx="4.4"
            fill={`url(#${id}g)`}
            filter={`url(#${id}glow)`}
          />
          {/* Ears */}
          <rect x="2.6" y="9.9" width="1.7" height="4.4" rx="0.85" fill={`url(#${id}g)`} opacity="0.9" />
          <rect x="19.7" y="9.9" width="1.7" height="4.4" rx="0.85" fill={`url(#${id}g)`} opacity="0.9" />

          {/* Face plate */}
          <rect x="6.5" y="8" width="11" height="8.2" rx="3" fill="#ffffff" opacity="0.16" />

          {/* Blinking eyes */}
          {[9.4, 14.6].map((cx, i) => (
            <motion.ellipse
              key={i}
              cx={cx}
              cy="11.1"
              rx="1.15"
              ry="1.5"
              fill="#f5f3ff"
              style={{ transformOrigin: `${cx}px 11.1px` }}
              animate={{ scaleY: [1, 1, 0.12, 1, 1] }}
              transition={{
                duration: 3.4,
                times: [0, 0.42, 0.5, 0.58, 1],
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.2,
              }}
            />
          ))}

          {/* Talking waveform mouth */}
          {[
            { x: 9.2, d: 0 },
            { x: 10.9, d: 0.18 },
            { x: 12.6, d: 0.36 },
            { x: 14.3, d: 0.54 },
          ].map((bar, i) => (
            <motion.rect
              key={i}
              x={bar.x}
              y="13.6"
              width="1"
              rx="0.5"
              fill={`url(#${id}v)`}
              style={{ transformOrigin: `${bar.x + 0.5}px 14.55px` }}
              height="1.9"
              animate={{ scaleY: [0.45, 1.35, 0.6, 1.1, 0.45] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: bar.d }}
            />
          ))}
        </motion.g>

        {/* Orbiting spark */}
        <motion.g
          style={{ transformOrigin: "12px 12px" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        >
          <motion.path
            d="M21.6 12 22.2 13.4 23.6 14 22.2 14.6 21.6 16 21 14.6 19.6 14 21 13.4Z"
            fill="#22d3ee"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
      </svg>
    </span>
  );
}
