"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AnimatedAgent } from "@/components/ui/icons/AnimatedAgent";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";

export function InternshipsCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative mt-16 overflow-hidden rounded-2xl p-7 sm:mt-20 sm:p-9"
      style={{ background: "linear-gradient(120deg, var(--brand-50), var(--accent-400)10, var(--brand-100))" }}
    >
      <div className="glass-panel absolute inset-0 -z-10" />
      <span className="aurora-blob absolute -left-10 -top-16 h-56 w-56 bg-brand-400/25 dark:bg-brand-500/20" aria-hidden />
      <span className="aurora-blob aurora-blob-alt absolute -right-10 -bottom-16 h-56 w-56 bg-accent-400/20 dark:bg-accent-500/15" aria-hidden />

      <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
          <motion.span
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl brand-gradient-bg shadow-[var(--shadow-lift)]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <AnimatedAgent className="h-9 w-9" />
          </motion.span>
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              Ready to start <span className="brand-gradient-text">your journey?</span>
            </h2>
            <p className="mt-1.5 max-w-md text-sm text-muted">
              Find the right internship, gain real experience and build your future.
            </p>
          </div>
        </div>

        <Button href="#all-internships" size="lg" icon={<AnimatedArrow className="h-5 w-5" />} className="shrink-0">
          Browse Internships
        </Button>
      </div>
    </motion.div>
  );
}
