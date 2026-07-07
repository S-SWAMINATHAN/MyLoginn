import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { CoursesExplorer } from "@/components/courses/CoursesExplorer";
import type { CourseCardData } from "@/components/courses/CourseCard";

export const metadata = { title: "Courses — MyLoginn" };

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
    <Section className="pt-14">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Eyebrow>Learning Paths</Eyebrow>
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Advanced Digital Marketing &amp; AI/ML Courses
          </h1>
          <p className="mt-4 text-muted">
            Live sessions, personalized AI recommendations, mentor support and
            placement guidance — built for professionals and graduates.
          </p>
        </div>

        <div className="mt-14">
          <CoursesExplorer
            courses={cards}
            enrolledIds={enrolledIds}
            recommendedIds={recommendedIds}
            trendingIds={trendingIds}
            isLoggedIn={!!user}
          />
        </div>
      </Container>
    </Section>
  );
}
