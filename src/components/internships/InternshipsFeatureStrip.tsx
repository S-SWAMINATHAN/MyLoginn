"use client";

import { motion } from "framer-motion";
import type { ComponentType, CSSProperties } from "react";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
import { AnimatedUsers } from "@/components/ui/icons/AnimatedUsers";
import { AnimatedShield } from "@/components/ui/icons/AnimatedShield";
import { AnimatedChat } from "@/components/ui/icons/AnimatedChat";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";

type IconType = ComponentType<{ className?: string; style?: CSSProperties }>;

const FEATURES: { icon: IconType; title: string; desc: string }[] = [
  { icon: AnimatedFolder, title: "Role details", desc: "Review the responsibilities listed for each opening" },
  { icon: AnimatedUsers, title: "Requirements", desc: "Check the qualifications and expectations for the role" },
  { icon: AnimatedShield, title: "Program format", desc: "Review the type and duration shown on each listing" },
  { icon: AnimatedChat, title: "Application", desc: "Use the program page to see how to apply" },
  { icon: AnimatedTrending, title: "Current openings", desc: "Explore available opportunities and their deadlines" },
];

export function InternshipsFeatureStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel mt-16 grid grid-cols-2 gap-6 rounded-2xl p-6 sm:mt-20 sm:grid-cols-3 sm:p-8 lg:grid-cols-5"
    >
      {FEATURES.map((f) => (
        <div key={f.title} className="flex flex-col items-start gap-3">
          <f.icon className="h-9 w-9 shrink-0" />
          <div>
            <p className="text-sm font-semibold">{f.title}</p>
            <p className="mt-1 text-xs text-muted">{f.desc}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
