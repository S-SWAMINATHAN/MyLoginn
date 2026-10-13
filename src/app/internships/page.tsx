import { createPageMetadata } from "@/lib/seo";
import { localKeywords } from "@/lib/localSeo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { InternshipsExplorer } from "@/components/internships/InternshipsExplorer";
import type { InternshipCardData } from "@/components/internships/InternshipCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { InternshipsHeroVisual } from "@/components/internships/InternshipsHeroVisual";
import Link from "next/link";

const listingFeatures = [
  { icon: "webdev", title: "Role details", desc: "Review the responsibilities listed for each opening", color: "#2563eb" },
  { icon: "student", title: "Requirements", desc: "Check the qualifications and expectations for the role", color: "#7c3aed" },
  { icon: "business", title: "Program format", desc: "Review the type and duration shown on each listing", color: "#059669" },
  { icon: "comm", title: "Application", desc: "Use the program page to see how to apply", color: "#d97706" },
  { icon: "career", title: "Current openings", desc: "Explore available opportunities and their deadlines", color: "#e11d48" },
];

const applySteps = [
  { title: "Apply", desc: "Browse internships and submit your application", icon: "comm" },
  { title: "Application review", desc: "The team reviews applications and contacts candidates about next steps", icon: "leader" },
  { title: "Program details", desc: "Follow the information provided for the selected opportunity", icon: "career" },
];

const internshipFaqs = [
  { question: "How do I apply for an internship?", answer: "Open an internship listing to review its requirements, responsibilities and deadline, then follow the application steps on that page." },
  { question: "What information is available before I apply?", answer: "Each listing provides the role title, type, location, duration, deadline and program details available for that opportunity." },
  { question: "Are internship roles paid?", answer: "Payment details are shown on each listing. Check the specific opportunity for its paid status and any stipend information." },
  { question: "Does an internship guarantee a job or placement?", answer: "No. An internship is a learning and work experience opportunity and does not guarantee employment or placement." },
];

export const metadata = createPageMetadata({
  title: "Technology Internships in India with Real Projects",
  description: "Explore practical MyLoginn technology internships with real projects and mentor guidance for students across India, including Tamil Nadu.",
  path: "/internships",
  keywords: [
    ...localKeywords(["technology internship", "software internship", "AI internship"]),
    "MyLoginn internships", "AI internships", "software development internships",
    "technology internships", "internship programs", "internships with mentorship",
  ],
});

export const dynamic = "force-dynamic";

