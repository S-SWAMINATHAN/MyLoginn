"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowUpRight, Construction, ExternalLink, Info, X } from "lucide-react";
import type { ClientProject } from "@/lib/clientProjects";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { CardArtAnimation } from "@/components/projects/CardArtAnimation";
import { getCardArtByKey } from "@/lib/projectCardArt";
import { StatCounter } from "@/components/ui/StatCounter";

export function ProjectShowcase({ projects }: { projects: ClientProject[] }) {
  const websites = projects.filter((p) => p.status === "live");
  const comingSoon = projects.filter((p) => p.status === "in-development");
  const [selectedProject, setSelectedProject] = useState<ClientProject | null>(null);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const duration = Math.max(32, websites.length * 5);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelectedProject(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-border-soft bg-surface-2/45 py-20 sm:py-24" aria-labelledby="showcase-title">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div>
          <p className="story-eyebrow">Selected work</p>
          <h2 id="showcase-title" className="story-heading mt-4 flex w-full items-baseline justify-between gap-3 text-story-navy">
            <span className="min-w-0">Our projects</span>
            <span aria-hidden="true" className="shrink-0 text-right tabular-nums"><StatCounter to={projects.length} duration={1.4} minimumDigits={2} suffix="+" /></span><span className="sr-only">, {projects.length} projects</span>
          </h2>
          <p className="mt-4 max-w-xl text-sm text-muted sm:text-base">
            Live websites and products built by Myloginn. Open any project for a quick preview.
          </p>
        </div>

        <div
          role="region"
          aria-label="Client project highlights"
          tabIndex={reducedMotion ? 0 : undefined}
          className={`relative mt-10 ${reducedMotion ? "overflow-x-auto overscroll-x-contain snap-x snap-mandatory no-scrollbar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal" : "overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_3%,#000_97%,transparent)]"}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
          }}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onTouchCancel={() => setPaused(false)}
        >
          <div
            className={`flex w-max ${reducedMotion ? "py-2" : "py-3"}`}
            style={!reducedMotion ? { animation: `client-project-marquee ${duration}s linear infinite`, animationPlayState: paused ? "paused" : "running" } : undefined}
          >
            {[0, ...(reducedMotion ? [] : [1])].map((copy) => (
              <div key={copy} aria-hidden={copy === 1 || undefined} inert={copy === 1 || undefined} className="flex shrink-0 gap-5 pr-5">
                {websites.map((project) => (
                  <article key={project.slug} className="group w-[min(82vw,18rem)] shrink-0 overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1 snap-start">
                    <button type="button" onClick={() => setSelectedProject(project)} aria-label={`Preview ${project.name}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset">
                      <ProjectThumbnail project={project} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
                    </button>
                    <div className="p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-500">{project.category}</p>
                      <Link href={`/projects/${project.slug}`} className="mt-2 block text-lg font-semibold text-foreground transition-colors hover:text-brand-600">
                        {project.name}
                      </Link>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>
                      <div className="mt-4 flex items-center gap-4">
                        <button type="button" onClick={() => setSelectedProject(project)} className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500">Quick preview <ArrowUpRight className="h-4 w-4" /></button>
                        <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground">More info <Info className="h-4 w-4" /></Link>
                      </div>
                    </div>
                  </article>
                ))}
                {comingSoon.map((project) => (
                  <article key={project.slug} className="w-[min(82vw,18rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-white shadow-[var(--shadow-soft)]">
                    <Link href={`/projects/${project.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#3b82f6,transparent_38%),linear-gradient(145deg,#111827,#020617)] p-5 blur-[1px]">
                      <div className="h-3 w-24 rounded-full bg-white/70" />
                      <div className="mt-5 grid grid-cols-[0.7fr_1fr] gap-3">
                        <div className="space-y-3"><div className="h-20 rounded-xl bg-white/10" /><div className="h-8 rounded-lg bg-cyan-300/50" /></div>
                        <div className="space-y-3"><div className="h-8 rounded-lg bg-white/15" /><div className="h-24 rounded-xl bg-white/10" /></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 blur-0">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm"><Construction className="h-4 w-4" /> Coming Soon</span>
                      </div>
                    </Link>
                    <div className="p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">{project.category}</p>
                      <Link href={`/projects/${project.slug}`} className="mt-2 block text-lg font-semibold transition-colors hover:text-cyan-300">{project.name}</Link>
                      <p className="mt-2 text-sm leading-relaxed text-slate-300">{project.description}</p>
                      <Link href={`/projects/${project.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors hover:text-white">More info <Info className="h-4 w-4" /></Link>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
          {!reducedMotion && <style>{`@keyframes client-project-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>}
        </div>
      </div>
      {selectedProject && <ProjectPreviewModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}

export function ProjectThumbnail({ project }: { project: ClientProject }) {
  const art = getCardArtByKey(project.artKey, `showcase-${project.slug}-${useId()}`);
  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 text-left text-white">
      <CardArtAnimation svg={art.svg} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-slate-950/35" />
      <div className="absolute inset-x-3 top-3 flex min-w-0 items-center gap-1.5 sm:inset-x-4 sm:top-4">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
        <span className="ml-1 truncate text-[8px] text-white/85 sm:text-[10px]">{project.category}</span>
      </div>
      <div className="absolute inset-x-3 bottom-3 flex min-w-0 items-end justify-between gap-2 sm:inset-x-4 sm:bottom-4">
        <span className="min-w-0 truncate text-sm font-bold [text-shadow:0_1px_5px_rgba(0,0,0,.65)] sm:text-base">{project.name}</span>
        {project.cardMetric && <span className="shrink-0 rounded-full border border-white/20 bg-slate-950/45 px-2 py-1 text-[8px] font-bold text-white backdrop-blur sm:text-[10px]">{project.cardMetric}</span>}
      </div>
    </div>
  );
}

function ProjectPreviewModal({ project, onClose }: { project: ClientProject; onClose: () => void }) {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="project-preview-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border-soft px-5 py-4 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Live project preview</p><h2 id="project-preview-title" className="mt-1 text-lg font-semibold text-foreground">{project.name}</h2></div><button type="button" onClick={onClose} aria-label="Close preview" className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-foreground"><X className="h-5 w-5" /></button></div>
        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3 sm:p-5">
          {project.fallbackPreview ? (
            <div className="relative mx-auto aspect-[16/10] max-w-5xl overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]"><OotyPreview large /></div>
          ) : project.url ? (
            <iframe src={project.url} title={`${project.name} live website`} className="h-[68dvh] min-h-96 w-full rounded-2xl border border-border-soft bg-white" />
          ) : (
            <div className="relative mx-auto aspect-[16/10] max-w-5xl overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]"><ProjectThumbnail project={project} /></div>
          )}
          {project.url ? (
            <p className="mx-auto mt-3 max-w-5xl text-center text-sm text-muted">{project.fallbackPreview ? "This client website blocks embedded browsing. Use the button below to open the full live site." : "Live website preview."}</p>
          ) : (
            <p className="mx-auto mt-3 max-w-5xl text-center text-sm text-muted">This private client project has no public website preview.</p>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-border-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted">{project.description}</p>
          {project.url ? <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:brightness-110"><ExternalLink className="h-4 w-4" />Visit live website</a> : <span className="text-sm font-semibold text-muted">Private client project</span>}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function OotyPreview({ large = false }: { large?: boolean }) {
  return (
    <div className={`relative h-full w-full overflow-hidden bg-[linear-gradient(145deg,#082d46_0%,#0d6079_43%,#a3d8d4_44%,#d8e7c8_100%)] text-white ${large ? "p-8 sm:p-12" : "p-3"}`}>
      <div className={`relative z-10 flex items-center justify-between font-semibold uppercase tracking-[0.14em] text-white/80 ${large ? "text-xs sm:text-sm" : "text-[7px]"}`}><span>Ooty Nigel Travels</span><span>Explore Ooty</span></div>
      <div className={`relative z-10 max-w-[68%] ${large ? "mt-14 sm:mt-20" : "mt-4"}`}><p className={`font-semibold leading-tight ${large ? "text-3xl sm:text-5xl" : "text-lg"}`}>Travel into the Nilgiris</p><p className={`mt-2 text-white/80 ${large ? "max-w-lg text-sm sm:text-lg" : "text-[8px]"}`}>Curated journeys, stays and local experiences.</p><span className={`mt-4 inline-block rounded-full bg-white font-semibold text-[#0b3551] shadow-sm ${large ? "px-5 py-2.5 text-sm" : "px-2.5 py-1 text-[8px]"}`}>Plan your trip</span></div>
      <div aria-hidden className="absolute bottom-0 right-0 h-[70%] w-[56%] bg-[radial-gradient(circle_at_70%_65%,#2e6d57_0_7%,transparent_8%),radial-gradient(circle_at_45%_50%,#3f8062_0_10%,transparent_11%),linear-gradient(150deg,transparent_0_25%,#245a49_26%_43%,transparent_44%)] opacity-85" />
    </div>
  );
}
