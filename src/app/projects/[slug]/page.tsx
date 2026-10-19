import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, Construction, ExternalLink, Smartphone } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { clientProjects, getClientProject } from "@/lib/clientProjects";
import type { ClientProject } from "@/lib/clientProjects";
import { getCourseIconInfo } from "@/lib/courseIcons";
import { getProjectCardArt } from "@/lib/projectCardArt";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { CardArtAnimation } from "@/components/projects/CardArtAnimation";
import { ClientProjectCard } from "@/components/projects/ClientProjectCard";
import { ProjectThumbnail, OotyPreview } from "@/components/sections/ProjectShowcase";
import { AnimatedUsers } from "@/components/ui/icons/AnimatedUsers";
import { AnimatedTrending } from "@/components/ui/icons/AnimatedTrending";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const client = getClientProject(slug);
  if (client) {
    return createPageMetadata({
      title: client.name,
      description: client.longDescription,
      path: `/projects/${client.slug}`,
      keywords: [client.name, client.category],
    });
  }

  const sp = await prisma.showcaseProject.findUnique({ where: { slug } });
  if (!sp) return {};

  return createPageMetadata({
    title: sp.title,
    description: sp.description,
    path: `/projects/${sp.slug}`,
    keywords: [sp.title, ...sp.tags.split(",").map((t) => t.trim())],
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const client = getClientProject(slug);
  if (client) return <ClientProjectDetail project={client} />;

  const sp = await prisma.showcaseProject.findUnique({ where: { slug } });
  if (!sp) notFound();

  return (
    <StudentProjectDetail
      project={{
        title: sp.title,
        student: sp.student,
        result: sp.result,
        description: sp.description,
        tags: sp.tags.split(",").map((t) => t.trim()).filter(Boolean),
        mentor: sp.mentor,
      }}
    />
  );
}

/* ── Real client/company work ───────────────────────────────────────── */
const accents: Record<string, { from: string; to: string; glow: string }> = {
  ecommerce: { from: "#7e22ce", to: "#db2777", glow: "rgba(219,39,119,.35)" },
  travel: { from: "#047857", to: "#0e7490", glow: "rgba(16,185,129,.35)" },
  platform: { from: "#4338ca", to: "#2563eb", glow: "rgba(99,102,241,.4)" },
  mobile: { from: "#0f766e", to: "#0369a1", glow: "rgba(20,184,166,.35)" },
  webdev: { from: "#0f766e", to: "#0369a1", glow: "rgba(20,184,166,.35)" },
};

function ClientProjectDetail({ project }: { project: ClientProject }) {
  const isLive = project.status === "live";
  const accent = accents[project.artKey] ?? accents.platform;
  const others = clientProjects.filter((p) => p.slug !== project.slug);
  const isMobile = project.platform === "mobile";
  const host = project.url ? new URL(project.url).hostname.replace(/^www\./, "") : "Preview coming soon";
  const facts = [
    { label: "Category", value: project.category },
    { label: "Status", value: isLive ? "Live in production" : "In development" },
    { label: "Delivered by", value: "MyLoginn" },
    isMobile ? { label: "Platform", value: "Mobile app" } : { label: "Website", value: host },
  ];
  const gradient = accent.from;

  return (
    <div className="relative overflow-hidden">
      {/* Full-bleed hero */}
      <section className="relative isolate text-white" style={{ backgroundColor: gradient }}>
        <div className="mx-auto grid max-w-[1480px] items-center gap-10 px-4 pb-14 pt-5 sm:px-6 sm:pt-6 lg:grid-cols-[1fr_1.1fr] lg:gap-14 lg:px-10 lg:pb-20 lg:pt-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ring-1 ring-white/25 backdrop-blur">{project.category}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/25 px-3.5 py-1.5 text-xs font-semibold ring-1 ring-white/15 backdrop-blur">
                <span className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-emerald-300" : "bg-amber-300"}`} />
                {isLive ? "Live project" : "Coming soon"}
              </span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:mt-5 sm:text-6xl sm:leading-[1.02] lg:text-7xl">{project.name}</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 sm:mt-5 sm:text-xl sm:leading-relaxed">{project.longDescription}</p>
            <div className="mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:items-center">
              {isLive ? (
                <a href={project.url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:shadow-2xl">
                  <ExternalLink className="h-4 w-4" /> Visit live website
                </a>
              ) : (
                <span className="inline-flex items-center justify-center gap-2 rounded-full bg-white/15 px-6 py-3.5 text-sm font-semibold ring-1 ring-white/25 backdrop-blur"><Construction className="h-4 w-4" /> Public preview coming soon</span>
              )}
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold ring-1 ring-white/40 transition hover:bg-white/10">
                Build something similar <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            
            {isMobile ? (
              <div className="flex justify-center py-4">
                <div className="relative w-[230px] rounded-[2.4rem] bg-slate-950 p-2.5 shadow-2xl shadow-black/40 ring-1 ring-white/25 sm:w-[260px] lg:rotate-[-3deg] lg:transition lg:duration-500 lg:hover:rotate-0">
                  <span aria-hidden className="absolute left-1/2 top-4 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-black" />
                  <div className="flex aspect-[9/18] flex-col items-center justify-center gap-4 rounded-[1.9rem] bg-gradient-to-b from-slate-900 to-slate-800 px-4 text-center">
                    <span className="grid h-14 w-14 place-items-center text-story-royal"><Smartphone className="h-7 w-7" /></span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm"><Construction className="h-4 w-4" /> In development</span>
                  </div>
                </div>
              </div>
            ) : (
            <div className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-black/40 ring-1 ring-white/25 lg:rotate-[-1.5deg] lg:transition lg:duration-500 lg:hover:rotate-0">
              <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400" /><span className="h-3 w-3 rounded-full bg-amber-300" /><span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 flex-1 truncate rounded-md bg-white/10 px-3 py-1 text-xs text-white/70">{host}</span>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden">
                {isLive ? (
                  project.fallbackPreview ? <OotyPreview /> : <ProjectThumbnail name={project.name} />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-900">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm"><Construction className="h-4 w-4" /> In development</span>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* Snapshot strip overlapping the hero */}
      <div className="relative z-10 mx-auto -mt-10 max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border-soft bg-border-soft shadow-[var(--shadow-lift)] lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-surface px-5 py-4 sm:px-6 sm:py-5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{fact.label}</dt>
              <dd className="mt-1 truncate text-base font-semibold sm:text-lg">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* About + deliverables */}
      <section className="mx-auto mt-16 grid max-w-[1480px] items-start gap-6 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:px-10">
        <div className="rounded-3xl border border-border-soft bg-surface p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">About the project</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{isLive ? `What ${project.name} is` : `What ${project.name} will be`}</h2>
          <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-lg">{project.longDescription}</p>
          {project.audience && (
            <div className="mt-6 rounded-2xl p-5" style={{ background: `color-mix(in srgb, ${accent.from} 8%, transparent)` }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent.from }}>Who it is for</p>
              <p className="mt-1.5 text-base font-medium leading-relaxed">{project.audience}</p>
            </div>
          )}
        </div>
        <div className="rounded-3xl p-6 text-white shadow-lg sm:p-8" style={{ backgroundColor: gradient }}>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/75">What MyLoginn delivered</p>
          <ul className="mt-5 space-y-3.5">
            {(project.deliverables ?? ["Design and build", "Launch support"]).map((item) => (
              <li key={item} className="flex items-start gap-3 text-base font-medium leading-snug">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-story-royal"><Check className="h-3.5 w-3.5" /></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Feature cards */}
      {(project.features?.length ?? 0) > 0 ? (
        <section className="mx-auto mt-16 max-w-[1480px] px-4 sm:px-6 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Key features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Built for real customers</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {project.features!.map((feature, index) => (
              <article key={feature.title} className="group relative overflow-hidden rounded-3xl border border-border-soft bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-7">
                <span className="absolute -right-3 -top-6 select-none text-9xl font-black leading-none opacity-[0.06]" style={{ color: accent.from }} aria-hidden>{index + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg" style={{ backgroundColor: gradient }}>{index + 1}</span>
                <h3 className="mt-5 text-xl font-semibold leading-snug">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-muted">{feature.text}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {/* Process */}
      <section className="mx-auto mt-16 max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">How MyLoginn builds</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">From idea to a live product</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: "Discover", text: "We learn the business, the customers and what success looks like." },
            { step: "Design", text: "Clear layouts and a visual identity shaped for the audience." },
            { step: "Build", text: "Responsive, fast and tested pages and features." },
            { step: "Launch & support", text: "Go-live, monitoring and continued improvements." },
          ].map((item, index) => (
            <li key={item.step} className="relative rounded-2xl border border-border-soft bg-surface-2/60 p-5">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: accent.from }}>Step {index + 1}</span>
              <p className="mt-1 text-lg font-semibold">{item.step}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* More projects */}
      <section className="mx-auto mt-16 max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">More from MyLoginn</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Other projects we have shipped</h2>
          </div>
          <Link href="/projects" className="hidden items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline sm:inline-flex">View all <ArrowUpRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((other, index) => <ClientProjectCard key={other.slug} project={other} index={index} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto my-16 max-w-[1480px] px-4 sm:px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl p-8 text-white sm:p-12" style={{ backgroundColor: gradient }}>
          <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Have a product in mind?</h2>
              <p className="mt-2 max-w-2xl text-white/85">Tell us what you want to build. We design, develop and run websites and apps for real businesses.</p>
            </div>
            <Link href="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 shadow-xl transition hover:-translate-y-0.5">Start a project <ArrowUpRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Student capstone work ──────────────────────────────────────────── */
type StudentProjectView = {
  title: string;
  student: string;
  result: string;
  description: string;
  tags: string[];
  mentor: string;
};

function StudentProjectDetail({ project: p }: { project: StudentProjectView }) {
  const primaryTag = p.tags[0] ?? p.title;
  const visual = getCourseIconInfo(primaryTag, `detail-${p.title}`);
  const art = getProjectCardArt(primaryTag, `detail-art-${p.title}`);

  return (
    <Section className="mobile-page-glow pt-5 sm:pt-6">
      <Container className="max-w-4xl">
        <div className="relative h-56 overflow-hidden rounded-2xl sm:h-64">
          <CardArtAnimation svg={art.svg} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
          <h1 className="absolute inset-x-0 bottom-0 px-6 pb-5 text-2xl font-semibold leading-snug text-white [text-shadow:0_1px_6px_rgba(0,0,0,.45)] sm:text-3xl">
            {p.title}
          </h1>
        </div>

        <span
          className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
          style={{ background: `color-mix(in srgb, ${visual.accent} 14%, transparent)`, color: visual.accent }}
        >
          <ContentIcon keyword={primaryTag} className="h-4 w-4" />
          {primaryTag}
        </span>

        <p className="mt-5 leading-relaxed text-foreground/90">{p.description}</p>

        {p.tags.length > 1 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {p.tags.map((t) => (
              <span key={t} className="rounded-full border border-border-soft bg-surface-2 px-3 py-1 text-xs font-medium text-foreground/80">
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-border-soft bg-surface-2 p-5 text-sm">
          <span className="font-medium text-foreground">Built by {p.student}</span>
          <span className="inline-flex items-center gap-1.5 text-muted">
            <AnimatedUsers className="h-5 w-5" /> Mentored by {p.mentor}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">
          <AnimatedTrending className="h-5 w-5 shrink-0" />
          {p.result}
        </div>
      </Container>
    </Section>
  );
}
