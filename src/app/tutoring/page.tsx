import { notFound } from "next/navigation";
import { HIDE_TUTORING } from "@/lib/hiddenSections";
import { createPageMetadata } from "@/lib/seo";
import { localKeywords } from "@/lib/localSeo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { TutoringExplorer, type TutorData } from "@/components/tutoring/TutoringExplorer";
import { TutoringHero } from "@/components/tutoring/TutoringHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

const tutoringFaqs = [
  { question: "What tutoring subjects are available?", answer: "Available subjects and tutor profiles are shown in the listings on this page. Use the subject filters to explore current options." },
  { question: "How do I request a tutoring session?", answer: "Choose a tutor, select the requested grade, board and preferred slot, then submit the booking request. The tutor can follow up to confirm the details." },
  { question: "Do I need an account to book?", answer: "Yes. Sign in or create an account to submit a tutoring booking request." },
  { question: "Can I share a topic I want to study?", answer: "Yes. The booking form includes an optional notes field where you can describe a topic or learning need." },
];

export const metadata = createPageMetadata({
  // tutoring is switched off (HIDE_TUTORING): the page returns 404 and stays out of search
  title: "Tutoring",
  description: "Tutoring is not currently offered by MyLoginn.",
  path: "/tutoring",
  noIndex: true,
  keywords: [
    ...localKeywords(["online tutor", "programming coaching", "maths tutor"]),
    "MyLoginn tutoring", "online tutoring", "programming tutor",
    "data science tutor",
  ],
});

export const dynamic = "force-dynamic";

export default async function TutoringPage() {
  if (HIDE_TUTORING) notFound();
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
    avatarColor: t.avatarColor,
    boards: JSON.parse(t.boards) as string[],
  }));

  return (
    <Section className="mobile-page-glow pt-0 sm:pt-5">
      <Container className="max-w-[1480px]">
        <TutoringHero />

        <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">Learners can explore online tutoring and mentor support. Available subjects, tutor profiles, and booking details appear in the current listings.</p>

        <div className="mt-4 sm:mt-8">
          <TutoringExplorer tutors={tutorCards} isLoggedIn={!!user} />
        </div>

        <section aria-labelledby="tutoring-faq" className="mt-16">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: tutoringFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
          <h2 id="tutoring-faq" className="text-2xl font-semibold tracking-tight sm:text-3xl">Tutoring FAQs</h2>
          <FaqAccordion items={tutoringFaqs} className="mt-5" />
        </section>
      </Container>
    </Section>
  );
}
