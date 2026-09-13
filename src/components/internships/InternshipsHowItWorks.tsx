"use client";

import { motion } from "framer-motion";
import type { ComponentType, CSSProperties } from "react";
import { Eyebrow } from "@/components/ui/Section";
import { AnimatedSparkle } from "@/components/ui/icons/AnimatedSparkle";
import { AnimatedEdit } from "@/components/ui/icons/AnimatedEdit";
import { AnimatedUser } from "@/components/ui/icons/AnimatedUser";
import { AnimatedRocket } from "@/components/ui/icons/AnimatedRocket";

type IconType = ComponentType<{ className?: string; style?: CSSProperties }>;

const STEPS: { icon: IconType; title: string; desc: string }[] = [
  { icon: AnimatedEdit, title: "Apply", desc: "Browse internships and submit your application" },
  { icon: AnimatedUser, title: "Selection", desc: "Shortlisted candidates get an interview call" },
  { icon: AnimatedRocket, title: "Start Learning", desc: "Join, learn and build your career" },
];

export function InternshipsHowItWorks() {
  return (
    <div className="mt-16 sm:mt-20">
      <div className="mx-auto max-w-2xl text-center">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Eyebrow className="gap-2">
            <AnimatedSparkle className="h-4.5 w-4.5" />
            Simple Process
          </Eyebrow>
        </motion.div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
        <p className="mt-2 text-sm text-muted sm:text-base">Get started in 3 easy steps</p>
      </div>

      <div className="mt-10 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex flex-1 items-center gap-3">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel card-shine flex flex-1 items-center gap-4 overflow-hidden rounded-2xl p-5"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full brand-gradient-bg text-sm font-semibold text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="mt-0.5 text-xs text-muted">{step.desc}</p>
              </div>
              <step.icon className="h-9 w-9 shrink-0" />
            </motion.div>

            {i < STEPS.length - 1 && (
              <span className="hidden shrink-0 text-lg text-brand-400 sm:inline-flex" aria-hidden>
                »
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
