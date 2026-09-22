"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Construction, ExternalLink, X } from "lucide-react";

const websites = [
  {
    name: "ZiyaKart",
    url: "https://www.ziyakart.com/",
    category: "E-commerce website",
    description: "A live commerce experience built for browsing and buying.",
  },
  {
    name: "Ooty Nigel Travels",
    url: "https://www.ootynigeltravels.com/",
    category: "Travel website",
    description: "A focused digital home for discovering Ooty travel experiences.",
    fallbackPreview: true,
  },
  {
    name: "Skill Up Now",
    url: "https://skillupnowadmin.org",
    category: "Admin platform",
    description: "A structured platform for managing learning operations.",
  },
];

export function ProjectShowcase() {
  const [selectedProject, setSelectedProject] = useState<(typeof websites)[number] | null>(null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setSelectedProject(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-border-soft bg-surface-2/45 py-20 sm:py-24" aria-labelledby="showcase-title">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="story-eyebrow">Selected work</p>
          <h2 id="showcase-title" className="story-heading mt-4 text-story-navy">
            Built for the real world.
          </h2>
          <p className="mt-4 max-w-xl text-sm text-muted sm:text-base">
            A few live examples of the websites and products MyLoginn develops. Open any project to visit its live home.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {websites.map((project) => (
            <article key={project.name} className="group overflow-hidden rounded-2xl border border-border-soft bg-surface shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1">
              <button type="button" onClick={() => setSelectedProject(project)} aria-label={`Preview ${project.name}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-slate-100 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-inset">
                {project.fallbackPreview ? <OotyPreview /> : <iframe src={project.url} title={`${project.name} live preview`} loading="lazy" className="pointer-events-none h-[220%] w-[220%] origin-top-left scale-[0.4545] border-0" />}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
              </button>
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-500">{project.category}</p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{project.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>
                <button type="button" onClick={() => setSelectedProject(project)} className="mt-4 inline-flex cursor-pointer items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500">View project <ArrowUpRight className="h-4 w-4" /></button>
              </div>
            </article>
          ))}

          <article className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-white shadow-[var(--shadow-soft)]">
            <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#3b82f6,transparent_38%),linear-gradient(145deg,#111827,#020617)] p-5 blur-[1px]">
              <div className="h-3 w-24 rounded-full bg-white/70" />
              <div className="mt-5 grid grid-cols-[0.7fr_1fr] gap-3">
                <div className="space-y-3"><div className="h-20 rounded-xl bg-white/10" /><div className="h-8 rounded-lg bg-cyan-300/50" /></div>
                <div className="space-y-3"><div className="h-8 rounded-lg bg-white/15" /><div className="h-24 rounded-xl bg-white/10" /></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/35 blur-0">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm"><Construction className="h-4 w-4" /> Coming Soon</span>
              </div>
            </div>
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Application in development</p>
              <h3 className="mt-2 text-lg font-semibold">RentMitra.app</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">A work in progress. The public product preview will arrive when it is ready to share.</p>
            </div>
          </article>
        </div>
      </div>
      {selectedProject && <ProjectPreviewModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </section>
  );
}

function ProjectPreviewModal({ project, onClose }: { project: (typeof websites)[number]; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="project-preview-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border-soft px-5 py-4 sm:px-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">Live project preview</p><h2 id="project-preview-title" className="mt-1 text-lg font-semibold text-foreground">{project.name}</h2></div><button type="button" onClick={onClose} aria-label="Close preview" className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-foreground"><X className="h-5 w-5" /></button></div>
        <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-3 sm:p-5">{project.fallbackPreview ? <div className="relative mx-auto aspect-[16/10] max-w-5xl overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]"><OotyPreview large /></div> : <iframe src={project.url} title={`${project.name} live website`} className="h-[68dvh] min-h-96 w-full rounded-2xl border border-border-soft bg-white" />}{project.fallbackPreview && <p className="mx-auto mt-3 max-w-5xl text-center text-sm text-muted">This client website blocks embedded browsing. Use the button below to open the full live site.</p>}</div>
        <div className="flex flex-col-reverse gap-3 border-t border-border-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-sm text-muted">{project.description}</p><a href={project.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full brand-gradient-bg px-5 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:brightness-110"><ExternalLink className="h-4 w-4" />Visit live website</a></div>
      </div>
    </div>,
    document.body
  );
}

function OotyPreview({ large = false }: { large?: boolean }) {
  return (
    <div className={`relative h-full w-full overflow-hidden bg-[linear-gradient(145deg,#082d46_0%,#0d6079_43%,#a3d8d4_44%,#d8e7c8_100%)] text-white ${large ? "p-8 sm:p-12" : "p-3"}`}>
      <div className={`relative z-10 flex items-center justify-between font-semibold uppercase tracking-[0.14em] text-white/80 ${large ? "text-xs sm:text-sm" : "text-[7px]"}`}><span>Ooty Nigel Travels</span><span>Explore Ooty</span></div>
      <div className={`relative z-10 max-w-[68%] ${large ? "mt-14 sm:mt-20" : "mt-4"}`}><p className={`font-semibold leading-tight ${large ? "text-3xl sm:text-5xl" : "text-lg"}`}>Travel into the Nilgiris</p><p className={`mt-2 text-white/80 ${large ? "max-w-lg text-sm sm:text-lg" : "text-[8px]"}`}>Curated journeys, stays and local experiences.</p><span className={`mt-4 inline-block rounded-full bg-white font-semibold text-[#0b3551] shadow-sm ${large ? "px-5 py-2.5 text-sm" : "px-2.5 py-1 text-[8px]"}`}>Plan your trip</span></div>
      <div aria-hidden className="absolute bottom-0 right-0 h-[70%] w-[56%] bg-[radial-gradient(circle_at_70%_65%,#2e6d57_0_7%,transparent_8%),radial-gradient(circle_at_45%_50%,#3f8062_0_10%,transparent_11%),linear-gradient(150deg,transparent_0_25%,#245a49_26%_43%,transparent_44%)] opacity-85" />
    </div>
  );
}
