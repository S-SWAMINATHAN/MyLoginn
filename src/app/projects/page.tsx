<<<<<<< HEAD
import type { Metadata } from "next";
=======
>>>>>>> 9a00051 (Initial commit)
import { Section, Container } from "@/components/ui/Section";
import { prisma } from "@/lib/prisma";
import type { ShowcaseProject } from "@/lib/showcaseProjects";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
<<<<<<< HEAD
import { ProjectsCtaBanner } from "@/components/projects/ProjectsCtaBanner";

export const metadata: Metadata = {
  title: "Student Projects — MyLoginn",
  description: "Explore real projects built by MyLoginn students with guidance from experienced mentors.",
  alternates: { canonical: "/projects" },
};

export const dynamic = "force-dynamic";
=======

export const metadata = { title: "Student Projects — MyLoginn" };
>>>>>>> 9a00051 (Initial commit)

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
<<<<<<< HEAD
  const techCount = new Set(showcaseProjects.flatMap((p) => p.tags)).size;
=======
  const categoryCount = new Set(showcaseProjects.flatMap((p) => p.tags)).size;
>>>>>>> 9a00051 (Initial commit)

  return (
    <Section className="pt-14 sm:pt-16">
      <Container>
        <ProjectsHero
          projectCount={showcaseProjects.length}
          mentorCount={mentorCount}
<<<<<<< HEAD
          techCount={techCount}
=======
          categoryCount={categoryCount}
>>>>>>> 9a00051 (Initial commit)
        />

        <div className="mt-14 sm:mt-16">
          <ProjectsExplorer projects={showcaseProjects} />
        </div>
<<<<<<< HEAD

        <ProjectsCtaBanner />
=======
>>>>>>> 9a00051 (Initial commit)
      </Container>
    </Section>
  );
}
