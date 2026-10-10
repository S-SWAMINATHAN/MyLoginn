import { createPageMetadata } from "@/lib/seo";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { prisma } from "@/lib/prisma";
import type { ShowcaseProject } from "@/lib/showcaseProjects";
import { clientProjects } from "@/lib/clientProjects";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
import { ClientProjectCard } from "@/components/projects/ClientProjectCard";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { ProjectsCtaBanner } from "@/components/projects/ProjectsCtaBanner";
import { AnimatedRocket } from "@/components/ui/icons/AnimatedRocket";
import { AnimatedGraduation } from "@/components/ui/icons/AnimatedGraduation";

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
    <Section className="mobile-page-glow pt-3 sm:pt-5">
      <Container className="max-w-[1480px]">
        <ProjectsHero
          projectCount={projectCount}
          liveCount={liveCount}
          industryCount={industryCount}
        />

        <div className="mt-14 sm:mt-16">
          <Eyebrow className="gap-2">
            <AnimatedRocket className="h-4.5 w-4.5" />
            Real client work
          </Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Projects we&apos;ve shipped</h2>
          <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
            Live websites and products MyLoginn has built and continues to run for real businesses.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4">
            {clientProjects.map((project, i) => (
              <ClientProjectCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </div>

        <div className="mt-14 sm:mt-16">
          <Eyebrow className="gap-2">
            <AnimatedGraduation className="h-4.5 w-4.5" />
            Learner showcase
          </Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Student capstone projects</h2>
          <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">
            Capstone projects built by MyLoginn learners with guidance from industry mentors.
          </p>

          <div className="mt-6">
            <ProjectsExplorer projects={showcaseProjects} />
          </div>
        </div>

        <ProjectsCtaBanner />
      </Container>
    </Section>
  );
}
