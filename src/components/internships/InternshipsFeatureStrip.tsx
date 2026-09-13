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
  { icon: AnimatedFolder, title: "Real-world Projects", desc: "Work on live projects used by real users" },
  { icon: AnimatedUsers, title: "Mentor Support", desc: "1-to-1 guidance from industry experts" },
  { icon: AnimatedShield, title: "Certification", desc: "Earn certificates to boost your profile" },
  { icon: AnimatedChat, title: "Interview Prep", desc: "Resume review & mock interviews" },
  { icon: AnimatedTrending, title: "Career Growth", desc: "Better opportunities for your future" },
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
