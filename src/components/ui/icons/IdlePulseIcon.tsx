"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function IdlePulseIcon({
  children,
  className,
  style,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}) {
  return (
    <motion.span
      className={cn("inline-flex shrink-0", className)}
      style={style}
      animate={{ scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.span>
  );
}
