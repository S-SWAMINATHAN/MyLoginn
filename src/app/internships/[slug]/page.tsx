import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { InternshipApplyPanel } from "@/components/internships/InternshipApplyPanel";
import { InternshipFacts } from "@/components/internships/InternshipFacts";
import { AnimatedCrown } from "@/components/ui/icons/AnimatedCrown";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const internship = await prisma.internship.findUnique({
    where: { slug },
    select: { title: true, description: true, slug: true, company: true },
  });

  if (!internship) return {};

  return createPageMetadata({
    title: internship.title,
    description: internship.description,
    path: `/internships/${internship.slug}`,
    keywords: [
      internship.title,
      `${internship.company} internship`,
      "software development internship",
      "technology internship",
    ],
  });
}

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

  const initials = internship.mentorName.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <Section className="pt-8 sm:pt-12">
      <Container className="max-w-6xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <div className="min-w-0">
            {/* Header */}
            <Reveal>
              <div className="flex items-center gap-4 sm:gap-5">
                <CourseIconThumb category={internship.type} title={internship.title} variant="round" className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="story-eyebrow">{internship.type}</span>
                    {internship.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                        <AnimatedCrown className="h-4 w-4" /> Featured
                      </span>
                    )}
                  </div>
                  <h1 className="mt-2 text-2xl font-bold leading-[1.1] tracking-tight text-story-navy sm:text-4xl dark:text-foreground">{internship.title}</h1>
                  <p className="mt-2 text-sm text-muted">{internship.company}</p>
                </div>
              </div>
            </Reveal>

            <InternshipFacts type={internship.type} location={internship.location} weeks={internship.durationWeeks} />

            <Reveal direction="up" delay={0.1}>
              <p className="mt-7 text-base leading-8 text-foreground/90">{internship.description}</p>
            </Reveal>

            {responsibilities.length > 0 && (
              <section className="mt-12" aria-labelledby="responsibilities">
                <Reveal><span className="story-eyebrow">The role</span></Reveal>
                <h2 id="responsibilities" className="story-subheading mt-3 text-story-navy dark:text-foreground">Responsibilities</h2>
                <ol className="relative mt-6 space-y-3">
                  <span aria-hidden className="absolute bottom-5 left-[17px] top-5 w-px bg-border-soft" />
                  {responsibilities.map((item, i) => (
                    <li key={i}>
                      <Reveal direction="right" delay={i * 0.06}>
                        <div className="group relative flex items-center gap-3.5">
                          <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-story-royal text-xs font-bold text-white shadow-[0_8px_16px_-8px_rgba(31,86,214,0.9)]">{i + 1}</span>
                          <p className="flex-1 py-2 text-sm font-medium transition-all duration-300 group-hover:translate-x-1 group-hover:text-story-royal">{item}</p>
                        </div>
                      </Reveal>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {requirements.length > 0 && (
              <section className="mt-12" aria-labelledby="requirements">
                <Reveal><span className="story-eyebrow">What you need</span></Reveal>
                <h2 id="requirements" className="story-subheading mt-3 text-story-navy dark:text-foreground">Requirements</h2>
                <RevealGroup className="mt-6 flex flex-wrap gap-x-7 gap-y-3" stagger={0.06}>
                  {requirements.map((item, i) => (
                    <RevealItem key={i}>
                      <span className="inline-flex items-center gap-2.5 text-sm font-medium transition-all duration-200 hover:translate-x-0.5 hover:text-story-royal">
                        <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-story-royal text-[11px] font-bold text-white">✓</span>
                        {item}
                      </span>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </section>
            )}

            {/* Mentor */}
            <Reveal className="mt-12">
              <div className="flex flex-wrap items-center gap-4 border-t border-border-soft pt-6">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-story-royal text-base font-bold text-white">{initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Your mentor</p>
                  <p className="mt-0.5 text-base font-semibold text-story-navy dark:text-foreground">{internship.mentorName}</p>
                </div>
                <a href={`mailto:${internship.mentorEmail}`} className="group inline-flex items-center gap-2 text-sm font-semibold text-story-royal hover:underline">
                  <AnimatedMail className="h-5 w-5" />
                  <span className="break-all">{internship.mentorEmail}</span>
                </a>
              </div>
            </Reveal>
          </div>

          <aside>
            <div className="lg:sticky lg:top-24">
              <Reveal direction="left" delay={0.1}>
                <InternshipApplyPanel
                  internshipId={internship.id}
                  applyDeadline={internship.applyDeadline.toISOString()}
                  loggedIn={Boolean(user)}
                  applicationStatus={application?.status ?? null}
                />
              </Reveal>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
