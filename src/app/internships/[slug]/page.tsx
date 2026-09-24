import { notFound } from "next/navigation";
<<<<<<< HEAD
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { InternshipApplyPanel } from "@/components/internships/InternshipApplyPanel";
import { AnimatedMapPin } from "@/components/ui/icons/AnimatedMapPin";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
import { AnimatedCrown } from "@/components/ui/icons/AnimatedCrown";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const internship = await prisma.internship.findUnique({
    where: { slug },
    select: { title: true, description: true, slug: true },
  });

  if (!internship) return {};

  return {
    title: `${internship.title} — MyLoginn Internships`,
    description: internship.description,
    alternates: { canonical: `/internships/${internship.slug}` },
  };
}

export default async function InternshipDetailPage({
=======
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { ApplyForm } from "@/components/internships/ApplyForm";
import { AnimatedMapPin } from "@/components/ui/icons/AnimatedMapPin";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedRupee } from "@/components/ui/icons/AnimatedRupee";
import { AnimatedCalendar } from "@/components/ui/icons/AnimatedCalendar";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";

export default async function InternshipDetailsPage({
>>>>>>> 9a00051 (Initial commit)
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const internship = await prisma.internship.findUnique({ where: { slug } });
  if (!internship) notFound();

  const user = await getCurrentUser();
<<<<<<< HEAD
  const application = user
=======
  const existingApplication = user
>>>>>>> 9a00051 (Initial commit)
    ? await prisma.internshipApplication.findUnique({
        where: { userId_internshipId: { userId: user.id, internshipId: internship.id } },
      })
    : null;

<<<<<<< HEAD
  const requirements = internship.requirements.split("\n").map((r) => r.trim()).filter(Boolean);
  const responsibilities = internship.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean);
=======
  const requirements = JSON.parse(internship.requirements) as string[];
  const responsibilities = JSON.parse(internship.responsibilities) as string[];
  const deadline = internship.applyDeadline;
>>>>>>> 9a00051 (Initial commit)

  return (
    <Section className="pt-14">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
<<<<<<< HEAD
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
=======
            <Eyebrow>{internship.type} Internship</Eyebrow>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{internship.title}</h1>
            <p className="mt-2 text-muted">{internship.company}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
              <span className="group flex items-center gap-1.5">
                <AnimatedMapPin className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> {internship.location}
              </span>
              <span className="group flex items-center gap-1.5">
                <AnimatedClock className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> {internship.durationWeeks} weeks
              </span>
              <span className="group flex items-center gap-1.5">
                <AnimatedRupee className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" />
                {internship.paid ? `${internship.stipend?.toLocaleString()}/month` : "Unpaid"}
              </span>
              <span className="group flex items-center gap-1.5">
                <AnimatedCalendar className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> Apply by {deadline.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
>>>>>>> 9a00051 (Initial commit)
              </span>
            </div>

            <p className="mt-8 leading-relaxed text-foreground/90">{internship.description}</p>

<<<<<<< HEAD
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
=======
            <div className="mt-8">
              <h2 className="font-semibold">Responsibilities</h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                {responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h2 className="font-semibold">Requirements</h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                {requirements.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 rounded-2xl border border-border-soft bg-surface-2/60 p-5">
              <h2 className="text-sm font-semibold">Mentor contact</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                {internship.mentorName} ·
                <a href={`mailto:${internship.mentorEmail}`} className="group flex items-center gap-1 text-brand-500">
                  <AnimatedMail className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-125" /> {internship.mentorEmail}
                </a>
              </p>
>>>>>>> 9a00051 (Initial commit)
            </div>
          </div>

          <div>
            <div className="lg:sticky lg:top-24">
<<<<<<< HEAD
              <InternshipApplyPanel
                internshipId={internship.id}
                paid={internship.paid}
                stipend={internship.stipend}
                applyDeadline={internship.applyDeadline.toISOString()}
                loggedIn={Boolean(user)}
                applicationStatus={application?.status ?? null}
=======
              <ApplyForm
                internshipId={internship.id}
                isLoggedIn={!!user}
                alreadyApplied={!!existingApplication}
>>>>>>> 9a00051 (Initial commit)
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
