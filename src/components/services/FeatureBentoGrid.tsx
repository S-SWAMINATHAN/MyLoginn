"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { TiltCard } from "@/components/ui/TiltCard";
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
    title: "Campaign planning",
    description: "Plan channel mix, audiences and schedules around your offer, goals and budget.",
    span: true,
  },
  {
    iconKey: "marketing",
    title: "Social and paid campaigns",
    description: "Prepare campaign creative and targeting for the social channels that fit your audience.",
  },
  {
    iconKey: "comm",
    title: "WhatsApp integration",
    description: "Plan WhatsApp messages and lead flows in line with consent and platform requirements.",
  },
  {
    iconKey: "data",
    title: "Real-time analytics",
    description: "Review available campaign data such as spend, enquiries and conversions.",
  },
  {
    iconKey: "leader",
    title: "Strategy and review",
    description: "Set measurable goals, review campaign signals and agree on practical next steps.",
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
              <div className="relative flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="relative text-base font-semibold sm:text-lg" style={{ transform: "translateZ(20px)" }}>
                    {f.title}
                  </h3>
                  <p className="relative mt-2 text-sm text-muted" style={{ transform: "translateZ(20px)" }}>
                    {f.description}
                  </p>
                </div>
                <div className="shrink-0" style={{ transform: "translateZ(28px)" }}>
                  <IconBadge size="xl" className="text-brand-500 dark:text-brand-400" delay={i * 0.06}>
                    <ContentIcon keyword={f.iconKey} className="h-12 w-12" />
                  </IconBadge>
                </div>
              </div>
            </Card>
          </TiltCard>
        </motion.div>
      ))}
    </div>
  );
}
