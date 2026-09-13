import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { InternshipApplyPanel } from "@/components/internships/InternshipApplyPanel";
import { AnimatedMapPin } from "@/components/ui/icons/AnimatedMapPin";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
import { AnimatedCrown } from "@/components/ui/icons/AnimatedCrown";

export default async function InternshipDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const internship = await prisma.internship.findUnique({ where: { slug } });
  if (!internship) notFound();

  const user = await getCurrentUser();
  const application = user
    ? await prisma.internshipApplication.findUnique({
        where: { userId_internshipId: { userId: user.id, internshipId: internship.id } },
      })
    : null;

  const requirements = internship.requirements.split("\n").map((r) => r.trim()).filter(Boolean);
  const responsibilities = internship.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean);

  return (
    <Section className="pt-14">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <CourseIconThumb
                category={internship.type}
                title={internship.title}
                variant="round"
                className="h-16 w-16 shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <Eyebrow>{internship.type}</Eyebrow>
                  {internship.featured && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-500">
                      <AnimatedCrown className="h-4.5 w-4.5" /> Featured
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{internship.title}</h1>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted">{internship.company}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <AnimatedMapPin className="h-5 w-5" /> {internship.location}
              </span>
              <span className="flex items-center gap-1.5">
                <AnimatedClock className="h-5 w-5" /> {internship.durationWeeks} weeks
              </span>
              <span className="flex items-center gap-1.5">
                <AnimatedRupee className="h-5 w-5" />{" "}
                {internship.paid ? `₹${internship.stipend?.toLocaleString()} / month` : "Unpaid"}
              </span>
            </div>

            <p className="mt-8 leading-relaxed text-foreground/90">{internship.description}</p>

            {responsibilities.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold">Responsibilities</h2>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                  {responsibilities.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {requirements.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold">Requirements</h2>
                <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                  {requirements.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-border-soft bg-surface-2 p-5 text-sm text-muted">
              Mentor: <span className="font-medium text-foreground">{internship.mentorName}</span> ·{" "}
              {internship.mentorEmail}
            </div>
          </div>

          <div>
            <div className="lg:sticky lg:top-24">
              <InternshipApplyPanel
                internshipId={internship.id}
                paid={internship.paid}
                stipend={internship.stipend}
                applyDeadline={internship.applyDeadline.toISOString()}
                loggedIn={Boolean(user)}
                applicationStatus={application?.status ?? null}
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
