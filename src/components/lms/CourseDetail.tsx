import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, ChevronDown, Infinity as InfinityIcon, ListChecks, Percent, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { AnimatedClock } from "@/components/ui/icons/AnimatedClock";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { CourseProgressRing } from "@/components/courses/CourseProgressRing";
import { ModuleTopics } from "@/components/courses/ModuleTopics";
import { loadLmsContext } from "@/lib/lms/context";
import { LmsEnrollButton } from "./SmallForms";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/site";
import { paidCourseHref } from "@/lib/lms/paidLink";

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

/** Course detail for DB-driven courses, in the same flat, animated style as the free-course detail page. */
export async function LmsCourseDetail({ slug, justEnrolled }: { slug: string; justEnrolled?: boolean }) {
  const ctx = await loadLmsContext(slug);
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!ctx || !course) notFound();
  const { structure, access, user, purchase, entitlement, state } = ctx;
  // Drafts are visible to administrators only.
  if (course.status === "draft" && user?.role !== "ADMIN") notFound();

  const free = course.price === 0;
  const objectives = (course.objectives as unknown as string[]) ?? [];
  const tags = (() => { try { return JSON.parse(course.tags) as string[]; } catch { return []; } })();
  const totalMinutes = structure.lessons.reduce((s, l) => s + l.estimatedMinutes, 0);
  const priceNow = purchase && "amount" in purchase ? purchase.amount : course.price;
  const discountPct = course.originalPrice && course.originalPrice > course.price ? Math.round((1 - course.price / course.originalPrice) * 100) : null;
  const lessonView = new Map(state?.view.lessons.map((l) => [l.id, l]));
  const moduleView = new Map(state?.view.modules.map((m) => [m.id, m]));
  const learnHref = `/courses/${slug}/learn`;

  let cta: React.ReactNode;
  if (access.allowed) cta = <ArrowLink href={learnHref} className="w-full justify-between">{ctx.preview ? "Preview course" : state && state.view.requiredDone > 0 ? "Continue learning" : "Start learning"}</ArrowLink>;
  else if (!user) cta = <ArrowLink href={`/login?next=/courses/${slug}`} className="w-full justify-between">Log in to {free ? "enroll" : "buy"}</ArrowLink>;
  else if (access.reason === "not_enrolled") cta = <LmsEnrollButton slug={slug} />;
  else if (access.reason === "needs_purchase" || access.reason === "expired") cta = <ArrowLink href={paidCourseHref(slug)} className="w-full justify-between">{access.reason === "expired" ? "Renew" : "Buy"} for ₹{priceNow.toLocaleString("en-IN")}</ArrowLink>;
  else cta = <p className="rounded-2xl bg-story-mist px-4 py-3 text-sm" role="status">{access.message}</p>;

  const canRenewSoon = purchase?.action === "renew" && access.allowed;
  const stats: [string, string][] = [
    ["Level", course.level],
    ["Modules", String(structure.modules.length)],
    ["Topics", String(structure.lessons.length)],
    ["Duration", `${course.durationWeeks} weeks`],
  ];

  return (
    <Section className="pt-8 sm:pt-12">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Course", name: course.title, description: course.description, url: `${siteUrl}/courses/${course.slug}`,
        provider: { "@type": "Organization", name: "MyLoginn Tech Private Limited", sameAs: siteUrl },
        offers: { "@type": "Offer", price: course.price, priceCurrency: "INR", category: free ? "Free" : "Paid" },
      }} />
      <Container className="max-w-6xl">
        {justEnrolled && access.allowed && <p role="status" className="mb-6 rounded-2xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">Payment verified. Your course is unlocked.</p>}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <div className="min-w-0">
            {/* Header */}
            <Reveal>
              <div className="flex items-center gap-4 sm:gap-5">
                <CourseIconThumb category={course.category} title={course.title} variant="round" className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
                <div className="min-w-0">
                  <span className="story-eyebrow">{course.category}</span>
                  <h1 className="mt-2 text-2xl font-bold leading-[1.1] tracking-tight text-story-navy sm:text-4xl dark:text-foreground">{course.title}</h1>
                  <p className="mt-2 text-sm text-muted">{course.instructor}{course.instructorTitle ? ` · ${course.instructorTitle}` : ""}</p>
                </div>
              </div>
            </Reveal>

            {/* One-line facts */}
            <Reveal direction="up" delay={0.1}>
              <div className="no-scrollbar mt-6 flex items-center gap-2 overflow-x-auto py-1">
                <span className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-semibold">
                  <AnimatedClock className="h-4 w-4 transition-transform duration-300 group-hover:scale-125" /> {course.durationWeeks} weeks
                </span>
                <span className="shrink-0 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-semibold">{structure.modules.length} modules · {structure.lessons.length} subtopics</span>
                <span className="shrink-0 rounded-full border border-border-soft bg-surface px-3 py-1.5 text-xs font-semibold">≈ {Math.max(1, Math.round(totalMinutes / 60))} h of content</span>
                {tags.map((t) => <span key={t} className="shrink-0 rounded-full bg-story-mist px-3 py-1.5 text-xs font-semibold text-story-royal">{t}</span>)}
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

            {/* Objectives */}
            {objectives.length > 0 && (
              <section className="mt-12" aria-labelledby="obj">
                <Reveal><span className="story-eyebrow">Outcomes</span></Reveal>
                <h2 id="obj" className="story-subheading mt-3 flex items-center gap-2 text-story-navy dark:text-foreground"><ListChecks className="h-6 w-6 text-story-royal" aria-hidden />What you will learn</h2>
                <RevealGroup className="mt-6 grid gap-3 sm:grid-cols-2" stagger={0.06}>
                  {objectives.map((o) => (
                    <RevealItem key={o}>
                      <div className="flex h-full items-start gap-3 rounded-2xl border border-border-soft bg-surface p-4 text-sm leading-6 transition-all duration-300 hover:-translate-y-1 hover:border-story-royal/40">
                        <span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-story-royal text-xs font-bold text-white">✓</span>{o}
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </section>
            )}

            {(course.audience || course.prerequisitesText) && (
              <RevealGroup className="mt-8 grid gap-3 sm:grid-cols-2" stagger={0.08}>
                {course.audience && <RevealItem><div className="h-full rounded-2xl bg-story-mist p-5"><h2 className="text-sm font-bold text-story-navy dark:text-foreground">Who it is for</h2><p className="mt-1.5 text-sm leading-6 text-muted">{course.audience}</p></div></RevealItem>}
                {course.prerequisitesText && <RevealItem><div className="h-full rounded-2xl bg-story-mist p-5"><h2 className="text-sm font-bold text-story-navy dark:text-foreground">Prerequisites</h2><p className="mt-1.5 text-sm leading-6 text-muted">{course.prerequisitesText}</p></div></RevealItem>}
              </RevealGroup>
            )}

            {/* Roadmap */}
            <section className="mt-12" aria-labelledby="syl">
              <Reveal><span className="story-eyebrow">Course roadmap</span></Reveal>
              <h2 id="syl" className="story-subheading mt-3 text-story-navy dark:text-foreground">A clear path through the material</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted">Build your understanding one focused lesson at a time, finishing with a final assessment.</p>
              <ol className="relative mt-8 space-y-4">
                <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px bg-border-soft" />
                {structure.modules.map((m, i) => {
                  const lessons = structure.lessons.filter((l) => l.moduleId === m.id).sort((a, b) => a.position - b.position);
                  const percent = moduleView.get(m.id)?.percent ?? 0;
                  const doneCount = lessons.filter((l) => lessonView.get(l.id)?.status === "completed").length;
                  return (
                    <li key={m.id} className="relative flex gap-3.5">
                      <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-bold ${percent === 100 ? "border-story-royal bg-story-royal text-white" : "border-border-soft bg-surface text-story-royal"}`}>
                        {percent === 100 ? "✓" : String(i + 1).padStart(2, "0")}
                      </span>
                      <details className="group min-w-0 flex-1 rounded-2xl border border-border-soft bg-surface transition-colors duration-300 open:border-story-royal/35 open:shadow-[0_14px_30px_-22px_rgba(31,86,214,0.55)]" open={i === 0}>
                        <summary className="flex cursor-pointer list-none items-center gap-3 p-4 marker:hidden [&::-webkit-details-marker]:hidden">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                              <span className="font-semibold">{m.title}</span>
                              <span className="font-mono text-[11px] tabular-nums text-muted">{state ? `${doneCount}/${lessons.length} topics · ${percent}%` : `${lessons.length} topics`}</span>
                            </div>
                            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-story-mist"><div className="h-full rounded-full bg-story-royal transition-[width] duration-700" style={{ width: `${percent}%` }} /></div>
                          </div>
                          <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-story-mist text-story-royal transition-transform duration-300 group-open:rotate-180"><ChevronDown className="h-4 w-4" /></span>
                        </summary>
                        {m.summary && <p className="px-4 pb-1 text-sm text-muted">{m.summary}</p>}
                        <ModuleTopics
                          courseSlug={slug}
                          topics={lessons.map((l) => ({ title: l.title, slug: l.slug, number: structure.lessons.findIndex((x) => x.id === l.id) + 1, done: lessonView.get(l.id)?.status === "completed" }))}
                        />
                      </details>
                    </li>
                  );
                })}
                {structure.finalQuizId && (
                  <li className="relative flex gap-3.5">
                    <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center text-story-royal"><Sparkles className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1 rounded-2xl bg-story-mist p-4 text-sm"><strong className="text-story-navy dark:text-foreground">Final assessment.</strong> Score {course.passPercent}% or more to unlock your completion certificate.</div>
                  </li>
                )}
              </ol>
            </section>
          </div>

          {/* Enrolment card */}
          <aside>
            <div className="lg:sticky lg:top-24">
              <Reveal direction="left" delay={0.1}>
                <div className="rounded-3xl border border-border-soft bg-surface p-6 shadow-[var(--shadow-soft)]">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className={`text-4xl font-bold tracking-tight ${free ? "text-success" : "text-story-navy dark:text-foreground"}`}>{free ? "FREE" : `₹${course.price.toLocaleString("en-IN")}`}</span>
                    {!free && course.originalPrice && course.originalPrice > course.price && <span className="text-sm text-muted line-through">₹{course.originalPrice.toLocaleString("en-IN")}</span>}
                  </div>
                  {discountPct && !free && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success"><Percent className="h-3.5 w-3.5" /> {discountPct}% off, limited time</span>
                  )}

                  {state && (
                    <div className="mt-5 rounded-2xl bg-story-mist p-4">
                      <CourseProgressRing percent={state.view.percent} label="Your progress" sublabel={`${state.view.requiredDone} of ${state.view.requiredTotal} topics done`} />
                    </div>
                  )}

                  <dl className="mt-5 space-y-2.5 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-muted">Access</dt><dd className="text-right font-medium">{free ? "Free, enroll to start" : course.validityDays ? `${course.validityDays} days from purchase` : "Lifetime"}</dd></div>
                    {!free && <div className="flex justify-between gap-3"><dt className="text-muted">Renewal</dt><dd className="text-right font-medium">{course.validityDays ? `Manual, ₹${(course.renewalPrice ?? course.price).toLocaleString("en-IN")}` : "Not needed"}</dd></div>}
                    {!free && entitlement && access.allowed && <div className="flex justify-between gap-3"><dt className="text-muted">Your access</dt><dd className="text-right font-medium">{entitlement.expiresAt ? `Until ${fmtDate(entitlement.expiresAt)}` : "Lifetime"}</dd></div>}
                    {structure.course.aiCoachEnabled && <div className="flex justify-between gap-3"><dt className="text-muted">AI Coach</dt><dd className="text-right font-medium">English and Tamil</dd></div>}
                  </dl>

                  <div className="mt-5">{cta}</div>
                  {canRenewSoon && <Link href={paidCourseHref(slug)} className="mt-3 block text-center text-sm font-semibold text-story-royal underline underline-offset-2">Renew early for ₹{priceNow.toLocaleString("en-IN")}</Link>}

                  <ul className="mt-5 space-y-2.5 border-t border-border-soft pt-4 text-[13px] font-medium">
                    <li className="flex items-center gap-2.5"><span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-story-mist text-story-royal"><InfinityIcon className="h-4 w-4" /></span>{course.validityDays && !free ? `${course.validityDays}-day access` : "Lifetime access"}</li>
                    <li className="flex items-center gap-2.5"><span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-story-mist text-story-royal"><Award className="h-4 w-4" /></span>Certificate: pass the final with {course.passPercent}%+</li>
                  </ul>
                  {!free && <p className="mt-4 text-xs leading-5 text-muted">Secure payment by Razorpay. Content unlocks only after the payment is verified on our server. No automatic renewals: you choose when to renew.</p>}
                </div>
              </Reveal>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
