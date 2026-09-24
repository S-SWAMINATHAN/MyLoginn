import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { TutoringHero } from "@/components/tutoring/TutoringHero";
import { TutoringExplorer, type TutorData } from "@/components/tutoring/TutoringExplorer";

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
    <Section className="pt-14">
      <Container>
        <TutoringHero />

        <div className="mt-14">
          <TutoringExplorer tutors={tutorCards} isLoggedIn={!!user} />
        </div>
      </Container>
    </Section>
  );
}
