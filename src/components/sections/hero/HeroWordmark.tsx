"use client";

import { motion } from "framer-motion";
import logoText from "@/images/MyLoginn Logo Wordmark.png";
import { LogoWordmark } from "@/components/ui/LogoBadge";
import { useReducedMotion } from "@/lib/useReducedMotion";

const EASE = [0.16, 1, 0.3, 1] as const;

/** A four-point sparkle that twinkles on the letterforms. */
function Sparkle({ left, top, delay, size = 7 }: { left: string; top: string; delay: number; size?: number }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 20 20"
      className="pointer-events-none absolute"
      style={{ left, top, width: size, height: size }}
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 90, 180] }}
      transition={{ duration: 1.4, delay, repeat: Infinity, repeatDelay: 3.2, ease: "easeInOut" }}
    >
      <path d="M10 0 C11 7 13 9 20 10 C13 11 11 13 10 20 C9 13 7 11 0 10 C7 9 9 7 10 0 Z" fill="#ffffff" style={{ filter: "drop-shadow(0 0 3px rgba(34,211,238,0.9))" }} />
    </motion.svg>
  );
}

/**
 * The small MYLOGINN wordmark above the hero headline, in the logo's own style: it wipes in, then a band of light
 * sweeps across the letters every few seconds and sparkles twinkle on them. No hover effects.
 */
export function HeroWordmark({ delay = 0.1 }: { delay?: number }) {
  const reduced = useReducedMotion();
  const mask = `url(${logoText.src})`;

  return (
    <motion.span
      className="relative inline-flex select-none"
      initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(5px)", clipPath: "inset(0 100% 0 0)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)", clipPath: "inset(-40% -10% -40% -10%)" }}
      transition={{ duration: 1, delay, ease: EASE }}
    >
      <LogoWordmark className="h-3 sm:h-3.5" />
      {!reduced && (
        <>
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
              backgroundImage: "linear-gradient(105deg, transparent 36%, rgba(255,255,255,0.95) 48%, rgba(186,230,253,0.9) 52%, transparent 64%)",
              backgroundSize: "260% 100%",
              backgroundRepeat: "no-repeat",
            }}
            initial={{ backgroundPosition: "130% 0%" }}
            animate={{ backgroundPosition: ["130% 0%", "-30% 0%"] }}
            transition={{ duration: 1.6, delay: delay + 1.2, repeat: Infinity, repeatDelay: 3.8, ease: "easeInOut" }}
          />
          <Sparkle left="6%" top="-55%" delay={delay + 1.6} />
          <Sparkle left="94%" top="-45%" delay={delay + 3} size={6} />
        </>
      )}
    </motion.span>
  );
}
