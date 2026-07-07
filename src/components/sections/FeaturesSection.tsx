"use client";

import { motion } from "framer-motion";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import type { CourseIconKey } from "@/lib/courseIcons";

const features: { iconKey: CourseIconKey; title: string; description: string }[] = [
  {
    iconKey: "ai",
    title: "AI-personalized paths",
    description: "Recommendations that adapt to your goals, pace and performance in real time.",
  },
  {
    iconKey: "comm",
    title: "Real mentor support",
    description: "1:1 feedback from working professionals across marketing, AI/ML and engineering.",
  },
  {
    iconKey: "data",
    title: "Live progress tracking",
    description: "Dashboards for courses, internships and projects update the moment you act.",
  },
  {
    iconKey: "testing",
    title: "Verified certification",
    description: "Course and internship certificates recognized by our hiring & mentor network.",
  },
];

export function FeaturesSection() {
  return (
    <Section className="bg-surface-2/50">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>Why MyLoginn</Eyebrow>
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Built for outcomes, not just content
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className="text-center sm:text-left"
            >
              <IconBadge size="xl" className="mx-auto text-brand-500 dark:text-brand-400 sm:mx-0" delay={i * 0.1}>
                <ContentIcon keyword={f.iconKey} className="h-13 w-13 sm:h-14 sm:w-14" />
              </IconBadge>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
