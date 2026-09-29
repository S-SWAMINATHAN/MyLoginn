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
      </Container>
    </Section>
  );
}
