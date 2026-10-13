import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Section, Container } from "@/components/ui/Section";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { CourseProgressRing } from "@/components/courses/CourseProgressRing";
import { ModuleTopics } from "@/components/courses/ModuleTopics";
import { Percent, ListChecks, Infinity as InfinityIcon, Award, ChevronDown } from "lucide-react";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { AnimatedSuccess } from "@/components/ui/icons/AnimatedSuccess";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { FreeEnrollButton } from "@/components/courses/FreeEnrollButton";
import { DownloadCertificate } from "@/components/courses/DownloadCertificate";
import { getCourseModules } from "@/lib/freeCourseCurriculum";
import { getCourseDisplayTitle, getFreeCourseTerm } from "@/lib/freeCourseTitles";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/site";
import { LmsCourseDetail } from "@/components/lms/CourseDetail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { title: true, description: true, slug: true, category: true, level: true, status: true },
  });

  if (!course || course.status !== "published") return { robots: { index: false, follow: false } };

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
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { slug } = await params;
  const { enrolled: justEnrolled } = await searchParams;
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course) notFound();
  // DB-driven LMS courses have their own detail page (real syllabus, validity, renewal terms, access state).
  if (course.engine === "lms") return <LmsCourseDetail slug={slug} justEnrolled={justEnrolled === "1"} />;

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

  const toSlug = (item: string) => item.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const allTopics = modules.flatMap((module) => module.topics);
  const courseDone = course.price === 0 && enrollment && topicCount > 0 && completedTopicSlugs.size >= topicCount;

  const stats = course.price === 0
    ? [["Level", courseTerm ?? course.level], ["Modules", String(modules.length)], ["Topics", String(topicCount)], ["Duration", `${course.durationWeeks} weeks`]]
    : [["Level", course.level], ["Modules", String(modules.length)], ["Subtopics", String(topicCount)], ["Duration", `${course.durationWeeks} weeks`]];

  return (
    <Section className="pt-8 sm:pt-12">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Course",
        name: displayTitle,
        description: course.description,
        url: `${siteUrl}/courses/${course.slug}`,
        provider: { "@type": "Organization", "@id": `${siteUrl}/#organization`, name: "MyLoginn Tech Private Limited", sameAs: siteUrl },
        inLanguage: "en",
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "online" },
        offers: { "@type": "Offer", price: course.price, priceCurrency: "INR", category: course.price === 0 ? "Free" : "Paid", url: `${siteUrl}/courses/${course.slug}` },
      }} />
      <Container className="max-w-6xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <div className="min-w-0">
            {/* Header */}
            <Reveal>
              <div className="flex items-center gap-4 sm:gap-5">
                <CourseIconThumb category={course.category} title={displayTitle} variant="round" className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
                <div className="min-w-0">
                  <span className="story-eyebrow">{course.category}</span>
                  <h1 className="mt-2 text-2xl font-bold leading-[1.1] tracking-tight text-story-navy sm:text-4xl dark:text-foreground">{displayTitle}</h1>
                  <p className="mt-2 text-sm text-muted">
                    {course.instructor}
                    {course.instructorTitle ? ` · ${course.instructorTitle}` : ""}
                  </p>
                </div>
              </div>
            </Reveal>

            {/* One-line facts */}
            <Reveal direction="up" delay={0.1}>
              <div className="no-scrollbar mt-6 flex items-center gap-2 overflow-x-auto py-1">
                <span className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-semibold">
                  <AnimatedClock className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" /> {course.durationWeeks} weeks
                </span>
                {course.price === 0 && <span className="shrink-0 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-semibold">{modules.length} modules · {topicCount} subtopics</span>}
                {displayTags.map((t) => (
                  <span key={t} className="shrink-0 rounded-full bg-story-mist px-3 py-1.5 text-xs font-semibold text-story-royal">{t}</span>
                ))}
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.15}>
              <p className="mt-6 text-base leading-8 text-foreground/90">{course.longDescription ?? course.description}</p>
            </Reveal>

            {/* Stat tiles */}
            <RevealGroup className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.07}>
              {stats.map(([label, value]) => (
                <RevealItem key={label}>
                  <div className="rounded-2xl border border-border-soft bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-story-royal/40 hover:shadow-[var(--shadow-soft)]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
                    <p className="mt-1 truncate text-base font-bold text-story-navy dark:text-foreground">{value}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            {/* Roadmap (free) */}
            {course.price === 0 && (
              <section className="mt-12" aria-labelledby="course-roadmap">
                <Reveal><span className="story-eyebrow">Course roadmap</span></Reveal>
                <h2 id="course-roadmap" className="story-subheading mt-3 text-story-navy dark:text-foreground">A clear path through the material</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Build your understanding one focused lesson at a time, from core ideas to practical programming.</p>
                <ol className="relative mt-8 space-y-4">
                  <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px bg-border-soft" />
                  {modules.map((module, moduleIndex) => {
                    const moduleDone = module.topics.filter((item) => completedTopicSlugs.has(toSlug(item))).length;
                    const percent = module.topics.length ? Math.round((moduleDone / module.topics.length) * 100) : 0;
                    return (
                      <li key={`${module.title}-${moduleIndex}`} className="relative flex gap-3.5">
                        <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-bold ${percent === 100 ? "border-story-royal bg-story-royal text-white" : "border-border-soft bg-surface text-story-royal"}`}>
                          {percent === 100 ? "✓" : String(moduleIndex + 1).padStart(2, "0")}
                        </span>
                        <details className="group min-w-0 flex-1 rounded-2xl border border-border-soft bg-surface transition-colors duration-300 open:border-story-royal/35 open:shadow-[0_14px_30px_-22px_rgba(31,86,214,0.55)]">
                          <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden [&::-webkit-details-marker]:hidden">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                <span className="font-semibold">{module.title}</span>
                                <span className="font-mono text-[11px] tabular-nums text-muted">{moduleDone}/{module.topics.length} topics · {percent}%</span>
                              </div>
                              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-story-mist"><div className="h-full rounded-full bg-story-royal transition-[width] duration-700" style={{ width: `${percent}%` }} /></div>
                            </div>
                            <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-story-mist text-story-royal transition-transform duration-300 group-open:rotate-180"><ChevronDown className="h-4 w-4" /></span>
                          </summary>
                          <ModuleTopics
                            courseSlug={course.slug}
                            topics={module.topics.map((item) => ({ title: item, slug: toSlug(item), number: allTopics.indexOf(item) + 1, done: completedTopicSlugs.has(toSlug(item)) }))}
                          />
                        </details>
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}

            {/* Syllabus (paid) */}
            {course.price !== 0 && (
              <section className="mt-12" aria-labelledby="course-syllabus">
                <Reveal><span className="story-eyebrow">Syllabus</span></Reveal>
                <h2 id="course-syllabus" className="story-subheading mt-3 flex items-center gap-2 text-story-navy dark:text-foreground">
                  <ListChecks className="h-6 w-6 text-story-royal" aria-hidden /> What you will learn
                </h2>
                <div className="mt-6 space-y-3">
                  {modules.map((module, moduleIndex) => (
                    <details key={`${module.title}-${moduleIndex}`} className="group rounded-2xl border border-border-soft bg-surface transition-colors duration-300 open:border-story-royal/35" open={course.slug === "python-fundamentals" && moduleIndex < 2}>
                      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-story-mist text-xs font-bold text-story-royal">{String(moduleIndex + 1).padStart(2, "0")}</span>
                        <span className="min-w-0 flex-1">{module.title}<span className="ml-2 text-xs font-normal text-muted">{module.topics.length} subtopics</span></span>
                        <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-story-mist text-story-royal transition-transform duration-300 group-open:rotate-180"><ChevronDown className="h-4 w-4" /></span>
                      </summary>
                      <ol className="grid gap-2 border-t border-border-soft p-4 text-sm text-muted sm:grid-cols-2">
                        {module.topics.map((item, topicIndex) => <li key={`${item}-${topicIndex}`} className="flex items-start gap-2"><span className="mt-0.5 text-xs font-semibold text-story-royal">{topicIndex + 1}.</span><span>{item}</span></li>)}
                      </ol>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Enrolment card */}
          <aside>
            <div className="lg:sticky lg:top-24">
              <Reveal direction="left" delay={0.1}>
                <div className="rounded-3xl border border-border-soft bg-surface p-6 shadow-[var(--shadow-soft)]">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className={`text-4xl font-bold tracking-tight ${course.price === 0 ? "text-success" : "text-story-navy dark:text-foreground"}`}>{course.price === 0 ? "FREE" : `₹${course.price.toLocaleString("en-IN")}`}</span>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-sm text-muted line-through">₹{course.originalPrice.toLocaleString("en-IN")}</span>
                    )}
                  </div>
                  {discountPct && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                      <Percent className="h-3.5 w-3.5" /> {discountPct}% off, limited time
                    </span>
                  )}

                  {course.price === 0 && enrollment && (
                    <div className="mt-5 rounded-2xl bg-story-mist p-4">
                      <CourseProgressRing percent={enrollment.progress} label="Your progress" sublabel={`${completedTopicSlugs.size} of ${topicCount} topics done`} />
                    </div>
                  )}

                  {courseDone && (
                    <div className="mt-4 rounded-2xl border border-story-royal/30 bg-story-mist p-4">
                      <p className="mb-1 text-sm font-semibold">Course completed</p>
                      <p className="text-xs text-muted">Add the name you want printed on your certificate.</p>
                      <DownloadCertificate courseSlug={course.slug} courseTitle={displayTitle} defaultName={user?.name ?? ""} />
                    </div>
                  )}

                  {course.price === 0 && enrollment && !courseDone && (
                    <p className="mt-4 rounded-xl bg-story-mist px-3.5 py-2.5 text-xs leading-5 text-muted">Complete every topic to earn a verified certificate with a unique certificate ID. Choose from three designs.</p>
                  )}

                  <div className="mt-5">
                    {course.price === 0 ? (
                      <FreeEnrollButton slug={course.slug} loggedIn={!!user} enrolled={!!enrollment} />
                    ) : !user ? (
                      <ArrowLink href="/login" className="w-full justify-between">Log in to enroll</ArrowLink>
                    ) : enrollment ? (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <AnimatedSuccess className="h-10.5 w-10.5" />
                        <p className="text-sm font-medium">You&apos;re enrolled</p>
                        <ArrowLink href="/dashboard" className="w-full justify-between">Go to dashboard</ArrowLink>
                      </div>
                    ) : (
                      <ArrowLink href={`/courses/${course.slug}/checkout`} className="w-full justify-between">Enroll now — pay ₹{course.price.toLocaleString("en-IN")}</ArrowLink>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2.5 border-t border-border-soft pt-4 text-[13px] font-medium">
                    <li className="flex items-center gap-2.5"><span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-story-mist text-story-royal"><InfinityIcon className="h-4 w-4" /></span>Lifetime access</li>
                    <li className="flex items-center gap-2.5"><span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-story-mist text-story-royal"><Award className="h-4 w-4" /></span>Certificate on completion</li>
                  </ul>
                </div>
              </Reveal>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
