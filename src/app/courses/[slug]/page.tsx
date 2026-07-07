import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Percent, ListChecks } from "lucide-react";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { AnimatedStar } from "@/components/ui/icons/AnimatedStar";
import { AnimatedUsers } from "@/components/ui/icons/AnimatedUsers";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) notFound();

  const user = await getCurrentUser();
  const enrollment = user
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: course.id } },
      })
    : null;

  const tags = JSON.parse(course.tags) as string[];
  const syllabus = JSON.parse(course.syllabus) as string[];
  const discountPct =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round((1 - course.price / course.originalPrice) * 100)
      : null;

  return (
    <Section className="pt-14">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <CourseIconThumb category={course.category} title={course.title} variant="round" className="h-16 w-16 shrink-0" />
              <div>
                <Eyebrow>{course.category}</Eyebrow>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{course.title}</h1>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted">
              {course.instructor}
              {course.instructorTitle ? ` · ${course.instructorTitle}` : ""}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <AnimatedStar className="h-5 w-5" /> {course.rating.toFixed(1)} rating
              </span>
              <span className="flex items-center gap-1.5">
                <AnimatedUsers className="h-5 w-5" /> {course.studentsCount.toLocaleString()} students
              </span>
              <span className="group flex items-center gap-1.5">
                <AnimatedClock className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> {course.durationWeeks} weeks
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium">
                  {t}
                </span>
              ))}
            </div>

            <p className="mt-8 leading-relaxed text-foreground/90">
              {course.longDescription ?? course.description}
            </p>

            <div className="mt-8">
              <h2 className="flex items-center gap-2 font-semibold">
                <ListChecks className="h-5.5 w-5.5 text-brand-500 transition-transform duration-300 hover:scale-110" /> Syllabus
              </h2>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                {syllabus.map((item, i) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[11px] font-semibold text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <div className="lg:sticky lg:top-24">
              <Card className="p-6">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold">₹{course.price.toLocaleString()}</span>
                  {course.originalPrice && (
                    <span className="text-sm text-muted line-through">₹{course.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                {discountPct && (
                  <span className="mt-1.5 inline-flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                    <Percent className="h-4 w-4" /> {discountPct}% off, limited time
                  </span>
                )}

                <div className="mt-5">
                  {!user ? (
                    <Button href="/login" className="w-full" size="lg">
                      Log in to enroll
                    </Button>
                  ) : enrollment ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <AnimatedSuccess className="h-10.5 w-10.5" />
                      <p className="text-sm font-medium">You&apos;re enrolled</p>
                      <Button href="/dashboard" variant="secondary" className="w-full">
                        Go to dashboard
                      </Button>
                    </div>
                  ) : (
                    <Button href={`/courses/${course.slug}/checkout`} className="w-full" size="lg">
                      Enroll now — pay ₹{course.price.toLocaleString()}
                    </Button>
                  )}
                </div>

                <p className="mt-4 text-center text-xs text-muted">Lifetime access · Certificate on completion</p>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
