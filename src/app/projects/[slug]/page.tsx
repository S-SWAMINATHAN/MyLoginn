import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Construction, ExternalLink } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getClientProject } from "@/lib/clientProjects";
import type { ClientProject } from "@/lib/clientProjects";
import { getCourseIconInfo } from "@/lib/courseIcons";
import { getProjectCardArt } from "@/lib/projectCardArt";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { CardArtAnimation } from "@/components/projects/CardArtAnimation";
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

function BackLink() {
  return (
    <Link
      href="/projects"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" /> Back to all projects
    </Link>
  );
}

/* ── Real client/company work ───────────────────────────────────────── */
function ClientProjectDetail({ project }: { project: ClientProject }) {
  const isLive = project.status === "live";

  return (
    <Section className="mobile-page-glow pt-14">
      <Container className="max-w-4xl">
        <BackLink />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <Eyebrow>{project.category}</Eyebrow>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{project.name}</h1>
            <p className="mt-5 leading-relaxed text-foreground/90">{project.longDescription}</p>

            {project.highlights.length > 0 && (
              <ul className="mt-6 flex flex-col gap-2.5 text-sm text-muted">
                {project.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isLive ? (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full brand-gradient-bg px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:brightness-110"
                >
                  <ExternalLink className="h-4 w-4" /> Visit live website
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface-2 px-5 py-2.5 text-sm font-semibold text-muted">
                  <Construction className="h-4 w-4" /> Coming soon
                </span>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border-soft shadow-[var(--shadow-lift)] lg:sticky lg:top-24">
            <div className="relative aspect-[16/10] overflow-hidden">
              {isLive ? (
                project.fallbackPreview ? <OotyPreview /> : <ProjectThumbnail name={project.name} />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#3b82f6,transparent_38%),linear-gradient(145deg,#111827,#020617)] text-white">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                    <Construction className="h-4 w-4" /> In development
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Section>
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
    <Section className="mobile-page-glow pt-14">
      <Container className="max-w-4xl">
        <BackLink />

        <div className="relative mt-6 h-56 overflow-hidden rounded-2xl sm:h-64">
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
