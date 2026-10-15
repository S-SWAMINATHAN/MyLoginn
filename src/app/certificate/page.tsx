import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, Award, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { loadLmsContext } from "@/lib/lms/context";
import { toIssuedCertificate } from "@/lib/certificate/server";
import { Container, Section } from "@/components/ui/Section";
import { CertificateStudio } from "@/components/certificate/CertificateStudio";
import type { AssessmentResult, UserData } from "@/types/certificate";

export const metadata: Metadata = { title: "Certificate", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function Header({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <header className="mb-8">
      <span className="story-eyebrow">{eyebrow}</span>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-story-navy sm:text-4xl">{title}</h1>
      {sub && <p className="mt-2 text-muted">{sub}</p>}
    </header>
  );
}

/** No course chosen: list the learner's assessed courses with their certificate status. */
async function CoursePicker({ userId }: { userId: string }) {
  const [enrollments, certificates] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId, course: { engine: "lms", status: "published" } }, orderBy: { enrolledAt: "desc" }, select: { course: { select: { id: true, slug: true, title: true, passPercent: true } } } }),
    prisma.certificate.findMany({ where: { userId }, select: { courseId: true, serial: true } }),
  ]);
  const issued = new Map(certificates.map((c) => [c.courseId, c.serial]));
  return (
    <Section className="pt-8 pb-16">
      <Container className="max-w-3xl">
        <Header eyebrow="Certificates" title="Your certificates" sub="Pass a course's final assessment to unlock its certificate." />
        {enrollments.length === 0 ? (
          <p className="rounded-2xl border border-border-soft bg-surface p-6 text-sm text-muted">You are not enrolled in any assessed course yet. <Link href="/courses" className="font-semibold text-story-royal underline">Browse courses</Link></p>
        ) : (
          <ul className="space-y-3">
            {enrollments.map(({ course }) => {
              const serial = issued.get(course.id);
              return (
                <li key={course.id}>
                  <Link href={`/certificate?course=${encodeURIComponent(course.slug)}`} className="flex items-center gap-4 rounded-2xl border border-border-soft bg-surface p-4 transition hover:border-story-royal/40 hover:bg-story-mist">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${serial ? "bg-success/10 text-success" : "bg-story-mist text-muted"}`}>{serial ? <Award className="h-5 w-5" aria-hidden /> : <Lock className="h-5 w-5" aria-hidden />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-story-navy">{course.title}</span>
                      <span className="block text-xs text-muted">{serial ? `Earned · ${serial}` : `Pass mark ${course.passPercent}%`}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </Section>
  );
}

export default async function CertificatePage({ searchParams }: { searchParams: Promise<{ course?: string | string[] }> }) {
  const { course } = await searchParams;
  const slug = typeof course === "string" ? course : undefined;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(slug ? `/certificate?course=${slug}` : "/certificate")}`);
  if (!slug) return <CoursePicker userId={user.id} />;

  const ctx = await loadLmsContext(slug);
  if (!ctx) notFound();
  const { structure, state, access, preview } = ctx;
  const title = structure.course.title;

  if (!access.allowed) {
    return (
      <Section className="pt-8 pb-16">
        <Container className="max-w-3xl">
          <Header eyebrow="Certificate" title={title} />
          <p className="rounded-2xl border border-border-soft bg-surface p-6 text-sm">{access.message} <Link href={`/courses/${slug}`} className="font-semibold text-story-royal underline">Go to the course</Link></p>
        </Container>
      </Section>
    );
  }

  const [quiz, row] = await Promise.all([
    structure.finalQuizId ? prisma.quiz.findUnique({ where: { id: structure.finalQuizId }, select: { maxAttempts: true } }) : null,
    preview ? null : prisma.certificate.findUnique({ where: { userId_courseId: { userId: user.id, courseId: structure.course.id } } }),
  ]);
  const passPercent = structure.course.passPercent;
  const bestPercent = state?.finalBestPercent ?? null;
  const assessment: AssessmentResult = {
    courseSlug: slug,
    courseTitle: title,
    bestPercent,
    passPercent,
    attemptsUsed: state?.finalAttempts ?? 0,
    maxAttempts: quiz?.maxAttempts ?? null,
    scorePassed: bestPercent !== null && bestPercent >= passPercent,
    // An already-issued certificate stays downloadable even if course requirements change later.
    certificateEligible: preview || !!row || !!state?.view.certificateEligible,
    lockReason: state?.view.certificateLockReason ?? null,
    retakeHref: `/courses/${slug}/assessment`,
  };
  const userData: UserData = { id: user.id, displayName: user.name, email: user.email };

  return (
    <Section className="pt-8 pb-16">
      <Container className="max-w-6xl">
        <Header eyebrow="Certificate of completion" title={title} sub="Confirm your name, pick a design and download a print-ready certificate." />
        <CertificateStudio user={userData} assessment={assessment} certificate={row ? toIssuedCertificate(row) : null} preview={preview} />
      </Container>
    </Section>
  );
}
