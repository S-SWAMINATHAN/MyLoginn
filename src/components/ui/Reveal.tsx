"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

type Direction = "up" | "down" | "left" | "right" | "none";

function offsetFor(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
}

/** Scroll-triggered entrance: fade + slide + soft blur, fired once when in view. */
export function Reveal({
  children,
  className,
  direction = "up",
  distance = 26,
  delay = 0,
  duration = 0.7,
  scale,
}: {
  children: ReactNode;
  className?: string;
  direction?: Direction;
  distance?: number;
  delay?: number;
  duration?: number;
  scale?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(6px)", ...(scale ? { scale: 0.94 } : {}), ...offsetFor(direction, distance) }}
      whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  show: (stagger: number) => ({
    transition: { staggerChildren: stagger, delayChildren: 0.08 },
  }),
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(5px)", scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: { duration: 0.65, ease: EASE },
  },
};

/** Staggered container — wrap a grid/list, use RevealItem for each child. */
export function RevealGroup({
  children,
  className,
  stagger = 0.09,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={groupVariants}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={cn("will-change-transform", className)}>
      {children}
    </motion.div>
  );
}
