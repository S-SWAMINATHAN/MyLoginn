import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { TutoringExplorer, type TutorData } from "@/components/tutoring/TutoringExplorer";
import { TutoringHero } from "@/components/tutoring/TutoringHero";

export const metadata = createPageMetadata({
  title: "Online Tutoring & Mentor Support",
  description: "Book personalized online tutoring and mentor sessions in programming, data science, mathematics, and more with MyLoginn.",
  path: "/tutoring",
  keywords: [
    "MyLoginn tutoring", "online tutoring", "programming tutor",
    "data science tutor", "one-to-one tutoring", "personalized tutoring",
  ],
});

export const dynamic = "force-dynamic";

export default async function TutoringPage() {
  const [user, tutors] = await Promise.all([
    getCurrentUser(),
    prisma.tutor.findMany({ orderBy: { name: "asc" } }),
  ]);

  const tutorCards: TutorData[] = tutors.map((t) => ({
    id: t.id,
    name: t.name,
    subject: t.subject,
    bio: t.bio,
    qualification: t.qualification,
    experienceYears: t.experienceYears,
    rating: t.rating,
    avatarColor: t.avatarColor,
    boards: JSON.parse(t.boards) as string[],
  }));

  return (
    <Section className="mobile-page-glow pt-3 sm:pt-5">
      <Container className="max-w-[1480px]">
        <TutoringHero />

        <div className="mt-8">
          <TutoringExplorer tutors={tutorCards} isLoggedIn={!!user} />
        </div>
      </Container>
    </Section>
  );
}
