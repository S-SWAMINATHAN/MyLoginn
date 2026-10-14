import { createPageMetadata } from "@/lib/seo";
import { localKeywords } from "@/lib/localSeo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { CoursesExplorer } from "@/components/courses/CoursesExplorer";
import type { CourseCardData } from "@/components/courses/CourseCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal } from "@/components/ui/Reveal";
import { PillTicker } from "@/components/ui/PillTicker";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { CoursesHeroVisual } from "@/components/pages/PageHeroVisuals";
import Link from "next/link";

const courseFaqs = [
  { question: "Which courses are available?", answer: "The course listings on this page show the current topics and levels. Open a course to review its description and outline." },
  { question: "Where can I find course duration and fees?", answer: "Duration and current pricing appear on each course card and course detail page." },
  { question: "How do I enrol in a course?", answer: "Open the course you are interested in, review its details and follow the enrolment steps on that page. Signing in may be required to complete enrolment." },
  { question: "How do I ask about a course before enrolling?", answer: "Use the Contact page to send a course enquiry and include the course name and your question." },
];

export const metadata = createPageMetadata({
  title: "Courses",
  description: "Explore mentor-led artificial intelligence, data, full-stack and digital marketing courses for learners across India, including Tamil Nadu.",
  path: "/courses",
  keywords: [
    ...localKeywords(["AI course", "technology courses", "full stack course", "Python course"]),
    "MyLoginn courses", "AI courses", "Generative AI courses", "Agentic AI courses",
    "Data Analytics courses", "Full-Stack Development courses", "Testing with AI",
    "Automation Testing courses", "Python courses", "Cloud Engineering courses",
    "Data Science courses", "Prompt Engineering courses", "digital marketing courses",
    "online technology learning",
  ],
});

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const [user, courses] = await Promise.all([
    getCurrentUser(),
    prisma.course.findMany({ where: { status: "published" }, orderBy: { createdAt: "desc" } }),
  ]);

  const enrollments = user
    ? await prisma.enrollment.findMany({ where: { userId: user.id } })
    : [];
  const enrolledIds = enrollments.map((e) => e.courseId);
  const progressByCourse = new Map(enrollments.map((enrollment) => [enrollment.courseId, enrollment.progress]));

  const cards: CourseCardData[] = courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    category: c.category,
    level: c.level,
    description: c.description,
    instructor: c.instructor,
    instructorTitle: c.instructorTitle,
    durationWeeks: c.durationWeeks,
    price: c.price,
    originalPrice: c.originalPrice,
    imageColor: c.imageColor,
    tags: JSON.parse(c.tags) as string[],
    progress: progressByCourse.get(c.id) ?? 0,
  }));

  const recommendedIds = user
    ? courses
        .filter((c) => c.featured && !enrolledIds.includes(c.id))
        .slice(0, 3)
        .map((c) => c.id)
    : [];

  return (
    <Section className="overflow-hidden pt-6 sm:pt-10">
      <Container className="max-w-[1480px]">
        <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <Reveal><span className="story-eyebrow">Upgrade your skills</span></Reveal>
            <SplitHeadline as="h1" text="Master skills for your future" className="mt-4 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
            <Reveal direction="up" delay={0.15}>
              <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">Explore current course topics, levels, duration, fees, and enrolment details in the listings below.</p>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted">MyLoginn offers mentor-led AI and technology learning for learners everywhere. Browse current courses and contact us if you have any questions.</p>
            </Reveal>
            <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ArrowLink href="#courses-list">Browse courses</ArrowLink>
              <Link href="/contact" className="rounded-full border border-border-soft bg-surface px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:text-story-royal active:scale-95">Ask about courses</Link>
            </Reveal>
            <Reveal direction="up" delay={0.35} className="mt-8"><PillTicker items={["Explore all", "Top rated", "Expert-led", "Fast enquiry"]} /></Reveal>
          </div>
          <Reveal direction="left" delay={0.15} className="min-w-0"><CoursesHeroVisual /></Reveal>
        </div>
        <div id="courses-list" className="mt-14 scroll-mt-24 rounded-3xl border border-border-soft bg-surface/70 p-4 sm:p-6">
          <CoursesExplorer courses={cards} enrolledIds={enrolledIds} recommendedIds={recommendedIds} isLoggedIn={!!user} />
        </div>
        <section aria-labelledby="courses-faq" className="mt-16">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: courseFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
          <span className="story-eyebrow">FAQ</span>
          <h2 id="courses-faq" className="story-subheading mt-3 text-story-navy dark:text-foreground">Course FAQs</h2>
          <FaqAccordion items={courseFaqs} className="mt-8" />
        </section>
      </Container>
    </Section>
  );
}
