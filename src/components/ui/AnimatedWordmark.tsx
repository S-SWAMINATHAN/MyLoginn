"use client";

import { motion } from "framer-motion";
import logoText from "@/images/MyLoginn Logo Wordmark.png";
import { LogoWordmark } from "@/components/ui/LogoBadge";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The MYLOGINN wordmark with a restrained, professional motion sequence: a left-to-right wipe reveals the letters
 * (with a soft un-blur and rise), then a thin band of light sweeps across the letterforms every few seconds. The sheen
 * is masked to the logo's own pixels, so it never spills onto the background. Motion is
 * skipped for people who prefer reduced motion.
 */
export function AnimatedWordmark({ className, size = "h-2.5 sm:h-3", delay = 0.1 }: { className?: string; size?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const mask = `url(${logoText.src})`;

  return (
    <motion.span
      className={cn("relative inline-flex cursor-default select-none", className)}
      initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(5px)", clipPath: "inset(0 100% 0 0)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      <LogoWordmark className={size} />
      {!reduced && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            WebkitMaskImage: mask,
            maskImage: mask,
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            backgroundImage: "linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.95) 50%, transparent 62%)",
            backgroundSize: "260% 100%",
            backgroundRepeat: "no-repeat",
          }}
          initial={{ backgroundPosition: "130% 0%" }}
          animate={{ backgroundPosition: ["130% 0%", "-30% 0%"] }}
          transition={{ duration: 1.5, delay: delay + 1.3, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
        />
      )}
    </motion.span>
  );
}
