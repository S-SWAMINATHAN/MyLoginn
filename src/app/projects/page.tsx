import { Section, Container } from "@/components/ui/Section";
import { prisma } from "@/lib/prisma";
import type { ShowcaseProject } from "@/lib/showcaseProjects";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";

export const metadata = { title: "Student Projects — MyLoginn" };

export default async function ProjectsPage() {
  const rows = await prisma.showcaseProject.findMany({ orderBy: { sortOrder: "asc" } });
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
  const categoryCount = new Set(showcaseProjects.flatMap((p) => p.tags)).size;

  return (
    <Section className="pt-14 sm:pt-16">
      <Container>
        <ProjectsHero
          projectCount={showcaseProjects.length}
          mentorCount={mentorCount}
          categoryCount={categoryCount}
        />

        <div className="mt-14 sm:mt-16">
          <ProjectsExplorer projects={showcaseProjects} />
        </div>
      </Container>
    </Section>
  );
}
