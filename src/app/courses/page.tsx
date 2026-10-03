import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { CoursesExplorer } from "@/components/courses/CoursesExplorer";
import type { CourseCardData } from "@/components/courses/CourseCard";
import Image from "next/image";
import courseHeader from "@/images/Course header.png";
import { ReferenceStatIcon } from "@/components/ui/ReferenceStatIcon";
import { GraduationCap } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const courseFaqs = [
  { question: "Which courses are available?", answer: "The course listings on this page show the current topics and levels. Open a course to review its description and outline." },
  { question: "Where can I find course duration and fees?", answer: "Duration and current pricing appear on each course card and course detail page." },
  { question: "How do I enrol in a course?", answer: "Open the course you are interested in, review its details and follow the enrolment steps on that page. Signing in may be required to complete enrolment." },
  { question: "How do I ask about a course before enrolling?", answer: "Use the Contact page to send a course enquiry and include the course name and your question." },
];

export const metadata = createPageMetadata({
  title: "AI, Technology & Full-Stack Courses",
  description: "Build job-ready skills in artificial intelligence, data, full-stack development, and digital marketing with mentor-led MyLoginn courses.",
  path: "/courses",
  keywords: [
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
    prisma.course.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const enrollments = user
    ? await prisma.enrollment.findMany({ where: { userId: user.id } })
    : [];
  const enrolledIds = enrollments.map((e) => e.courseId);

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
  }));

  const recommendedIds = user
    ? courses
        .filter((c) => c.featured && !enrolledIds.includes(c.id))
        .slice(0, 3)
        .map((c) => c.id)
    : [];

  return (
    <Section className="mobile-page-glow overflow-hidden pt-3 sm:pt-5">
      <Container className="max-w-[1480px]">
        <div className="relative block min-h-0 items-center gap-5 rounded-[2rem] bg-[radial-gradient(ellipse_at_75%_45%,rgba(117,177,255,.25),transparent_45%),radial-gradient(ellipse_at_58%_65%,rgba(221,174,255,.2),transparent_42%)] py-3 md:min-h-[340px] md:grid md:grid-cols-[1.1fr_.9fr] md:py-5">
          <div className="relative float-right ml-3 mb-2 block h-24 w-32 max-w-none max-md:mb-0 max-md:h-auto max-md:aspect-[4/3] max-md:w-[clamp(8rem,40vw,9.5rem)] md:order-2 md:float-none md:ml-auto md:mb-0 md:h-[390px] md:w-full md:max-w-lg">
            <Image src={courseHeader} alt="Illustration for online technology courses" fill preload className="object-contain object-right md:scale-110 md:object-center" sizes="(max-width: 767px) 152px, 45vw" />
          </div>
          <div className="relative z-10 max-w-2xl md:order-1">
            <Eyebrow className="max-md:gap-1 max-md:px-1 max-md:text-[9px] max-md:tracking-normal"><GraduationCap className="h-4 w-4" /> Upgrade your skills</Eyebrow>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight max-md:mt-1 max-md:text-[1.625rem] sm:text-5xl">Master skills for <span className="brand-gradient-text">your future</span></h1>
            <p className="mt-4 max-w-xl text-base text-muted max-md:mt-2 max-md:text-sm sm:text-lg">Explore current course topics, levels, duration, fees, and enrolment details in the listings below.</p>
            <div className="mt-7 clear-both grid max-w-2xl grid-cols-2 gap-3 max-md:mt-3 sm:grid-cols-4">
              {[
                { icon: "course-total", value: "Available", label: "Course listings" },
                { icon: "course-certified", value: "Clear", label: "Program details" },
                { icon: "course-mentors", value: "By course", label: "Instructor information" },
                { icon: "course-hours", value: "Direct", label: "Enquiry options" },
              ].map(({ icon, value, label }) => (
                <div
                  key={label}
                  className="flex min-h-32 flex-col justify-between rounded-2xl border border-border-soft bg-surface/85 p-3 shadow-[var(--shadow-soft)] sm:min-h-28 sm:p-4"
                >
                  <ReferenceStatIcon
                    name={icon as "course-total" | "course-certified" | "course-mentors" | "course-hours"}
                    className="h-11 w-11 shrink-0 sm:h-8 sm:w-8"
                  />
                  <div className="mt-3 sm:mt-4">
                    <div className="min-h-12 break-words text-xl font-semibold leading-6 sm:text-lg md:text-xl">{value}</div>
                    <div className="mt-1 min-h-8 text-sm leading-5 text-muted sm:text-xs sm:leading-4">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 rounded-3xl border border-border-soft bg-surface/70 p-4 sm:p-6">
          <CoursesExplorer courses={cards} enrolledIds={enrolledIds} recommendedIds={recommendedIds} isLoggedIn={!!user} />
        </div>
        <section aria-labelledby="courses-faq" className="mt-16">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: courseFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
          <h2 id="courses-faq" className="text-2xl font-semibold tracking-tight sm:text-3xl">Course FAQs</h2>
          <div className="mt-5 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface px-5 sm:px-7">
            {courseFaqs.map(({ question, answer }) => <details key={question} className="py-5"><summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">{question}</summary><p className="mt-3 max-w-3xl leading-7 text-muted">{answer}</p></details>)}
          </div>
        </section>
      </Container>
    </Section>
  );
}
