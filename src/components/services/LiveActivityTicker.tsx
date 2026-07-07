"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function LiveActivityTicker({
  items,
  intervalMs = 3600,
  className,
}: {
  items: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  return (
    <div
      className={cn(
        "glass-panel flex w-full max-w-md items-center gap-3 rounded-full px-4 py-2",
        className
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-success">Live</span>
      <span className="relative h-4.5 min-w-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 truncate text-xs text-muted sm:text-sm"
          >
            {items[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
