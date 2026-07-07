"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/cn";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.028, delayChildren: 0.1 },
  },
};

const word: Variants = {
  hidden: { opacity: 0, y: "0.6em", rotateX: -40 },
  show: {
    opacity: 1,
    y: "0em",
    rotateX: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function AnimatedText({
  text,
  as: Tag = "span",
  className,
  wordClassName,
  delay = 0,
}: {
  text: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  const MotionTag = motion[Tag as "span"] ?? motion.span;

  return (
    <MotionTag
      className={cn("inline-block [perspective:800px]", className)}
      variants={container}
      initial="hidden"
      animate="show"
      transition={{ delayChildren: delay }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={word}
          className={cn("inline-block will-change-transform", wordClassName)}
          style={{ marginRight: "0.28em" }}
        >
          {w}
        </motion.span>
      ))}
    </MotionTag>
  );
}
