"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Construction } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CardArtAnimation } from "@/components/projects/CardArtAnimation";
import { getCardArtByKey } from "@/lib/projectCardArt";
import { useTiltSpotlight } from "@/hooks/useTiltSpotlight";
import type { ClientProject } from "@/lib/clientProjects";

export function ClientProjectCard({ project, index = 0 }: { project: ClientProject; index?: number }) {
  const art = getCardArtByKey(project.artKey, `client-art-${project.slug}`);
  const { rotateX, rotateY, spotlightBg, onMouseMove, onMouseLeave } = useTiltSpotlight();
  const isLive = project.status === "live";

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
      style={{ perspective: 1200 }}
    >
      <motion.div onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} style={{ rotateX, rotateY }} className="group h-full">
        <Link href={`/projects/${project.slug}`} className="block h-full">
          <Card className="card-shine relative flex h-full flex-col overflow-hidden transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[var(--shadow-lift)]">
            <motion.div
              className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: spotlightBg }}
            />

            <div className="relative flex h-32 shrink-0 items-end overflow-hidden">
              <span
                aria-hidden
                className="absolute inset-0 transition-transform duration-500 group-hover:scale-105 [&>svg]:h-full [&>svg]:w-full"
              >
                <CardArtAnimation svg={art.svg} />
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/10 to-transparent"
              />
              <span className="absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                {isLive ? (
                  "Live project"
                ) : (
                  <>
                    <Construction className="h-3.5 w-3.5" /> Coming soon
                  </>
                )}
              </span>
              <p className="relative z-10 min-w-0 line-clamp-2 px-4 pb-3 text-base font-semibold leading-snug text-white [text-shadow:0_1px_6px_rgba(0,0,0,.45)]">
                {project.name}
              </p>
            </div>

            <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                {project.category}
              </span>
              <p className="mt-2 flex-1 text-[13px] leading-5 text-muted">{project.description}</p>

              {project.highlights.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1 text-xs text-muted">
                  {project.highlights.slice(0, 2).map((h) => (
                    <li key={h} className="flex items-start gap-1.5">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                      <span className="line-clamp-1">{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <span className="mt-4 block">
                <span className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-story-royal px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(11,31,77,0.55)] transition-shadow duration-300 group-hover:shadow-[0_16px_30px_-14px_rgba(11,31,77,0.7)]">
                  View details
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </span>
            </div>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  );
}