export default async function InternshipsPage() {
  const [user, internships] = await Promise.all([
    getCurrentUser(),
    prisma.internship.findMany({ orderBy: { applyDeadline: "asc" } }),
  ]);

  const applications = user
    ? await prisma.internshipApplication.findMany({ where: { userId: user.id } })
    : [];
  const appliedIds = new Set(applications.map((a) => a.internshipId));

  const cards: InternshipCardData[] = internships.map((i) => ({
    id: i.id,
    title: i.title,
    slug: i.slug,
    company: i.company,
    type: i.type,
    paid: i.paid,
    stipend: i.stipend,
    location: i.location,
    durationWeeks: i.durationWeeks,
    applyDeadline: i.applyDeadline.toISOString(),
    featured: i.featured,
  }));

  const paidCount = cards.filter((c) => c.paid).length;
  const companyCount = new Set(cards.map((c) => c.company)).size;
  const avgWeeks = cards.length
    ? Math.round(cards.reduce((sum, c) => sum + c.durationWeeks, 0) / cards.length)
    : 0;

  return (
    <Section className="overflow-hidden pt-6 sm:pt-10">
      <Container className="max-w-[1480px]">
        {/* Hero */}
        <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <Reveal><span className="story-eyebrow">Launch your career</span></Reveal>
            <SplitHeadline as="h1" text="Explore current internship opportunities" className="mt-4 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
            <Reveal direction="up" delay={0.15}>
              <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">Review the current openings, program requirements, responsibilities and application details below.</p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted">Students can explore current technology internship listings. Check each role for its location, format, eligibility, and application details.</p>
            </Reveal>
            <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowLink href="#all-internships">Browse internships</ArrowLink>
              <Link href="#how-it-works" className="rounded-full border border-border-soft bg-surface px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:text-story-royal active:scale-95">How it works</Link>
            </Reveal>
          </div>
          <Reveal direction="left" delay={0.15} className="min-w-0">
            <InternshipsHeroVisual total={cards.length} paidCount={paidCount} companyCount={companyCount} avgWeeks={avgWeeks} />
          </Reveal>
        </div>

        {/* Listings (cards unchanged) */}
        <div className="mt-16 sm:mt-20">
          <InternshipsExplorer internships={cards} appliedIds={[...appliedIds]} />
        </div>

        {/* What every listing includes */}
        <section aria-labelledby="listing-includes" className="mt-24 sm:mt-28">
          <Reveal><span className="story-eyebrow">Before you apply</span></Reveal>
          <h2 id="listing-includes" className="story-subheading mt-3 text-story-navy dark:text-foreground">What every listing shows</h2>
          <RevealGroup className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5" stagger={0.07}>
            {listingFeatures.map((f, i) => (
              <RevealItem key={f.title} className="h-full">
                <div className="group relative flex h-full flex-col rounded-3xl border border-border-soft bg-surface p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--c)] hover:shadow-[0_18px_36px_-22px_var(--c)]" style={{ "--c": f.color } as React.CSSProperties}>
                  <IconBadge size="sm" delay={i * 0.05} className="!h-12 !w-12"><ContentIcon keyword={f.icon} className="h-10 w-10" /></IconBadge>
                  <p className="mt-3 text-sm font-semibold text-story-navy dark:text-foreground">{f.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">{f.desc}</p>
                  <span aria-hidden className="absolute bottom-0 left-4 right-4 h-0.5 origin-left scale-x-0 rounded-full bg-[var(--c)] transition-transform duration-500 group-hover:scale-x-100" />
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* How it works */}
        <section id="how-it-works" aria-labelledby="how-it-works-title" className="mt-24 scroll-mt-24 sm:mt-28">
          <Reveal><span className="story-eyebrow">Simple process</span></Reveal>
          <h2 id="how-it-works-title" className="story-subheading mt-3 text-story-navy dark:text-foreground">How it works</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base">A simple overview of the application flow.</p>
          <ol className="relative mt-10 grid gap-5 md:grid-cols-3">
            <span aria-hidden className="absolute left-[16%] right-[16%] top-7 hidden h-0.5 rounded-full bg-border-soft md:block" />
            {applySteps.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 0.12} className="h-full">
                  <div className="group relative flex h-full flex-col items-center rounded-3xl border border-border-soft bg-surface p-5 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-story-royal/50 hover:shadow-[var(--shadow-soft)]">
                    <span className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-story-royal text-sm font-bold text-white shadow-[0_10px_20px_-10px_rgba(31,86,214,0.9)]">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-4 text-base font-semibold text-story-navy dark:text-foreground">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-muted">{step.desc}</p>
                    <ContentIcon keyword={step.icon} className="mt-4 h-10 w-10 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <Reveal className="mt-24 sm:mt-28">
          <div className="flex flex-col items-center gap-6 rounded-[2rem] border border-border-soft bg-story-mist px-6 py-9 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-left">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-surface shadow-sm"><ContentIcon keyword="career" className="h-10 w-10" /></span>
              <div>
                <h2 className="text-xl font-bold text-story-navy sm:text-2xl dark:text-foreground">Ready to start your journey?</h2>
                <p className="mt-1.5 max-w-md text-sm text-muted">Review current roles and apply for opportunities that fit your interests.</p>
              </div>
            </div>
            <ArrowLink href="#all-internships">Browse internships</ArrowLink>
          </div>
        </Reveal>

        {/* FAQ */}
        <section aria-labelledby="internship-faq" className="mt-24 sm:mt-28">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: internshipFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
          <Reveal><span className="story-eyebrow">FAQ</span></Reveal>
          <h2 id="internship-faq" className="story-subheading mt-3 text-story-navy dark:text-foreground">Internship FAQs</h2>
          <FaqAccordion items={internshipFaqs} className="mt-8" />
        </section>
      </Container>
    </Section>
  );
}
