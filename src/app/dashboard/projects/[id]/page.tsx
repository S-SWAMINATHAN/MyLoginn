import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ProgressBar } from "@/components/dashboard/DashboardShell";

export default async function DashboardProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    include: { mentor: { select: { name: true } } },
  });
  if (!project) notFound();

  return (
    <Section className="pt-12">
      <Container className="max-w-3xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">My project</p>
              <h1 className="mt-2 text-2xl font-semibold">{project.title}</h1>
            </div>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-muted">{project.description}</p>
          <div className="mt-7">
            <div className="mb-2 flex justify-between text-sm"><span>Progress</span><span className="font-semibold">{project.progress}%</span></div>
            <ProgressBar value={project.progress} color="var(--accent-500)" />
          </div>
          {project.mentor && <p className="mt-5 text-sm text-muted">Mentor: <span className="font-medium text-foreground">{project.mentor.name}</span></p>}
          {project.dueDate && <p className="mt-2 text-sm text-muted">Due {project.dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
          {project.feedback && <div className="mt-6 rounded-xl bg-surface-2 p-4"><h2 className="text-sm font-semibold">Mentor feedback</h2><p className="mt-2 text-sm text-muted">{project.feedback}</p></div>}
        </Card>
      </Container>
    </Section>
  );
}
