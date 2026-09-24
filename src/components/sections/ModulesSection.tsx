"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";
import { AnimatedExploreCourses } from "@/components/ui/icons/AnimatedExploreCourses";
import type { CourseIconKey } from "@/lib/courseIcons";

const modules: {
  iconKey: CourseIconKey;
  title: string;
  description: string;
  href: string;
  color: string;
}[] = [
  {
    iconKey: "ai",
    title: "Advanced Digital Marketing & AI/ML Courses",
    description:
      "Live sessions, personalized AI recommendations, mentor support and placement guidance for working professionals & graduates.",
    href: "/courses",
    color: "var(--brand-500)",
  },
  {
    iconKey: "student",
    title: "Online Tutoring Program",
    description:
      "Personalized tutoring for CBSE & State Board curricula with live classes, progress dashboards and custom study plans.",
    href: "/tutoring",
    color: "var(--accent-500)",
  },
  {
    iconKey: "career",
    title: "Internship Programs",
    description:
      "Paid & unpaid internships for IT and engineering students with certification, mentor feedback and interview prep.",
    href: "/internships",
    color: "var(--brand-600)",
  },
  {
    iconKey: "leader",
    title: "Student Project Showcase",
    description:
      "Real capstone projects built by our learners, with mentor feedback and outcomes — browse for inspiration.",
    href: "/projects",
    color: "var(--brand-300)",
  },
  {
    iconKey: "marketing",
    title: "Digital Marketing Services",
    description:
      "AI-driven campaigns, optimized social ads, WhatsApp integration and real-time analytics for growing businesses.",
    href: "/services/digital-marketing",
    color: "var(--accent-600)",
  },
  {
    iconKey: "webdev",
    title: "App & Website Development",
    description:
      "Full-stack development, smooth animations, server maintenance and real-time updates for startups & enterprises.",
    href: "/services/app-web-development",
    color: "var(--brand-400)",
  },
];

export function ModulesSection() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>What we offer</Eyebrow>
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            One platform. Every path forward.
          </h2>
          <p className="mt-4 text-muted">
            Whether you&apos;re a student, a job-seeker, or a founder scaling a
            business &mdash; MyLoginn has a path built for you.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => (
            <motion.div
              key={m.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={m.href} className="group block h-full">
                <Card className="flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[var(--shadow-lift)] hover:border-brand-300">
                  <IconBadge size="xl" style={{ color: m.color }} delay={i * 0.08}>
                    <ContentIcon keyword={m.iconKey} className="h-13 w-13 sm:h-14 sm:w-14" />
                  </IconBadge>
                  <h3 className="mt-5 text-lg font-semibold leading-snug">{m.title}</h3>
                  <p className="mt-2.5 flex-1 text-sm text-muted">{m.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-brand-500">
                    Explore
                    {m.href === "/courses" ? (
                      <AnimatedExploreCourses className="h-5.5 w-5.5" />
                    ) : (
                      <AnimatedArrow className="h-5 w-5" />
                    )}
                  </span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
