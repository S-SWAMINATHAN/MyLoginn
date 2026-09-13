"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { AnimatedAgent } from "@/components/ui/icons/AnimatedAgent";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";

export function ProjectsCtaBanner() {
  return (
    <Reveal scale className="mt-16 sm:mt-20">
      <div className="card-shine relative overflow-hidden rounded-3xl brand-gradient-bg px-6 py-8 text-white shadow-[0_16px_48px_rgba(31,86,214,0.32)] sm:px-10">
        <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <motion.span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <AnimatedAgent className="h-10 w-10" />
            </motion.span>
            <div>
              <p className="text-lg font-semibold sm:text-xl">Have an idea? Let&apos;s build it together.</p>
              <p className="mt-1 text-sm text-white/80">
                Our learners and mentors are ready to turn your idea into a real-world solution.
              </p>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="shrink-0">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-lg transition-shadow duration-300 hover:shadow-xl"
            >
              Start a Project
              <AnimatedArrow className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </Reveal>
  );
}
