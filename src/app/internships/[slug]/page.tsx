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
import { Rich } from "@/components/careers/Rich";
import { splitLines } from "@/lib/postings";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const internship = await prisma.internship.findUnique({
    where: { slug },
    select: { title: true, description: true, slug: true, company: true, status: true },
  });

  if (!internship || internship.status === "draft") return {};

  return createPageMetadata({
    title: internship.title,
    description: internship.description.replace(/\*\*/g, "").slice(0, 300),
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
  if (!internship || internship.status === "draft") notFound();

  const user = await getCurrentUser();
  const application = user
    ? await prisma.internshipApplication.findUnique({
        where: { userId_internshipId: { userId: user.id, internshipId: internship.id } },
      })
    : null;

  const requirements = splitLines(internship.requirements);
  const responsibilities = splitLines(internship.responsibilities);
  const goodToHave = splitLines(internship.goodToHave);
  const benefits = splitLines(internship.benefits);

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

            <InternshipFacts type={internship.type} location={internship.location || internship.type} weeks={internship.durationWeeks} />

            <Reveal direction="up" delay={0.1}>
              <section className="mt-8" aria-labelledby="about">
                <h2 id="about" className="text-lg font-bold text-story-navy dark:text-foreground">About the Role</h2>
                <div className="mt-3 space-y-4 text-base leading-8 text-foreground/90">
                  {internship.description.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-line"><Rich text={p.trim()} /></p>)}
                </div>
              </section>
            </Reveal>

            {responsibilities.length > 0 && (
              <section className="mt-12" aria-labelledby="responsibilities">
                <Reveal><span className="story-eyebrow">The role</span></Reveal>
                <h2 id="responsibilities" className="story-subheading mt-3 text-story-navy dark:text-foreground">Key Responsibilities</h2>
                <ol className="relative mt-6 space-y-3">
                  <span aria-hidden className="absolute bottom-5 left-[17px] top-5 w-px bg-border-soft" />
                  {responsibilities.map((item, i) => (
                    <li key={i}>
                      <Reveal direction="right" delay={i * 0.06}>
                        <div className="group relative flex items-center gap-3.5">
                          <span className="relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-story-royal text-xs font-bold text-white shadow-[0_8px_16px_-8px_rgba(31,86,214,0.9)]">{i + 1}</span>
                          <p className="flex-1 py-2 text-sm font-medium transition-all duration-300 group-hover:translate-x-1 group-hover:text-story-royal"><Rich text={item} /></p>
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
                <CheckList items={requirements} />
              </section>
            )}

            {goodToHave.length > 0 && (
              <section className="mt-12" aria-labelledby="good-to-have">
                <Reveal><span className="story-eyebrow">Bonus points</span></Reveal>
                <h2 id="good-to-have" className="story-subheading mt-3 text-story-navy dark:text-foreground">Good to Have</h2>
                <CheckList items={goodToHave} muted />
              </section>
            )}

            {benefits.length > 0 && (
              <section className="mt-12" aria-labelledby="benefits">
                <Reveal><span className="story-eyebrow">For you</span></Reveal>
                <h2 id="benefits" className="story-subheading mt-3 text-story-navy dark:text-foreground">What You&apos;ll Gain</h2>
                <CheckList items={benefits} />
              </section>
            )}

            {internship.idealCandidate && (
              <Reveal className="mt-12">
                <section aria-labelledby="ideal" className="rounded-3xl bg-story-mist p-6 sm:p-7">
                  <h2 id="ideal" className="text-lg font-bold text-story-navy dark:text-foreground">Who We&apos;re Looking For</h2>
                  <p className="mt-2 text-base leading-8 text-foreground/90"><Rich text={internship.idealCandidate} /></p>
                </section>
              </Reveal>
            )}

            {/* Mentor */}
            {internship.mentorName && (
            <Reveal className="mt-12">
              <div className="flex flex-wrap items-center gap-4 border-t border-border-soft pt-6">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-story-royal text-base font-bold text-white">{initials}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Your mentor</p>
                  <p className="mt-0.5 text-base font-semibold text-story-navy dark:text-foreground">{internship.mentorName}</p>
                </div>
                {internship.mentorEmail && (
                  <a href={`mailto:${internship.mentorEmail}`} className="group inline-flex w-full items-center gap-2 pl-[4.5rem] text-sm font-semibold text-story-royal hover:underline sm:w-auto sm:pl-0">
                    <AnimatedMail className="h-5 w-5" />
                    <span className="break-all">{internship.mentorEmail}</span>
                  </a>
                )}
              </div>
            </Reveal>
            )}
          </div>

          <aside>
            <div className="lg:sticky lg:top-24">
              <Reveal direction="left" delay={0.1}>
                <InternshipApplyPanel
                  internshipId={internship.id}
                  open={internship.status === "open"}
                  applyUrl={internship.applyUrl}
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

function CheckList({ items, muted = false }: { items: string[]; muted?: boolean }) {
  return (
    <RevealGroup className="mt-6 grid gap-3" stagger={0.06}>
      {items.map((item, i) => (
        <RevealItem key={i}>
          <span className="flex items-start gap-2.5 text-sm font-medium leading-6 transition-all duration-200 hover:translate-x-0.5 hover:text-story-royal">
            <span aria-hidden className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${muted ? "bg-story-royal/15 text-story-royal" : "bg-story-royal text-white"}`}>✓</span>
            <span><Rich text={item} /></span>
          </span>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
