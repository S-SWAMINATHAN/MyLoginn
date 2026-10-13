import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { loadLmsContext } from "@/lib/lms/context";
import { LmsEnrollButton } from "./SmallForms";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/site";
import { paidCourseHref } from "@/lib/lms/paidLink";

const LEVEL_STYLE: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Intermediate: "bg-amber-50 text-amber-800 ring-amber-200",
  Advanced: "bg-violet-50 text-violet-700 ring-violet-200",
};

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

export async function LmsCourseDetail({ slug, justEnrolled }: { slug: string; justEnrolled?: boolean }) {
  const ctx = await loadLmsContext(slug);
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!ctx || !course) notFound();
  const { structure, access, user, purchase, entitlement } = ctx;
  // Drafts are visible to administrators only.
  if (course.status === "draft" && user?.role !== "ADMIN") notFound();

  const free = course.price === 0;
  const objectives = (course.objectives as unknown as string[]) ?? [];
  const totalMinutes = structure.lessons.reduce((s, l) => s + l.estimatedMinutes, 0);
  const priceNow = purchase && "amount" in purchase ? purchase.amount : course.price;

  let cta: React.ReactNode;
  if (access.allowed) cta = <Link href={`/courses/${slug}/learn`} className="block rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 px-6 py-3 text-center text-sm font-semibold text-white">{ctx.preview ? "Preview course" : ctx.state && ctx.state.view.requiredDone > 0 ? "Continue learning" : "Start learning"}</Link>;
  else if (!user) cta = <Link href={`/login?next=/courses/${slug}`} className="block rounded-full bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white">Log in to {free ? "enroll" : "buy"}</Link>;
  else if (access.reason === "not_enrolled") cta = <LmsEnrollButton slug={slug} />;
  else if (access.reason === "needs_purchase" || access.reason === "expired") cta = <Link href={paidCourseHref(slug)} className="block rounded-full bg-brand-600 px-6 py-3 text-center text-sm font-semibold text-white">{access.reason === "expired" ? "Renew" : "Buy"} for ₹{priceNow.toLocaleString("en-IN")}</Link>;
  else cta = <p className="rounded-xl bg-surface p-3 text-sm ring-1 ring-border-soft" role="status">{access.message}</p>;

  const canRenewSoon = purchase?.action === "renew" && access.allowed;

  return (
    <Section className="pt-8 sm:pt-12">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Course", name: course.title, description: course.description, url: `${siteUrl}/courses/${course.slug}`,
        provider: { "@type": "Organization", name: "MyLoginn Tech Private Limited", sameAs: siteUrl },
        offers: { "@type": "Offer", price: course.price, priceCurrency: "INR", category: free ? "Free" : "Paid" },
      }} />
      <Container className="max-w-6xl">
        {justEnrolled && access.allowed && <p role="status" className="mb-6 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">Payment verified. Your course is unlocked.</p>}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <span className="story-eyebrow">{course.category}</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className={`rounded-full px-3 py-1 ring-1 ${LEVEL_STYLE[course.level] ?? ""}`}>{course.level}</span>
              <span className={`rounded-full px-3 py-1 ring-1 ${free ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-blue-50 text-blue-700 ring-blue-200"}`}>{free ? "Free" : "Paid"}</span>
              <span className="rounded-full bg-surface px-3 py-1 ring-1 ring-border-soft">{structure.modules.length} modules · {structure.lessons.length} lessons</span>
              <span className="rounded-full bg-surface px-3 py-1 ring-1 ring-border-soft">≈ {Math.max(1, Math.round(totalMinutes / 60))} h of content · {course.durationWeeks} weeks</span>
            </div>
            <p className="mt-5 text-lg leading-8 text-muted">{course.description}</p>
            {course.longDescription && <p className="mt-3 leading-7">{course.longDescription}</p>}

            {objectives.length > 0 && (
              <section className="mt-8" aria-labelledby="obj"><h2 id="obj" className="text-xl font-bold">What you will learn</h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">{objectives.map((o) => <li key={o} className="flex gap-2 text-sm leading-6"><span className="mt-0.5 text-success" aria-hidden="true">✓</span>{o}</li>)}</ul>
              </section>
            )}
            <section className="mt-8 grid gap-4 sm:grid-cols-2">
              {course.audience && <div className="rounded-xl bg-surface p-4 ring-1 ring-border-soft"><h2 className="text-sm font-bold">Who it is for</h2><p className="mt-1 text-sm leading-6 text-muted">{course.audience}</p></div>}
              {course.prerequisitesText && <div className="rounded-xl bg-surface p-4 ring-1 ring-border-soft"><h2 className="text-sm font-bold">Prerequisites</h2><p className="mt-1 text-sm leading-6 text-muted">{course.prerequisitesText}</p></div>}
            </section>

            <section className="mt-10" aria-labelledby="syl"><h2 id="syl" className="text-xl font-bold">Syllabus</h2>
              <div className="mt-4 space-y-3">
                {structure.modules.map((m, i) => (
                  <details key={m.id} className="group rounded-xl border border-border-soft bg-surface" open={i === 0}>
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold">
                      <span>Module {i + 1}: {m.title}</span>
                      <span className="shrink-0 text-xs font-normal text-muted">{structure.lessons.filter((l) => l.moduleId === m.id).length} lessons</span>
                    </summary>
                    {m.summary && <p className="px-4 text-sm text-muted">{m.summary}</p>}
                    <ol className="space-y-1 px-4 pb-4 pt-2 text-sm">
                      {structure.lessons.filter((l) => l.moduleId === m.id).map((l) => <li key={l.id} className="flex justify-between gap-3"><span>{l.title}</span><span className="shrink-0 text-xs text-muted">{l.estimatedMinutes} min</span></li>)}
                    </ol>
                  </details>
                ))}
                {structure.finalQuizId && <div className="rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-3 text-sm dark:bg-brand-900/10"><strong>Final assessment.</strong> Score {course.passPercent}% or more to unlock your completion certificate.</div>}
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border-soft bg-surface p-5 shadow-sm">
              <p className={`text-4xl font-bold tracking-tight ${free ? "text-success" : ""}`}>{free ? "FREE" : `₹${course.price.toLocaleString("en-IN")}`}</p>
              {!free && course.originalPrice && course.originalPrice > course.price && <p className="text-sm text-muted line-through">₹{course.originalPrice.toLocaleString("en-IN")}</p>}
              <dl className="mt-4 space-y-2 border-t border-border-soft pt-4 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-muted">Access</dt><dd className="text-right font-medium">{free ? "Free, enroll to start" : course.validityDays ? `${course.validityDays} days from purchase` : "Lifetime"}</dd></div>
                {!free && <div className="flex justify-between gap-3"><dt className="text-muted">Renewal</dt><dd className="text-right font-medium">{course.validityDays ? `Manual, ₹${(course.renewalPrice ?? course.price).toLocaleString("en-IN")}` : "Not needed"}</dd></div>}
                {!free && entitlement && access.allowed && <div className="flex justify-between gap-3"><dt className="text-muted">Your access</dt><dd className="text-right font-medium">{entitlement.expiresAt ? `Until ${fmtDate(entitlement.expiresAt)}` : "Lifetime"}</dd></div>}
                <div className="flex justify-between gap-3"><dt className="text-muted">Certificate</dt><dd className="text-right font-medium">Pass the final with {course.passPercent}%+</dd></div>
                {structure.course.aiCoachEnabled && <div className="flex justify-between gap-3"><dt className="text-muted">AI Coach</dt><dd className="text-right font-medium">English and Tamil</dd></div>}
              </dl>
              <div className="mt-5">{cta}</div>
              {canRenewSoon && <Link href={paidCourseHref(slug)} className="mt-3 block text-center text-sm font-semibold text-brand-600 underline underline-offset-2">Renew early for ₹{priceNow.toLocaleString("en-IN")}</Link>}
              {!free && <p className="mt-4 text-xs leading-5 text-muted">Secure payment by Razorpay. Content unlocks only after the payment is verified on our server. No automatic renewals: you choose when to renew.</p>}
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
