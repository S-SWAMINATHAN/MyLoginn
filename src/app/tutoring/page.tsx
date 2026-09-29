import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { TutoringExplorer, type TutorData } from "@/components/tutoring/TutoringExplorer";
import { TutoringHero } from "@/components/tutoring/TutoringHero";
import { JsonLd } from "@/components/seo/JsonLd";

const tutoringFaqs = [
  { question: "What tutoring subjects are available?", answer: "Available subjects and tutor profiles are shown in the listings on this page. Use the subject filters to explore current options." },
  { question: "How do I request a tutoring session?", answer: "Choose a tutor, select the requested grade, board and preferred slot, then submit the booking request. The tutor can follow up to confirm the details." },
  { question: "Do I need an account to book?", answer: "Yes. Sign in or create an account to submit a tutoring booking request." },
  { question: "Can I share a topic I want to study?", answer: "Yes. The booking form includes an optional notes field where you can describe a topic or learning need." },
];

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

        <section aria-labelledby="tutoring-faq" className="mt-16">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: tutoringFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
          <h2 id="tutoring-faq" className="text-2xl font-semibold tracking-tight sm:text-3xl">Tutoring FAQs</h2>
          <div className="mt-5 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface px-5 sm:px-7">
            {tutoringFaqs.map(({ question, answer }) => <details key={question} className="py-5"><summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">{question}</summary><p className="mt-3 max-w-3xl leading-7 text-muted">{answer}</p></details>)}
          </div>
        </section>
      </Container>
    </Section>
  );
}
