"use client";

import { motion } from "framer-motion";
import { AnimatedSparkle } from "@/components/ui/icons/AnimatedSparkle";
import { Eyebrow } from "@/components/ui/Section";
import { StatCounter } from "@/components/ui/StatCounter";
import { LiveActivityTicker } from "@/components/services/LiveActivityTicker";
import Image from "next/image";
import marketingHeader from "@/images/digital marketting header.png";
import { ReferenceStatIcon } from "@/components/ui/ReferenceStatIcon";

const tickerItems = [
  "AI campaign launched for a D2C fashion brand — just now",
  "WhatsApp lead flow activated for a SaaS startup — 2m ago",
  "Growth report auto-generated for a clinic chain — 5m ago",
  "Social ad creative refreshed by AI — 8m ago",
  "New consultation request from Bengaluru — 12m ago",
];

const stats = [
  { icon: "marketing-roas", to: 250, suffix: "+", label: "Clients Served" },
  { icon: "marketing-campaigns", to: 150, suffix: "K+", label: "Leads Generated" },
  { icon: "marketing-industries", to: 45, suffix: "%", label: "Avg. ROI Increase" },
  { icon: "marketing-engagement", to: 3, suffix: "M+", label: "Brand Engagement" },
];

export function DigitalMarketingHero() {
  return (
    <div className="relative grid items-center gap-4 md:grid-cols-[1.05fr_.95fr]">
      <div className="pointer-events-none absolute -inset-x-10 -top-20 -z-10 h-72 bg-[radial-gradient(60%_60%_at_30%_0%,var(--brand-100),transparent_70%)] dark:bg-[radial-gradient(60%_60%_at_30%_0%,rgba(108,77,255,0.16),transparent_70%)]" />
      <div className="animate-float pointer-events-none absolute -right-10 top-6 -z-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,var(--accent-400),transparent_70%)] opacity-30 blur-2xl" />

      <div className="relative z-10">
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
        className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl"
      >
        Scale your business with <span className="brand-gradient-text bg-size-200">data-driven</span> digital marketing
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="mt-4 max-w-xl text-base text-muted sm:text-lg"
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
        className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border-soft bg-surface-2/60 px-3 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-[var(--shadow-soft)] sm:px-4"
          >
            <ReferenceStatIcon name={s.icon as "marketing-roas" | "marketing-campaigns" | "marketing-industries" | "marketing-engagement"} className="mx-auto mb-1 h-10 w-10" />
            <p className="text-xl font-semibold text-foreground sm:text-2xl">
              <StatCounter to={s.to} decimals={s.decimals} suffix={s.suffix} />
            </p>
            <p className="mt-1 text-[11px] text-muted sm:text-xs">{s.label}</p>
          </div>
        ))}
      </motion.div>
      </div>
      <div className="relative mx-auto h-64 w-full max-w-xl md:h-[430px]"><Image src={marketingHeader} alt="Digital marketing analytics, campaigns and growth" fill priority className="scale-110 object-contain" sizes="(max-width: 768px) 100vw, 48vw" /></div>
    </div>
  );
}
