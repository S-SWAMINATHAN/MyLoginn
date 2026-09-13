"use client";

import { motion } from "framer-motion";
import { AnimatedGraduation } from "@/components/ui/icons/AnimatedGraduation";
import { AnimatedUser } from "@/components/ui/icons/AnimatedUser";
import { AnimatedStar } from "@/components/ui/icons/AnimatedStar";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";

/** Decorative hero visual — a floating ID-badge card on a lanyard, with a
 * graduation-cap accent and small stat chips orbiting it. */
export function InternshipHeroIllustration() {
  return (
    <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80" aria-hidden>
      <div className="aurora-blob absolute inset-6 bg-brand-400/25 dark:bg-brand-500/20" />

      {/* Lanyard strap */}
      <motion.div
        className="absolute left-1/2 top-0 h-24 w-10 -translate-x-1/2 rounded-b-full"
        style={{ background: "linear-gradient(180deg,var(--brand-400),var(--brand-600))" }}
        animate={{ rotate: [-2, 2, -2] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Badge card */}
      <motion.div
        className="glass-panel card-shine absolute left-1/2 top-16 flex w-44 -translate-x-1/2 flex-col items-center gap-2.5 overflow-hidden rounded-2xl p-5 shadow-[var(--shadow-lift)] sm:w-48"
        animate={{ y: [0, -8, 0], rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-2">
          <span className="h-2 w-2 rounded-full bg-brand-400" />
        </span>
        <span className="flex h-16 w-16 items-center justify-center rounded-full brand-gradient-bg">
          <AnimatedUser className="h-9 w-9" />
        </span>
        <div className="mt-1 h-2 w-24 rounded-full bg-surface-2" />
        <div className="h-2 w-16 rounded-full bg-surface-2" />
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-surface-2" />
        <div className="h-1.5 w-4/5 rounded-full bg-surface-2" />
      </motion.div>

      {/* Graduation cap accent */}
      <motion.span
        className="glass-panel absolute bottom-6 right-2 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[var(--shadow-lift)] sm:h-20 sm:w-20"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <AnimatedGraduation className="h-10 w-10 sm:h-12 sm:w-12" />
      </motion.span>

      {/* Star chip */}
      <motion.span
        className="glass-panel absolute left-2 top-24 flex h-10 w-10 items-center justify-center rounded-full shadow-[var(--shadow-soft)]"
        animate={{ y: [0, 7, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        <AnimatedStar className="h-6 w-6" />
      </motion.span>

      {/* Trending chip */}
      <motion.span
        className="glass-panel absolute bottom-2 left-8 flex h-12 w-12 items-center justify-center rounded-2xl shadow-[var(--shadow-soft)]"
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
      >
        <AnimatedTrending className="h-7 w-7" />
      </motion.span>
    </div>
  );
}
