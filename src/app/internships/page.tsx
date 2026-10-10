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
import { FaqAccordion } from "@/components/ui/FaqAccordion";

const internshipFaqs = [
  { question: "How do I apply for an internship?", answer: "Open an internship listing to review its requirements, responsibilities and deadline, then follow the application steps on that page." },
  { question: "What information is available before I apply?", answer: "Each listing provides the role title, type, location, duration, deadline and program details available for that opportunity." },
  { question: "Are internship roles paid?", answer: "Payment details are shown on each listing. Check the specific opportunity for its paid status and any stipend information." },
  { question: "Does an internship guarantee a job or placement?", answer: "No. An internship is a learning and work experience opportunity and does not guarantee employment or placement." },
];

export const metadata = createPageMetadata({
  title: "Technology Internships across Tamil Nadu",
  description: "Explore practical MyLoginn technology internships with real projects and mentor guidance for students in Coimbatore, Pollachi, Udumalpet and Tamil Nadu.",
  path: "/internships",
  keywords: [
    "MyLoginn internships", "AI internships", "software development internships",
    "technology internships", "internship programs", "internships with mentorship",
    "technology internship Coimbatore", "technology internship Pollachi",
    "technology internship Udumalpet", "internships in Tamil Nadu",
    "AI internship Tamil Nadu", "software internship Coimbatore",
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

        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted">Students in Coimbatore, Pollachi, Udumalpet, Erode, and across Tamil Nadu can explore current technology internship listings. Check each role for its location, format, eligibility, and application details.</p>

        <div className="mt-8 sm:mt-10">
          <InternshipsExplorer internships={cards} appliedIds={[...appliedIds]} />
        </div>

        <InternshipsFeatureStrip />
        <InternshipsHowItWorks />
        <InternshipsCta />
        <section aria-labelledby="internship-faq" className="mt-16">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: internshipFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
          <h2 id="internship-faq" className="text-2xl font-semibold tracking-tight sm:text-3xl">Internship FAQs</h2>
          <FaqAccordion items={internshipFaqs} className="mt-5" />
        </section>
      </Container>
    </Section>
  );
}
