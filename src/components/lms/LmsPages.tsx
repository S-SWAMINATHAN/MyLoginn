import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { LessonVideo, type LessonVideoData } from "@/components/courses/LessonVideo";
import { loadLmsContext, type LmsContext } from "@/lib/lms/context";
import { ensureLessonProgress } from "@/lib/lms/completion";
import { minReadSeconds, normalizeRules } from "@/lib/lms/progression";
import { publicTests, type ChallengeTest } from "@/lib/lms/challenge";
import type { ExplainerContent } from "@/lib/lms/content";
import { Markdown } from "./Markdown";
import { Outline } from "./Outline";
import { LockedPanel } from "./LockedPanel";
import { QuizRunner } from "./QuizRunner";
import { ChallengeRunner } from "./ChallengeRunner";
import { ReadButton, VideoTracker, youTubeId } from "./LessonActions";
import { AssignmentForm, CertificateDownload } from "./SmallForms";
import { CoachPanel } from "./CoachPanel";

async function requireContext(slug: string, nextPath: string) {
  const ctx = await loadLmsContext(slug);
  if (!ctx) notFound();
  if (!ctx.user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return ctx;
}

function Shell({ ctx, children, activeLessonId, wide = true }: { ctx: LmsContext; children: React.ReactNode; activeLessonId?: string; wide?: boolean }) {
  const { structure, state } = ctx;
  return (
    <Section className="pt-8 pb-16 sm:pt-12">
      <Container className="max-w-7xl">
        <p className="text-sm text-muted"><Link href={`/courses/${structure.course.slug}`} className="hover:underline">{structure.course.title}</Link></p>
        {ctx.preview && <p role="status" className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Administrator preview: your progress is not recorded.</p>}
        <div className={`mt-4 grid gap-8 ${wide ? "lg:grid-cols-[19rem_minmax(0,1fr)]" : ""}`}>
          <aside className="order-2 lg:order-1 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:pr-2">
            {state && (
              <div className="mb-5">
                <div className="flex items-baseline justify-between text-sm"><span className="font-semibold">Your progress</span><span>{state.view.percent}%</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border-soft" role="progressbar" aria-valuenow={state.view.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress"><div className="h-full rounded-full bg-brand-600" style={{ width: `${state.view.percent}%` }} /></div>
              </div>
            )}
            <Outline structure={structure} view={state?.view ?? null} activeLessonId={activeLessonId} />
            <FinalRow ctx={ctx} />
          </aside>
          <main className="order-1 min-w-0 lg:order-2">{children}</main>
        </div>
      </Container>
    </Section>
  );
}

function FinalRow({ ctx }: { ctx: LmsContext }) {
  const { structure, state } = ctx;
  if (!structure.finalQuizId) return null;
  const v = state?.view;
  return (
    <div className="mt-6 rounded-xl border border-border-soft p-3 text-sm">
      <p className="font-bold">Final assessment</p>
      {v?.finalUnlocked || ctx.preview
        ? <Link href={`/courses/${structure.course.slug}/assessment`} className="mt-1 inline-block font-semibold text-brand-600 underline underline-offset-2">{v?.finalPassed ? "Review result" : "Open assessment"}</Link>
        : <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{v?.finalLockReason}</p>}
      <p className="mt-2 text-xs text-muted">Score {structure.course.passPercent}% or more to earn your certificate.</p>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------

export async function LmsLearnHub({ slug }: { slug: string }) {
  const ctx = await requireContext(slug, `/courses/${slug}/learn`);
  if (!ctx.access.allowed) return <Section className="pt-14"><Container><LockedPanel ctx={ctx} /></Container></Section>;
  const { structure, state } = ctx;
  const next = state?.view.nextLessonId ? structure.lessons.find((l) => l.id === state.view.nextLessonId) : structure.lessons[0];
  const done = state?.view.allRequiredLessonsDone;
  return (
    <Shell ctx={ctx}>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{structure.course.title}</h1>
      {state && <p className="mt-2 text-sm text-muted">{state.view.requiredDone} of {state.view.requiredTotal} required lessons completed.</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        {!done && next && <Link href={`/courses/${slug}/learn/${next.slug}`} className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white">{state && state.view.requiredDone > 0 ? "Continue learning" : "Start learning"}</Link>}
        {(done || ctx.preview) && structure.finalQuizId && <Link href={`/courses/${slug}/assessment`} className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white">{state?.view.finalPassed ? "Certificate and results" : "Take the final assessment"}</Link>}
      </div>
      {state && !state.view.certificateEligible && <p className="mt-5 rounded-xl bg-surface p-4 text-sm ring-1 ring-border-soft">{state.view.certificateLockReason}</p>}
      {state?.view.certificateEligible && <p className="mt-5 rounded-xl bg-success/10 p-4 text-sm text-success">All requirements met. <Link className="font-semibold underline" href={`/courses/${slug}/assessment`}>Download your certificate.</Link></p>}
    </Shell>
  );
}

// ---------------------------------------------------------------------------------------------------------------

export async function LmsLessonView({ slug, lessonSlug }: { slug: string; lessonSlug: string }) {
  const ctx = await requireContext(slug, `/courses/${slug}/learn/${lessonSlug}`);
  if (!ctx.access.allowed) return <Section className="pt-14"><Container><LockedPanel ctx={ctx} /></Container></Section>;
  const { structure, state, user } = ctx;
  const def = structure.lessons.find((l) => l.slug === lessonSlug);
  if (!def) notFound();
  const lv = state?.view.lessons.find((l) => l.id === def.id);

  if (lv?.status === "locked") {
    const open = structure.lessons.find((l) => l.id === state?.view.nextLessonId);
    return (
      <Shell ctx={ctx} activeLessonId={def.id}>
        <div className="rounded-2xl border border-border-soft bg-surface p-6 text-center">
          <p className="text-3xl" aria-hidden="true">🔒</p>
          <h1 className="mt-2 text-xl font-bold">{def.title}</h1>
          <p className="mt-2 text-sm text-muted" role="status">{lv.lockReason}</p>
          {open && <Link href={`/courses/${slug}/learn/${open.slug}`} className="mt-5 inline-block rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white">Go to “{open.title}”</Link>}
        </div>
      </Shell>
    );
  }

  const [lesson, progress] = await Promise.all([
    prisma.lesson.findUnique({
      where: { id: def.id },
      include: {
        quizzes: { where: { kind: "lesson", archivedAt: null }, select: { id: true, title: true, passPercent: true }, take: 1 },
        challenges: { where: { archivedAt: null }, orderBy: { position: "asc" } },
        assignments: { where: { archivedAt: null }, orderBy: { position: "asc" }, include: { submissions: { where: { userId: user!.id } } } },
      },
    }),
    ctx.preview ? Promise.resolve(null) : ensureLessonProgress(user!.id, structure.course.id, def.id),
  ]);
  if (!lesson) notFound();

  const rules = normalizeRules(lesson.rules as never);
  const quiz = lesson.quizzes[0];
  const quizStats = quiz && !ctx.preview ? await prisma.quizAttempt.aggregate({ where: { userId: user!.id, quizId: quiz.id, status: "submitted" }, _max: { percent: true }, _count: true }) : null;
  const passedChallengeIds = !ctx.preview && lesson.challenges.length
    ? new Set((await prisma.challengeSubmission.findMany({ where: { userId: user!.id, challengeId: { in: lesson.challenges.map((c) => c.id) }, passed: true }, select: { challengeId: true } })).map((s) => s.challengeId))
    : new Set<string>();

  const order = structure.lessons;
  const idx = order.findIndex((l) => l.id === def.id);
  const nextLesson = order[idx + 1];
  const completed = lv?.status === "completed";

  const ex = lesson.explainer as ExplainerContent | null;
  const videoData: LessonVideoData | null = ex ? {
    courseTitle: structure.course.title, title: lesson.title, lessonNumber: idx + 1, lessonCount: order.length,
    plain: { simple: ex.simple, analogy: ex.analogy }, visualNodes: ex.nodes, visualSummary: ex.summary, steps: ex.steps ?? [], output: ex.output ?? "", takeaways: ex.takeaways, mistake: ex.mistake,
  } : null;

  return (
    <Shell ctx={ctx} activeLessonId={def.id}>
      <article>
        <p className="story-eyebrow">Lesson {idx + 1} of {order.length} · {lesson.estimatedMinutes} min</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{lesson.title}</h1>
        {lesson.summary && <p className="mt-2 text-muted">{lesson.summary}</p>}

        <div className="mt-6">
          {lesson.videoUrl
            ? <VideoTracker lessonId={lesson.id} url={lesson.videoUrl} initialPercent={progress?.videoPercent ?? 0} minPercent={lesson.videoMinPercent} trackable={rules.video && !ctx.preview && (Boolean(youTubeId(lesson.videoUrl)) || /\.(mp4|webm)(\?|$)/i.test(lesson.videoUrl))} />
            : videoData && <LessonVideo data={videoData} />}
        </div>

        <Markdown source={lesson.contentMd} className="mt-6" />

        {!completed && lv && lv.missing.length > 0 && (
          <div className="mt-8 rounded-xl bg-brand-50/60 p-4 text-sm dark:bg-brand-900/10">
            <p className="font-semibold">To complete this lesson:</p>
            <ul className="mt-1 list-disc pl-5">{lv.missing.map((m) => <li key={m}>{m}</li>)}</ul>
          </div>
        )}
        {completed && <p className="mt-8 rounded-xl bg-success/10 p-4 text-sm font-semibold text-success">Lesson complete ✓</p>}

        {rules.read && !ctx.preview && <div className="mt-6"><ReadButton lessonId={lesson.id} alreadyRead={Boolean(progress?.readAt)} waitSeconds={Math.max(0, minReadSeconds(lesson.estimatedMinutes) - Math.floor((Date.now() - (progress?.startedAt.getTime() ?? Date.now())) / 1000))} /></div>}

        {quiz && (
          <div className="mt-8">
            {ctx.preview
              ? <p className="rounded-xl bg-surface p-4 text-sm ring-1 ring-border-soft">Lesson quiz (preview): learners answer it here.</p>
              : <QuizRunner quizId={quiz.id} label={quiz.title} intro={`Pass mark ${quiz.passPercent}%. You can retake it any time.`} bestPercent={quizStats && quizStats._count > 0 ? quizStats._max.percent : null} passed={Boolean(progress?.quizPassedAt)} />}
          </div>
        )}

        {lesson.challenges.map((c) => (
          <div key={c.id} className="mt-8">
            <ChallengeRunner challengeId={c.id} title={c.title} language={c.language} difficulty={c.difficulty} statement={c.statement} starterCode={c.starterCode}
              tests={publicTests(c.tests as unknown as ChallengeTest[])} hints={c.hints as unknown as string[]} points={c.points} alreadyPassed={passedChallengeIds.has(c.id)} />
          </div>
        ))}

        {lesson.assignments.map((a) => {
          const sub = a.submissions[0];
          return (
            <section key={a.id} className="mt-8 rounded-2xl border border-border-soft bg-surface p-5 sm:p-6">
              <h2 className="text-lg font-bold">{a.title}</h2>
              <Markdown source={a.brief} className="mt-1" />
              {a.rubric && <p className="mt-3 text-xs text-muted">Marking guide: {a.rubric}</p>}
              {!ctx.preview && <AssignmentForm assignmentId={a.id} status={sub?.status ?? null} feedback={sub?.feedback ?? null} initialContent={sub?.content ?? ""} initialLink={sub?.linkUrl ?? ""} />}
            </section>
          );
        })}

        {structure.course.aiCoachEnabled && !ctx.preview && <div className="mt-10"><CoachPanel courseSlug={slug} lessonId={lesson.id} /></div>}

        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-border-soft pt-6">
          {idx > 0 ? <Link href={`/courses/${slug}/learn/${order[idx - 1].slug}`} className="text-sm font-semibold text-brand-600">← {order[idx - 1].title}</Link> : <span />}
          {completed || ctx.preview
            ? nextLesson
              ? <Link href={`/courses/${slug}/learn/${nextLesson.slug}`} className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white">Next: {nextLesson.title} →</Link>
              : structure.finalQuizId && <Link href={`/courses/${slug}/assessment`} className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white">Final assessment →</Link>
            : <p className="text-xs text-muted">Finish the steps above to unlock the next lesson.</p>}
        </div>
      </article>
    </Shell>
  );
}

// ---------------------------------------------------------------------------------------------------------------

export async function LmsAssessmentView({ slug }: { slug: string }) {
  const ctx = await requireContext(slug, `/courses/${slug}/assessment`);
  if (!ctx.access.allowed) return <Section className="pt-14"><Container><LockedPanel ctx={ctx} /></Container></Section>;
  const { structure, state, user } = ctx;
  if (!structure.finalQuizId) notFound();
  const quiz = await prisma.quiz.findUnique({ where: { id: structure.finalQuizId }, include: { _count: { select: { questions: { where: { archivedAt: null } } } } } });
  if (!quiz) notFound();
  const pass = structure.course.passPercent;
  const cert = user && !ctx.preview ? await prisma.certificate.findUnique({ where: { userId_courseId: { userId: user.id, courseId: structure.course.id } } }) : null;

  return (
    <Shell ctx={ctx} wide={false}>
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Final assessment</h1>
      <p className="mt-2 text-muted">{structure.course.title}</p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
        <li>Pass mark: <strong>{pass}%</strong>. Your certificate unlocks when you reach it.</li>
        <li>{quiz.questionCount ?? quiz._count.questions} questions{quiz.timeLimitMinutes ? `, ${quiz.timeLimitMinutes} minutes` : ", no time limit"}.</li>
        <li>{quiz.maxAttempts ? `${quiz.maxAttempts} attempts allowed${state ? ` (${state.finalAttempts} used)` : ""}.` : "Unlimited attempts."}{quiz.cooldownMinutes ? ` Wait ${quiz.cooldownMinutes} minutes between attempts.` : ""}</li>
      </ul>

      {!ctx.preview && state && !state.view.finalUnlocked ? (
        <p role="status" className="mt-6 rounded-xl bg-surface p-4 text-sm ring-1 ring-border-soft">{state.view.finalLockReason}</p>
      ) : ctx.preview ? (
        <p className="mt-6 rounded-xl bg-surface p-4 text-sm ring-1 ring-border-soft">Preview: learners take the assessment here.</p>
      ) : (
        <div className="mt-6">
          <QuizRunner quizId={quiz.id} label="Begin the final assessment" intro={`Answer every question, then submit. You need ${pass}% to pass.`} bestPercent={state?.finalBestPercent ?? null} passed={state?.view.finalPassed} />
        </div>
      )}

      {state && (
        <section className="mt-10 rounded-2xl border border-border-soft bg-surface p-5 sm:p-6">
          <h2 className="text-lg font-bold">Certificate</h2>
          {state.view.certificateEligible || cert ? (
            <>
              <p className="mt-1 text-sm text-success">Requirements met{cert ? ` · serial ${cert.serial}` : ""}. Enter your name as it should appear.</p>
              <CertificateDownload slug={slug} defaultName={user!.name} />
            </>
          ) : (
            <p className="mt-1 text-sm text-muted" role="status">{state.view.certificateLockReason}</p>
          )}
        </section>
      )}
    </Shell>
  );
}
