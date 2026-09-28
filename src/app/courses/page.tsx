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

export const metadata = createPageMetadata({
  title: "AI, Technology & Full-Stack Courses",
  description: "Build job-ready skills in artificial intelligence, data, full-stack development, and digital marketing with mentor-led MyLoginn courses.",
  path: "/courses",
  keywords: ["AI courses", "full-stack development courses", "digital marketing courses", "online technology learning"],
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
    rating: c.rating,
    studentsCount: c.studentsCount,
    imageColor: c.imageColor,
    tags: JSON.parse(c.tags) as string[],
  }));

  const recommendedIds = user
    ? courses
        .filter((c) => c.featured && !enrolledIds.includes(c.id))
        .slice(0, 3)
        .map((c) => c.id)
    : [];

  const trendingIds = [...courses]
    .sort((a, b) => b.studentsCount - a.studentsCount)
    .slice(0, 3)
    .map((c) => c.id);

  return (
    <Section className="mobile-page-glow overflow-hidden pt-3 sm:pt-5">
      <Container className="max-w-[1480px]">
        <div className="relative grid min-h-[340px] items-center gap-5 rounded-[2rem] bg-[radial-gradient(ellipse_at_75%_45%,rgba(117,177,255,.25),transparent_45%),radial-gradient(ellipse_at_58%_65%,rgba(221,174,255,.2),transparent_42%)] py-8 md:grid-cols-[1.1fr_.9fr] md:py-5">
          <div className="relative z-10 max-w-2xl">
            <Eyebrow><GraduationCap className="h-4 w-4" /> Upgrade your skills</Eyebrow>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">Master skills for <span className="brand-gradient-text">your future</span></h1>
            <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">Industry-led courses with hands-on projects, expert instruction, certifications, and career support.</p>
            <div className="mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[{ icon: "course-total", value: "50+", label: "Total Courses" }, { icon: "course-certified", value: "20+", label: "Certified Programs" }, { icon: "course-mentors", value: "15+", label: "Mentor Instructors" }, { icon: "course-hours", value: "1000+ hrs", label: "Self-Paced Learning" }].map(({ icon, value, label }) => <div key={label} className="flex min-h-24 flex-col justify-between rounded-2xl border border-border-soft bg-surface/85 p-4 shadow-[var(--shadow-soft)]"><ReferenceStatIcon name={icon as "course-total" | "course-certified" | "course-mentors" | "course-hours"} className="h-8 w-8" /><div><div className="text-2xl font-bold">{value}</div><div className="mt-1 text-xs text-muted">{label}</div></div></div>)}
            </div>
          </div>
          <div className="relative mx-auto h-64 w-full max-w-lg md:h-[390px]">
            <Image src={courseHeader} alt="Online learning, courses and certification" fill priority className="scale-110 object-contain" sizes="(max-width: 768px) 100vw, 45vw" />
          </div>
        </div>
        <div className="mt-5 rounded-3xl border border-border-soft bg-surface/70 p-4 sm:p-6">
          <CoursesExplorer courses={cards} enrolledIds={enrolledIds} recommendedIds={recommendedIds} trendingIds={trendingIds} isLoggedIn={!!user} />
        </div>
      </Container>
    </Section>
  );
}
