"use client";

import { motion } from "framer-motion";

const steps = [
  { title: "Discovery call", description: "We learn your goals, audience and budget." },
  { title: "AI campaign design", description: "Creative, targeting and channel mix are planned." },
  { title: "Launch & optimize", description: "Campaigns go live with continuous AI tuning." },
  { title: "Transparent reporting", description: "A live dashboard shows exactly what's working." },
];

export function HowItWorksTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mt-10 rounded-2xl border border-border-soft bg-surface-2/60 p-6"
    >
      <h2 className="font-semibold">How it works</h2>
      <ol className="relative mt-6 flex flex-col gap-8">
        <motion.div
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: "top" }}
          className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-500 via-brand-400 to-accent-400"
        />
        {steps.map((step, i) => (
          <motion.li
            key={step.title}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex gap-4 pl-0"
          >
            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full brand-gradient-bg text-sm font-semibold text-white shadow-[var(--shadow-soft)]">
              {i + 1}
            </span>
            <span className="pt-1 text-sm text-muted">
              <strong className="text-foreground">{step.title}</strong> &mdash; {step.description}
            </span>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}
