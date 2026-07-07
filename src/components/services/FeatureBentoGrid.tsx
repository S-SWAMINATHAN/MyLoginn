"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { TiltCard } from "@/components/ui/TiltCard";
import { StatCounter } from "@/components/ui/StatCounter";
import type { CourseIconKey } from "@/lib/courseIcons";

type Feature = {
  iconKey: CourseIconKey;
  title: string;
  description: string;
  span?: boolean;
};

const features: Feature[] = [
  {
    iconKey: "ai",
    title: "Automated campaigns",
    description: "AI plans, schedules and optimizes campaigns across channels around the clock.",
    span: true,
  },
  {
    iconKey: "marketing",
    title: "AI-optimized social ads",
    description: "Creative and targeting refined continuously using performance signals.",
  },
  {
    iconKey: "comm",
    title: "WhatsApp integration",
    description: "Automated, compliant WhatsApp flows for leads, updates and support.",
  },
  {
    iconKey: "data",
    title: "Real-time analytics",
    description: "Live dashboards tracking spend, conversions and ROAS across every channel.",
  },
  {
    iconKey: "leader",
    title: "Dedicated growth strategist",
    description: "A senior marketer owns your account and reports on what's actually moving.",
  },
];

export function FeatureBentoGrid() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={f.span ? "sm:col-span-2" : ""}
        >
          <TiltCard>
            <Card className="group relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(120%_60%_at_0%_0%,var(--brand-50),transparent_60%)] dark:bg-[radial-gradient(120%_60%_at_0%_0%,rgba(108,77,255,0.12),transparent_60%)]" />
              <div className="relative flex items-start justify-between gap-4">
                <div style={{ transform: "translateZ(28px)" }}>
                  <IconBadge size="lg" className="text-brand-500 dark:text-brand-400" delay={i * 0.06}>
                    <ContentIcon keyword={f.iconKey} className="h-10.5 w-10.5" />
                  </IconBadge>
                </div>
                {f.span && (
                  <div className="text-right">
                    <p className="text-lg font-semibold text-foreground sm:text-xl">
                      <StatCounter to={480} suffix="+" />
                    </p>
                    <p className="text-[11px] text-muted">campaigns tuned this week</p>
                  </div>
                )}
              </div>
              <h3 className="relative mt-4 font-semibold" style={{ transform: "translateZ(20px)" }}>
                {f.title}
              </h3>
              <p className="relative mt-2 text-sm text-muted" style={{ transform: "translateZ(20px)" }}>
                {f.description}
              </p>
            </Card>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
}
