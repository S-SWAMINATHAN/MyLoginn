"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { CategoryTag } from "@/components/ui/CategoryTag";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";
import { AnimatedFolder } from "@/components/ui/icons/AnimatedFolder";
import { AnimatedArrow } from "@/components/ui/icons/AnimatedArrow";
import { useTiltSpotlight } from "@/hooks/useTiltSpotlight";
import type { ShowcaseProject } from "@/lib/showcaseProjects";
import Link from "next/link";

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  "linear-gradient(135deg,#7c3aed,#c084fc)",
  "linear-gradient(135deg,#0ea5e9,#7dd3fc)",
  "linear-gradient(135deg,#059669,#6ee7b7)",
  "linear-gradient(135deg,#e11d48,#fda4af)",
  "linear-gradient(135deg,#d97706,#fde68a)",
  "linear-gradient(135deg,#4f46e5,#a5b4fc)",
];

const ACCENTS = [
  "from-violet-500/90 to-fuchsia-500/90",
  "from-sky-500/90 to-cyan-400/90",
  "from-emerald-500/90 to-teal-400/90",
  "from-rose-500/90 to-pink-400/90",
  "from-amber-500/90 to-yellow-400/90",
  "from-indigo-500/90 to-blue-400/90",
];

export function ProjectsExplorer({ projects }: { projects: ShowcaseProject[] }) {
  const [tag, setTag] = useState("All");
  const tags = useMemo(() => ["All", ...new Set(projects.flatMap((p) => p.tags))], [projects]);
  const filtered = useMemo(
    () => (tag === "All" ? projects : projects.filter((p) => p.tags.includes(tag))),
    [projects, tag]
  );

  return (
    <div>
      {/* Filter pills */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel mx-auto flex max-w-fit flex-wrap justify-center gap-2 rounded-full px-3 py-2.5"
      >
        {tags.map((t) => (
          <motion.button
            key={t}
            onClick={() => setTag(t)}
            whileTap={{ scale: 0.94 }}
            className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 sm:px-4 sm:py-2 ${
              tag === t ? "text-white" : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {tag === t && (
              <motion.span
                layoutId="project-tag-pill"
                className="absolute inset-0 -z-10 rounded-full brand-gradient-bg shadow-[var(--shadow-soft)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {t !== "All" && <ContentIcon keyword={t} className="h-4 w-4" />}
            {t}
          </motion.button>
        ))}
      </motion.div>

      {/* Animated result count */}
      <div className="mt-6 text-center text-xs text-muted">
        <AnimatePresence mode="wait">
          <motion.span
            key={`${tag}-${filtered.length}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="inline-block"
          >
            {filtered.length} {filtered.length === 1 ? "project" : "projects"}
            {tag !== "All" ? ` in ${tag}` : " on display"}
          </motion.span>
        </AnimatePresence>
      </div>

      <motion.div layout className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} colorIndex={projects.indexOf(p)} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <AnimatedFolder className="h-16 w-16 opacity-80" />
          <div>
            <p className="text-sm font-medium">No projects in this category yet</p>
            <p className="mt-1 text-xs text-muted">Check back soon — new capstones ship every cohort.</p>
          </div>
        </motion.div>
      )}

      {/* CTA strip */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="gradient-border relative mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl"
      >
        <div className="relative z-10 flex flex-col items-center gap-4 rounded-2xl bg-surface p-7 text-center sm:flex-row sm:justify-between sm:p-8 sm:text-left">
          <div>
            <h3 className="text-lg font-semibold">Want your project featured here?</h3>
            <p className="mt-1 text-sm text-muted">Join a course cohort and build your capstone with a mentor.</p>
          </div>
          <Link
            href="/courses"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-soft)] transition-transform duration-300 hover:scale-105"
          >
            Explore courses
            <AnimatedArrow className="h-4.5 w-4.5" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function ProjectCard({ project: p, index, colorIndex }: { project: ShowcaseProject; index: number; colorIndex: number }) {
  const { rotateX, rotateY, spotlightBg, onMouseMove, onMouseLeave } = useTiltSpotlight();
  const accent = ACCENTS[((colorIndex % ACCENTS.length) + ACCENTS.length) % ACCENTS.length];
  const avatar = AVATAR_COLORS[((colorIndex % AVATAR_COLORS.length) + AVATAR_COLORS.length) % AVATAR_COLORS.length];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
      style={{ perspective: 1200 }}
    >
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ rotateX, rotateY }}
        className="group h-full"
      >
        <Card className="card-shine relative flex h-full flex-col overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[var(--shadow-lift)]">
          <motion.div
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: spotlightBg }}
          />

          {/* Gradient accent header */}
          <div className={`relative flex h-20 shrink-0 items-center justify-between overflow-hidden bg-gradient-to-r ${accent} px-6`}>
            <span className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/15 blur-xl" />
            <div className="relative flex items-center gap-2 text-white">
              <ContentIcon keyword={p.tags[0] ?? p.title} className="h-8 w-8 drop-shadow" />
              <span className="text-[11px] font-semibold uppercase tracking-wider opacity-90">{p.tags[0]}</span>
            </div>
            <motion.span
              className="relative text-[11px] font-semibold uppercase tracking-wider text-white/85"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              Capstone
            </motion.span>
          </div>

          <div className="relative z-10 flex flex-1 flex-col p-6">
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <CategoryTag key={t} category={t} />
              ))}
            </div>

            <h3 className="mt-4 text-base font-semibold leading-snug transition-colors duration-300 group-hover:text-brand-500">
              {p.title}
            </h3>
            <p className="mt-3 flex-1 text-sm text-muted">{p.description}</p>

            {/* Student + mentor */}
            <div className="mt-5 flex items-center gap-3">
              <motion.span
                className="animate-breathe-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                style={{ background: avatar }}
                whileHover={{ scale: 1.15, rotate: 6 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {initials(p.student)}
              </motion.span>
              <div className="min-w-0 text-xs leading-tight">
                <p className="truncate font-medium text-foreground">{p.student}</p>
                <p className="truncate text-muted">Mentor: {p.mentor}</p>
              </div>
            </div>

            {/* Outcome */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 px-3 py-2.5 text-xs font-semibold text-success">
              <AnimatedTrending className="h-5 w-5 shrink-0" />
              {p.result}
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
