import { createPageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/ui/Section";
import { prisma } from "@/lib/prisma";
import type { ShowcaseProject } from "@/lib/showcaseProjects";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
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

  const mentorCount = new Set(showcaseProjects.map((p) => p.mentor)).size;
  const techCount = new Set(showcaseProjects.flatMap((p) => p.tags)).size;

  return (
    <Section className="mobile-page-glow pt-3 sm:pt-5">
      <Container className="max-w-[1480px]">
        <ProjectsHero
          projectCount={showcaseProjects.length}
          mentorCount={mentorCount}
          techCount={techCount}
        />

        <div className="mt-8 sm:mt-10">
          <ProjectsExplorer projects={showcaseProjects} />
        </div>

        <ProjectsCtaBanner />
      </Container>
    </Section>
  );
}
