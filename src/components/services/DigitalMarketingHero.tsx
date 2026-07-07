"use client";

import { motion } from "framer-motion";
import { AnimatedSparkle } from "@/components/ui/icons/AnimatedSparkle";
import { Eyebrow } from "@/components/ui/Section";
import { StatCounter } from "@/components/ui/StatCounter";
import { LiveActivityTicker } from "@/components/services/LiveActivityTicker";

const tickerItems = [
  "AI campaign launched for a D2C fashion brand — just now",
  "WhatsApp lead flow activated for a SaaS startup — 2m ago",
  "Growth report auto-generated for a clinic chain — 5m ago",
  "Social ad creative refreshed by AI — 8m ago",
  "New consultation request from Bengaluru — 12m ago",
];

const stats: { to: number; decimals?: number; prefix?: string; suffix: string; label: string }[] = [
  { to: 4.8, decimals: 1, suffix: "x", label: "Avg. ROAS" },
  { to: 120, suffix: "+", label: "Active campaigns" },
  { to: 35, suffix: "+", label: "Industries served" },
];

export function DigitalMarketingHero() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-x-10 -top-20 -z-10 h-72 bg-[radial-gradient(60%_60%_at_30%_0%,var(--brand-100),transparent_70%)] dark:bg-[radial-gradient(60%_60%_at_30%_0%,rgba(108,77,255,0.16),transparent_70%)]" />
      <div className="animate-float pointer-events-none absolute -right-10 top-6 -z-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,var(--accent-400),transparent_70%)] opacity-30 blur-2xl" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Eyebrow>
          <AnimatedSparkle className="h-4.5 w-4.5" />
          Growth Marketing
        </Eyebrow>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        <span className="brand-gradient-text bg-size-200">AI-Driven</span> Digital Marketing
        Services
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-4 max-w-xl text-muted"
      >
        For SMEs, startups and established businesses looking to scale online
        &mdash; we run performance marketing powered by AI, with WhatsApp built
        into the customer journey.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.42 }}
        className="mt-6"
      >
        <LiveActivityTicker items={tickerItems} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.55 }}
        className="mt-8 grid grid-cols-3 gap-3"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border-soft bg-surface-2/60 px-3 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-[var(--shadow-soft)] sm:px-4"
          >
            <p className="text-xl font-semibold text-foreground sm:text-2xl">
              <StatCounter to={s.to} decimals={s.decimals} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-[11px] text-muted sm:text-xs">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
