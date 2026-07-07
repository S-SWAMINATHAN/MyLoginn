import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { InternshipsHero } from "@/components/internships/InternshipsHero";
import { InternshipsExplorer } from "@/components/internships/InternshipsExplorer";
import type { InternshipCardData } from "@/components/internships/InternshipCard";

export const metadata = { title: "Internships — MyLoginn" };

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
    <Section className="pt-14 sm:pt-16">
      <Container>
        <InternshipsHero
          total={cards.length}
          paidCount={paidCount}
          companyCount={companyCount}
          avgWeeks={avgWeeks}
        />

        <div className="mt-14 sm:mt-16">
          <InternshipsExplorer internships={cards} appliedIds={[...appliedIds]} />
        </div>
      </Container>
    </Section>
  );
}
