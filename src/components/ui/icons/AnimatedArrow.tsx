"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import { ArrowRight } from "lucide-react";

export function AnimatedArrow({
  className,
  style,
  direction = "right",
}: {
  className?: string;
  style?: CSSProperties;
  direction?: "right" | "up-right";
}) {
  return (
    <motion.span
      className={cn("inline-flex shrink-0", className)}
      style={style}
      animate={{ x: [0, 7, 7], opacity: [1, 1, 0] }}
      transition={{ duration: 1.3, repeat: Infinity, ease: "easeIn", times: [0, 0.55, 1] }}
    >
      <ArrowRight
        className="h-full w-full"
        style={direction === "up-right" ? { transform: "rotate(-45deg)" } : undefined}
      />
    </motion.span>
  );
}
