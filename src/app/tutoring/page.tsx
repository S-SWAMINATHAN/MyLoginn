<<<<<<< HEAD
import type { Metadata } from "next";
=======
>>>>>>> 9a00051 (Initial commit)
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { TutoringExplorer, type TutorData } from "@/components/tutoring/TutoringExplorer";
import { TutoringHero } from "@/components/tutoring/TutoringHero";

<<<<<<< HEAD
export const metadata: Metadata = {
  title: "1:1 Tutoring — MyLoginn",
  description: "Book personalized tutoring with experienced mentors in mathematics, physics, English, and computer science.",
  alternates: { canonical: "/tutoring" },
};

export const dynamic = "force-dynamic";
=======
export const metadata = { title: "Tutoring — MyLoginn" };
>>>>>>> 9a00051 (Initial commit)

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
