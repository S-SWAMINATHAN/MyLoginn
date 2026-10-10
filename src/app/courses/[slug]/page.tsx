import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Percent, ListChecks } from "lucide-react";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { FreeEnrollButton } from "@/components/courses/FreeEnrollButton";
import { DownloadCertificate } from "@/components/courses/DownloadCertificate";
import { getCourseModules } from "@/lib/freeCourseCurriculum";
import { getCourseDisplayTitle, getFreeCourseTerm } from "@/lib/freeCourseTitles";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { title: true, description: true, slug: true, category: true, level: true },
  });

  if (!course) return {};

  const displayTitle = getCourseDisplayTitle(course.slug, course.title);

  return createPageMetadata({
    title: displayTitle,
    description: course.description,
    path: `/courses/${course.slug}`,
    keywords: [
      displayTitle,
      `${course.category} course`,
      `${course.level} ${course.category} course`,
      "online course",
    ],
  });
}

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
  const displayTitle = getCourseDisplayTitle(course.slug, course.title);
  const courseTerm = getFreeCourseTerm(course.slug);
  const displayTags = tags.map((tag) => tag.toLowerCase() === "fundamentals" && courseTerm ? courseTerm : tag);
  const syllabus = JSON.parse(course.syllabus) as string[];
  const modules = course.price === 0 ? getCourseModules(course.slug, syllabus) : [{ title: "Course syllabus", topics: syllabus }];
  const topicCount = modules.reduce((count, module) => count + module.topics.length, 0);
  const completedTopics = enrollment && course.price === 0
    ? await prisma.courseTopicProgress.findMany({ where: { userId: user!.id, courseId: course.id, challengePassed: true }, select: { topicSlug: true } })
    : [];
  const activeTopicSlugs = new Set(modules.flatMap((module) => module.topics).map((topic) => topic.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")));
  const completedTopicSlugs = new Set(completedTopics.map((item) => item.topicSlug).filter((topicSlug) => activeTopicSlugs.has(topicSlug)));
  const discountPct =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round((1 - course.price / course.originalPrice) * 100)
      : null;

  return (
    <Section className="mobile-page-glow pt-14">
      <Container>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <CourseIconThumb category={course.category} title={displayTitle} variant="round" className="h-16 w-16 shrink-0" />
              <div>
                <Eyebrow>{course.category}</Eyebrow>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{displayTitle}</h1>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted">
              {course.instructor}
              {course.instructorTitle ? ` Â· ${course.instructorTitle}` : ""}
            </p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted">
              <span className="group flex items-center gap-1.5">
                <AnimatedClock className="h-5 w-5 transition-transform duration-300 group-hover:scale-125" /> {course.durationWeeks} weeks
              </span>
              {course.price === 0 && <span>{modules.length} modules · {topicCount} subtopics</span>}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {displayTags.map((t) => (
                <span key={t} className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium">
                  {t}
                </span>
              ))}
            </div>

            <p className="mt-8 leading-relaxed text-foreground/90">
              {course.longDescription ?? course.description}
            </p>

            {course.price === 0 && <section className="mt-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-5 dark:bg-brand-900/10 sm:p-6" aria-labelledby="course-overview">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">Your learning path</p>
              <h2 id="course-overview" className="mt-2 text-xl font-bold">{displayTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Build your understanding one focused lesson at a time, from core ideas to practical programming.</p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[["Level", courseTerm ?? course.level], ["Modules", String(modules.length)], ["Topics", String(topicCount)], ["Completed", `${completedTopicSlugs.size} / ${topicCount}`]].map(([label, value]) => <div key={label} className="rounded-xl border border-border-soft bg-surface p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>)}
              </div>
            </section>}

            {course.price === 0 && <section className="mt-8" aria-labelledby="course-roadmap">
              <div className="mb-4"><p className="text-xs font-bold uppercase tracking-wider text-brand-600">Course roadmap</p><h2 id="course-roadmap" className="mt-1 text-xl font-bold">A clear path through the material</h2></div>
              <ol className="relative space-y-3 before:absolute before:bottom-5 before:left-[17px] before:top-5 before:w-px before:bg-brand-200">
                {modules.map((module, moduleIndex) => {
                  const moduleDone = module.topics.filter((item) => completedTopicSlugs.has(item.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))).length;
                  const percent = module.topics.length ? Math.round(moduleDone / module.topics.length * 100) : 0;
                  return <li key={`${module.title}-${moduleIndex}`} className="relative flex gap-3">
                    <span className="z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-brand-200 bg-surface text-xs font-bold text-brand-700">{String(moduleIndex + 1).padStart(2, "0")}</span>
                    <details className="group min-w-0 flex-1 rounded-xl border border-border-soft bg-surface p-4">
                      <summary className="cursor-pointer list-none"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{module.title}</span><span className="text-xs text-muted">{moduleDone}/{module.topics.length} topics · {percent}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} /></div></summary>
                      <ul className="mt-3 grid gap-2 border-t border-border-soft pt-3 text-sm sm:grid-cols-2">{module.topics.map((item) => {
                        const topicIndex = modules.flatMap((entry) => entry.topics).indexOf(item);
                        return <li key={item}><Link href={`/courses/${course.slug}/learn/${item.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-foreground/80 hover:bg-surface-2 hover:text-brand-700"><span className="text-xs text-muted">{completedTopicSlugs.has(item.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")) ? "✓" : `${topicIndex + 1}.`}</span>{item}</Link></li>;
                      })}</ul>
                    </details>
                  </li>;
                })}
              </ol>
            </section>}

            {course.price !== 0 && <div className="mt-8">
              <h2 className="flex items-center gap-2 font-semibold">
                <ListChecks className="h-5.5 w-5.5 text-brand-500 transition-transform duration-300 hover:scale-110" /> Syllabus
              </h2>
              <div className="mt-4 space-y-3">
                {modules.map((module, moduleIndex) => (
                  <details key={`${module.title}-${moduleIndex}`} className="group rounded-xl border border-border-soft bg-surface p-4" open={course.slug === "python-fundamentals" && moduleIndex < 2}>
                    <summary className="cursor-pointer list-none font-semibold marker:hidden">{String(moduleIndex + 1).padStart(2, "0")} · {module.title}<span className="ml-2 text-xs font-normal text-muted">{module.topics.length} subtopics</span></summary>
                    <ol className="mt-3 grid gap-2 border-t border-border-soft pt-3 text-sm text-muted sm:grid-cols-2">
                      {module.topics.map((item, topicIndex) => <li key={`${item}-${topicIndex}`} className="flex items-start gap-2"><span className="mt-0.5 text-xs font-semibold text-brand-600">{topicIndex + 1}.</span><span>{item}</span></li>)}
                    </ol>
                  </details>
                ))}
              </div>
            </div>}
          </div>

          <div>
            <div className="lg:sticky lg:top-24">
              <Card className="p-6">
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-bold ${course.price === 0 ? "text-success" : ""}`}>{course.price === 0 ? "FREE" : `₹${course.price.toLocaleString("en-IN")}`}</span>
                  {course.originalPrice && course.originalPrice > course.price && (
                    <span className="text-sm text-muted line-through">₹{course.originalPrice.toLocaleString("en-IN")}</span>
                  )}
                </div>
                {discountPct && (
                  <span className="mt-1.5 inline-flex items-center gap-0.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                    <Percent className="h-4 w-4" /> {discountPct}% off, limited time
                  </span>
                )}

                {course.price === 0 && enrollment && <div className="mt-4" aria-label={`Course progress ${enrollment.progress}%`}><div className="mb-1 flex justify-between text-xs"><span className="text-muted">Your progress</span><span className="font-semibold text-brand-700">{enrollment.progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-brand-500" style={{ width: `${enrollment.progress}%` }} /></div></div>}

                {course.price === 0 && enrollment && topicCount > 0 && completedTopicSlugs.size >= topicCount && (
                  <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:bg-brand-900/10">
                    <p className="mb-1 text-sm font-semibold">Course completed</p>
                    <p className="text-xs text-muted">Add the name you want printed on your certificate.</p>
                    <DownloadCertificate courseSlug={course.slug} courseTitle={displayTitle} />
                  </div>
                )}

                {course.price === 0 && enrollment && !(topicCount > 0 && completedTopicSlugs.size >= topicCount) && (
                  <p className="mt-4 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">Complete every topic to earn a verified certificate with a unique certificate ID. Choose from three designs.</p>
                )}

                <div className="mt-5">
                  {course.price === 0 ? (
                    <FreeEnrollButton slug={course.slug} loggedIn={!!user} enrolled={!!enrollment} />
                  ) : !user ? (
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
                      Enroll now — pay ₹{course.price.toLocaleString("en-IN")}
                    </Button>
                  )}
                </div>

                <p className="mt-4 text-center text-xs text-muted">Lifetime access Â· Certificate on completion</p>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
