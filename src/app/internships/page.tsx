import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { InternshipsHero } from "@/components/internships/InternshipsHero";
import { InternshipsExplorer } from "@/components/internships/InternshipsExplorer";
import { InternshipsFeatureStrip } from "@/components/internships/InternshipsFeatureStrip";
import { InternshipsHowItWorks } from "@/components/internships/InternshipsHowItWorks";
import { InternshipsCta } from "@/components/internships/InternshipsCta";
import type { InternshipCardData } from "@/components/internships/InternshipCard";
import { JsonLd } from "@/components/seo/JsonLd";

const internshipFaqs = [
  { question: "How do I apply for an internship?", answer: "Open an internship listing to review its requirements, responsibilities and deadline, then follow the application steps on that page." },
  { question: "What information is available before I apply?", answer: "Each listing provides the role title, type, location, duration, deadline and program details available for that opportunity." },
  { question: "Are internship roles paid?", answer: "Payment details are shown on each listing. Check the specific opportunity for its paid status and any stipend information." },
  { question: "Does an internship guarantee a job or placement?", answer: "No. An internship is a learning and work experience opportunity and does not guarantee employment or placement." },
];

export const metadata = createPageMetadata({
  title: "Technology Internships",
  description: "Explore practical technology internships with real projects, mentor guidance, and career-building experience from MyLoginn.",
  path: "/internships",
  keywords: [
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
    <Section className="mobile-page-glow pt-3 sm:pt-5">
      <Container className="max-w-[1480px]">
        <InternshipsHero
          total={cards.length}
          paidCount={paidCount}
          companyCount={companyCount}
          avgWeeks={avgWeeks}
        />

        <div className="mt-8 sm:mt-10">
          <InternshipsExplorer internships={cards} appliedIds={[...appliedIds]} />
        </div>

        <InternshipsFeatureStrip />
        <InternshipsHowItWorks />
        <InternshipsCta />
        <section aria-labelledby="internship-faq" className="mt-16">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: internshipFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
          <h2 id="internship-faq" className="text-2xl font-semibold tracking-tight sm:text-3xl">Internship FAQs</h2>
          <div className="mt-5 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface px-5 sm:px-7">
            {internshipFaqs.map(({ question, answer }) => <details key={question} className="py-5"><summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">{question}</summary><p className="mt-3 max-w-3xl leading-7 text-muted">{answer}</p></details>)}
          </div>
        </section>
      </Container>
    </Section>
  );
}
