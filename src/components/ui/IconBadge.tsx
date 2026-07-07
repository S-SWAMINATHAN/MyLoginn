"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  sm: "h-13 w-13 rounded-full",
  md: "h-16 w-16 rounded-full",
  lg: "h-18 w-18 rounded-full",
  xl: "h-22 w-22 rounded-full",
};

export function IconBadge({
  children,
  size = "md",
  className,
  style,
  delay = 0,
}: {
  children: ReactNode;
  size?: keyof typeof sizes;
  className?: string;
  style?: CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className={cn("flex shrink-0 items-center justify-center", sizes[size], className)}
      style={style}
      initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.14, rotate: 8 }}
      whileTap={{ scale: 0.9, rotate: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 16, delay }}
    >
      {children}
    </motion.div>
  );
}
