"use client";

import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";
import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.02 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(9px)" },
  show: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: 0.75, ease: EASE } },
};

/**
 * Cinematic word-by-word reveal (fade + rise + blur-to-sharp), fired once
 * when scrolled into view. Each word is a `display:inline-block` span (so
 * the rise/blur transform has something to apply to); the space between
 * words is a plain sibling text node rather than trailing content inside
 * that span — a space as the *last* character inside an inline-block is
 * unreliable across browsers (it can get collapsed away entirely), which
 * silently runs words together.
 */
export function SplitHeadline({
  text,
  as: Tag = "h2",
  className,
  style,
  delay = 0,
  highlight,
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
  delay?: number;
  /** Word(s) (case/punctuation-insensitive) to render as a slow shimmering gradient instead of solid color. */
  highlight?: string | string[];
}) {
  const words = text.split(" ");
  const highlightSet = new Set(
    (Array.isArray(highlight) ? highlight : highlight ? [highlight] : []).map((h) => h.toLowerCase())
  );

  return (
    <Tag className={className} style={style}>
      <motion.span
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ delayChildren: delay }}
        style={{ display: "inline" }}
      >
        {words.map((w, i) => {
          const bare = w.replace(/[.,!?:;]+$/, "").toLowerCase();
          const isHighlighted = highlightSet.has(bare);
          return (
            <Fragment key={i}>
              <motion.span
                variants={word}
                style={{ display: "inline-block" }}
                className={cn(isHighlighted && "brand-gradient-text bg-size-200")}
              >
                {w}
              </motion.span>
              {i < words.length - 1 ? " " : ""}
            </Fragment>
          );
        })}
      </motion.span>
    </Tag>
  );
}
