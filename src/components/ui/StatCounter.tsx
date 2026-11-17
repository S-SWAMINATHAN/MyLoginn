"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function StatCounter({
  from = 0,
  to,
  decimals = 0,
  minimumDigits = 0,
  prefix = "",
  suffix = "",
  duration = 1.6,
  className,
}: {
  from?: number;
  to: number;
  decimals?: number;
  minimumDigits?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reducedMotion = useReducedMotion();
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setValue(to);
      return;
    }
    const controls = animate(from, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      repeat: Infinity,
      repeatType: "reverse",
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, from, to, duration, reducedMotion]);

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      {value.toFixed(decimals).padStart(minimumDigits, "0")}
      {suffix}
    </motion.span>
  );
}
