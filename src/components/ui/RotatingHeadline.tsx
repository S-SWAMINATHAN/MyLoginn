"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

// Splits a phrase into two display lines: on the first comma/period if one
// exists, otherwise roughly down the middle by word count.
function splitPhrase(text: string): [string, string] {
  const punctuated = text.match(/^(.*?[,.])\s+(.*)$/);
  if (punctuated) return [punctuated[1], punctuated[2]];
  const words = text.split(" ");
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function RotatingHeadline({
  phrases,
  interval = 3500,
  className,
  gradientClassName,
}: {
  phrases: string[];
  /** Milliseconds each phrase stays on screen before advancing. */
  interval?: number;
  className?: string;
  gradientClassName?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, interval);
    return () => clearInterval(id);
  }, [phrases.length, interval]);

  return (
    <span className={cn("block", className)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          className="block"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -18 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {splitPhrase(phrases[index]).map((line, i) => (
            <span key={i} className={cn("block", i === 1 && gradientClassName)}>
              {line}
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
