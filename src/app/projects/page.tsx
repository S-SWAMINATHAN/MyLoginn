import { createPageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/ui/Section";
import { prisma } from "@/lib/prisma";
import type { ShowcaseProject } from "@/lib/showcaseProjects";
import { clientProjects } from "@/lib/clientProjects";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ProjectsHeroVisual } from "@/components/pages/PageHeroVisuals";
import Link from "next/link";
import { ClientProjectCard } from "@/components/projects/ClientProjectCard";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { ProjectsCtaBanner } from "@/components/projects/ProjectsCtaBanner";

export const metadata = createPageMetadata({
  title: "Student Projects & Portfolio",
  description: "Explore software and technology projects built by MyLoginn learners with guidance from experienced mentors.",
  path: "/projects",
  keywords: [
    "MyLoginn projects", "software projects", "website projects", "app projects",
    "custom software projects", "technology project portfolio", "student software projects",
    "capstone projects",
  ],
});

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  // Keep the public Projects route useful when the database is temporarily
  // unavailable; the explorer and enquiry CTA still render without records.
  const result = await Promise.allSettled([
    prisma.showcaseProject.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const rows = result[0].status === "fulfilled" ? result[0].value : [];
  const showcaseProjects: ShowcaseProject[] = rows.map((p) => ({
    id: p.slug,
    title: p.title,
    student: p.student,
    result: p.result,
    description: p.description,
    tags: p.tags.split(",").map((t) => t.trim()).filter(Boolean),
    mentor: p.mentor,
  }));

  const projectCount = clientProjects.length + showcaseProjects.length;
  const liveCount = clientProjects.filter((p) => p.status === "live").length;
  const industryCount = new Set(clientProjects.map((p) => p.category)).size;

  return (
    <Section className="pt-6 sm:pt-10">
      <Container className="max-w-[1480px]">
        <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <Reveal><span className="story-eyebrow">Built by learners. Backed by mentors.</span></Reveal>
            <SplitHeadline as="h1" text="Real Projects. Real Impact." className="mt-4 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
            <Reveal direction="up" delay={0.15}>
              <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">Explore capstone projects built by MyLoginn learners with guidance from industry mentors.</p>
            </Reveal>
            <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowLink href="#client-work">See our work</ArrowLink>
              <Link href="/contact" className="rounded-full border border-border-soft bg-surface px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:text-story-royal active:scale-95">Discuss a project</Link>
            </Reveal>
          </div>
          <Reveal direction="left" delay={0.15} className="min-w-0">
            <ProjectsHeroVisual projectCount={projectCount} liveCount={liveCount} industryCount={industryCount} />
          </Reveal>
        </div>

        <div id="client-work" className="mt-20 scroll-mt-24 sm:mt-24">
          <Reveal><span className="story-eyebrow">Real client work</span></Reveal>
          <h2 className="story-subheading mt-3 text-story-navy dark:text-foreground">Projects we&apos;ve shipped</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">
            Live websites and products MyLoginn has built and continues to run for real businesses.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4">
            {clientProjects.map((project, i) => (
              <ClientProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>

        <div className="mt-20 sm:mt-24">
          <Reveal><span className="story-eyebrow">Learner showcase</span></Reveal>
          <h2 className="story-subheading mt-3 text-story-navy dark:text-foreground">Student capstone projects</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">
            Capstone projects built by MyLoginn learners with guidance from industry mentors.
          </p>

          <div className="mt-8">
            <ProjectsExplorer projects={showcaseProjects} />
          </div>
        </div>

        <ProjectsCtaBanner />
      </Container>
    </Section>
  );
}
