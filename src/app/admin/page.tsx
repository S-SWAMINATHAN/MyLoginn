import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = { title: "Admin — MyLoginn" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [users, courses, applications, projects, leads, internshipCount, enrollmentCount] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.course.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.internshipApplication.findMany({
      include: { user: true, internship: true },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.project.findMany({ include: { user: true, mentor: true }, orderBy: { updatedAt: "desc" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.internship.count(),
    prisma.enrollment.count(),
  ]);

  return (
    <Section className="pt-12">
      <Container>
        <h1 className="text-2xl font-semibold">Admin panel</h1>
        <p className="mt-1.5 text-sm text-muted">
          Manage users, courses, internships and projects across MyLoginn.
        </p>

        <div className="mt-8">
          <AdminDashboard
            stats={{
              users: users.length,
              courses: courses.length,
              internships: internshipCount,
              enrollments: enrollmentCount,
              applications: applications.length,
              leads: leads.length,
            }}
            users={users.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              emailVerified: u.emailVerified,
              createdAt: u.createdAt.toISOString(),
            }))}
            courses={courses.map((c) => ({
              id: c.id,
              title: c.title,
              category: c.category,
              level: c.level,
              price: c.price,
              studentsCount: c.studentsCount,
            }))}
            applications={applications.map((a) => ({
              id: a.id,
              applicantName: a.user.name,
              applicantEmail: a.user.email,
              internshipTitle: a.internship.title,
              status: a.status,
              appliedAt: a.appliedAt.toISOString(),
            }))}
            projects={projects.map((p) => ({
              id: p.id,
              userName: p.user.name,
              title: p.title,
              status: p.status,
              progress: p.progress,
              feedback: p.feedback,
            }))}
            leads={leads.map((l) => ({
              id: l.id,
              name: l.name,
              email: l.email,
              phone: l.phone,
              service: l.service,
              status: l.status,
              createdAt: l.createdAt.toISOString(),
            }))}
          />
        </div>
      </Container>
    </Section>
  );
}
