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
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { CourseProgressRing } from "@/components/courses/CourseProgressRing";
import { ArrowRight, Award, BookOpenCheck, ChevronRight, Sparkles } from "lucide-react";
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

function Shell({ ctx, children, activeLessonId, wide = true, card = false, crumb, chip, status }: { ctx: LmsContext; children: React.ReactNode; activeLessonId?: string; wide?: boolean; card?: boolean; crumb?: string; chip?: string; status?: string }) {
  const { structure, state, user } = ctx;
  const slug = structure.course.slug;
  const percent = state?.view.percent ?? 0;
  const crumbCls = "rounded-full px-2.5 py-1 font-medium text-muted transition-colors hover:bg-story-mist hover:text-story-royal";
  return (
    <Section className="pt-6 pb-16 sm:pt-8">
      <Container className="max-w-7xl">
        <Reveal>
          <div className="flex flex-col gap-3 rounded-3xl border border-border-soft bg-surface px-4 py-3.5 shadow-[var(--shadow-soft)] sm:px-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-x-0.5 gap-y-1 text-xs">
                <Link href="/" className={crumbCls}>Home</Link><ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted" />
                <Link href="/courses" className={`${crumbCls} hidden sm:inline-block`}>Courses</Link><ChevronRight aria-hidden className="hidden h-3.5 w-3.5 shrink-0 text-muted sm:block" />
                <Link href={`/courses/${slug}`} className={`${crumbCls} max-w-[11rem] truncate font-semibold text-story-royal`}>{structure.course.title}</Link>
                {crumb && <><ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-muted" /><span aria-current="page" className="max-w-[12rem] truncate rounded-full bg-story-royal/10 px-2.5 py-1 font-bold text-story-royal sm:max-w-xs">{crumb}</span></>}
              </nav>
              {user && <p className="mt-1.5 pl-1 text-xs text-muted">Welcome back, {user.name} · Your learning workspace</p>}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link href="/leaderboard" className="rounded-full border border-border-soft px-4 py-2 text-center text-xs font-semibold transition-all hover:-translate-y-0.5 hover:border-story-royal hover:text-story-royal">Leaderboard</Link>
              {chip && <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-story-royal px-4 py-2 text-xs font-bold text-white"><BookOpenCheck className="h-4 w-4" />{chip}</span>}
            </div>
          </div>
        </Reveal>

        {state && (
          <div className="mt-4 px-1">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
              <span><span className="font-semibold">Course progress</span> <span className="text-muted">{state.view.requiredDone} of {state.view.requiredTotal} lessons · {percent}%</span></span>
              {status && <span className="text-muted">{status}</span>}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-story-mist" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Course progress">
              <div className="h-full rounded-full bg-story-royal transition-[width] duration-700" style={{ width: `${percent}%` }} />
            </div>
          </div>
        )}
        {ctx.preview && <p role="status" className="mt-4 rounded-2xl bg-amber-50 px-4 py-2.5 text-sm text-amber-900">Administrator preview: your progress is not recorded.</p>}

        <div className={`mt-5 grid gap-6 ${wide ? "lg:grid-cols-[19rem_minmax(0,1fr)]" : ""}`}>
          <aside className="order-2 rounded-3xl border border-border-soft bg-surface p-4 sm:p-5 lg:order-1 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
            <p className="mb-4 border-b border-border-soft pb-3 text-base font-bold text-story-navy dark:text-foreground">{structure.course.title}</p>
            <Outline structure={structure} view={state?.view ?? null} activeLessonId={activeLessonId} />
            <FinalRow ctx={ctx} />
          </aside>
          <main className={`order-1 min-w-0 lg:order-2 ${card ? "rounded-3xl border border-border-soft bg-surface p-5 sm:p-8 lg:p-10" : ""}`}>{children}</main>
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
    <div className="mt-6 rounded-2xl bg-story-mist p-4 text-sm">
      <p className="font-bold">Final assessment</p>
      {v?.finalUnlocked || ctx.preview
        ? <Link href={`/courses/${structure.course.slug}/assessment`} className="mt-2 inline-block rounded-full bg-story-royal px-4 py-1.5 text-xs font-semibold text-white">{v?.finalPassed ? "Review result" : "Open assessment"}</Link>
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
  const info = await prisma.course.findUnique({ where: { slug }, select: { category: true, description: true, durationWeeks: true } });
  const next = state?.view.nextLessonId ? structure.lessons.find((l) => l.id === state.view.nextLessonId) : structure.lessons[0];
  const done = state?.view.allRequiredLessonsDone;
  const percent = state?.view.percent ?? 0;
  const lessonView = new Map(state?.view.lessons.map((l) => [l.id, l]));
  const completed = state?.view.lessons.filter((l) => l.status === "completed").length ?? 0;
  const minutesLeft = structure.lessons.filter((l) => lessonView.get(l.id)?.status !== "completed").reduce((t, l) => t + l.estimatedMinutes, 0);
  const nextModule = next ? structure.modules.find((m) => m.id === next.moduleId) : null;
  const stats: [string, string][] = [
    ["Progress", `${percent}%`],
    ["Lessons done", `${completed}/${structure.lessons.length}`],
    ["Time left", minutesLeft >= 60 ? `≈ ${Math.round(minutesLeft / 60)} h` : `${minutesLeft} min`],
    ["Final test", state?.view.finalPassed ? "Passed" : structure.finalQuizId ? "Pending" : "None"],
  ];
  return (
    <Shell ctx={ctx} crumb="Learn" chip={`${structure.lessons.length} lessons`}>
      <Reveal>
        <div className="flex flex-wrap items-center gap-5 rounded-3xl border border-border-soft bg-surface p-5 sm:p-6">
          <CourseIconThumb category={info?.category ?? ""} title={structure.course.title} variant="round" className="h-20 w-20 shrink-0 sm:h-24 sm:w-24" />
          <div className="min-w-0 flex-1">
            <span className="story-eyebrow">{info?.category ?? "Your course"}</span>
            <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-story-navy sm:text-3xl dark:text-foreground">{structure.course.title}</h1>
            {info?.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{info.description}</p>}
          </div>
          {state && <div className="shrink-0 rounded-2xl bg-story-mist p-4"><CourseProgressRing percent={percent} label="Your progress" sublabel={`${state.view.requiredDone} of ${state.view.requiredTotal} required lessons`} /></div>}
        </div>
      </Reveal>

      <RevealGroup className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.07}>
        {stats.map(([label, value]) => (
          <RevealItem key={label}>
            <div className="rounded-2xl border border-border-soft bg-surface p-4 transition-all duration-300 hover:-translate-y-1 hover:border-story-royal/40 hover:shadow-[var(--shadow-soft)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{label}</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-story-navy dark:text-foreground">{value}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      {!done && next && (
        <Reveal delay={0.05} className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-story-royal p-5 text-white sm:p-6">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75"><Sparkles className="h-3.5 w-3.5" />{state && state.view.requiredDone > 0 ? "Up next" : "Start here"}</p>
              <p className="mt-1.5 text-lg font-bold leading-snug sm:text-xl">{next.title}</p>
              <p className="mt-1 text-sm text-white/80">{nextModule ? `${nextModule.title} · ` : ""}{next.estimatedMinutes} min</p>
            </div>
            <ArrowLink href={`/courses/${slug}/learn/${next.slug}`} tone="light">{state && state.view.requiredDone > 0 ? "Continue learning" : "Start learning"}</ArrowLink>
          </div>
        </Reveal>
      )}

      <section className="mt-10" aria-labelledby="hub-modules">
        <Reveal><span className="story-eyebrow">Your path</span></Reveal>
        <h2 id="hub-modules" className="story-subheading mt-3 text-story-navy dark:text-foreground">Modules</h2>
        <RevealGroup className="mt-5 grid gap-3 sm:grid-cols-2" stagger={0.07}>
          {structure.modules.map((m, i) => {
            const lessons = structure.lessons.filter((l) => l.moduleId === m.id).sort((x, y) => x.position - y.position);
            const mp = state?.view.modules.find((x) => x.id === m.id)?.percent ?? 0;
            const first = lessons.find((l) => lessonView.get(l.id)?.status !== "locked" && lessonView.get(l.id)?.status !== "completed") ?? lessons.find((l) => lessonView.get(l.id)?.status !== "locked") ?? lessons[0];
            const isNextModule = next?.moduleId === m.id;
            return (
              <RevealItem key={m.id}>
                <Link href={first ? `/courses/${slug}/learn/${first.slug}` : `/courses/${slug}/learn`} className={`group block h-full rounded-3xl border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-soft)] ${isNextModule ? "border-story-royal/50" : "border-border-soft hover:border-story-royal/40"}`}>
                  <div className="flex items-start gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ${mp === 100 ? "bg-story-royal text-white" : "bg-story-mist text-story-royal"}`}>{mp === 100 ? "✓" : String(i + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-snug text-story-navy dark:text-foreground">{m.title}</p>
                      {m.summary && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{m.summary}</p>}
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-story-mist"><div className="h-full rounded-full bg-story-royal transition-[width] duration-700" style={{ width: `${mp}%` }} /></div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                    <span>{lessons.length} lessons · {lessons.reduce((t, l) => t + l.estimatedMinutes, 0)} min</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-story-royal">{mp === 100 ? "Review" : mp > 0 ? "Continue" : "Open"}<ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" /></span>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>

      <Reveal className="mt-8 flex flex-wrap gap-3">
        {(done || ctx.preview) && structure.finalQuizId && <ArrowLink href={`/courses/${slug}/assessment`}>{state?.view.finalPassed ? "Certificate and results" : "Take the final assessment"}</ArrowLink>}
      </Reveal>
      {state && !state.view.certificateEligible && <p className="mt-5 flex items-start gap-3 rounded-2xl bg-story-mist p-4 text-sm"><Award className="mt-0.5 h-5 w-5 shrink-0 text-story-royal" />{state.view.certificateLockReason}</p>}
      {state?.view.certificateEligible && <p className="mt-5 flex items-start gap-3 rounded-2xl bg-success/10 p-4 text-sm text-success"><Award className="mt-0.5 h-5 w-5 shrink-0" /><span>All requirements met. <Link className="font-semibold underline" href={`/courses/${slug}/assessment`}>Download your certificate.</Link></span></p>}
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
        <div className="rounded-3xl border border-border-soft bg-surface p-6 text-center">
          <p className="text-3xl" aria-hidden="true">🔒</p>
          <h1 className="mt-2 text-xl font-bold">{def.title}</h1>
          <p className="mt-2 text-sm text-muted" role="status">{lv.lockReason}</p>
          {open && <Link href={`/courses/${slug}/learn/${open.slug}`} className="mt-5 inline-block rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95">Go to “{open.title}”</Link>}
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
  const currentModule = structure.modules.find((m) => m.id === def.moduleId);
  const currentModuleIndex = structure.modules.findIndex((m) => m.id === def.moduleId);

  const ex = lesson.explainer as ExplainerContent | null;
  const videoData: LessonVideoData | null = ex ? {
    courseTitle: structure.course.title, title: lesson.title, lessonNumber: idx + 1, lessonCount: order.length,
    plain: { simple: ex.simple, analogy: ex.analogy }, visualNodes: ex.nodes, visualSummary: ex.summary, steps: ex.steps ?? [], output: ex.output ?? "", takeaways: ex.takeaways, mistake: ex.mistake,
  } : null;

  return (
    <Shell ctx={ctx} activeLessonId={def.id} card crumb={lesson.title} chip={`Lesson ${idx + 1} of ${order.length}`} status={completed ? "Lesson complete" : "Finish the steps below to complete this lesson"}>
      <article>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-story-royal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-story-royal">{currentModule?.title ?? "Course lesson"}</span>
          <span className="text-xs text-muted">Module {Math.max(0, currentModuleIndex) + 1} of {structure.modules.length} · {lesson.estimatedMinutes} min</span>
          {completed && <span className="rounded-full bg-story-royal px-2.5 py-0.5 text-[11px] font-bold text-white">Completed</span>}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-story-navy sm:text-4xl dark:text-foreground">{lesson.title}</h1>
        {lesson.summary && <p className="mt-3 text-base leading-7 text-muted">{lesson.summary}</p>}

        <div className="mt-6">
          {lesson.videoUrl
            ? <VideoTracker lessonId={lesson.id} url={lesson.videoUrl} initialPercent={progress?.videoPercent ?? 0} minPercent={lesson.videoMinPercent} trackable={rules.video && !ctx.preview && (Boolean(youTubeId(lesson.videoUrl)) || /\.(mp4|webm)(\?|$)/i.test(lesson.videoUrl))} />
            : videoData && <LessonVideo data={videoData} />}
        </div>

        <Markdown source={lesson.contentMd} className="mt-6" cards />

        {!completed && lv && lv.missing.length > 0 && (
          <div className="mt-8 rounded-xl bg-story-mist p-4 text-sm">
            <p className="font-semibold">To complete this lesson:</p>
            <ul className="mt-1 list-disc pl-5">{lv.missing.map((m) => <li key={m}>{m}</li>)}</ul>
          </div>
        )}
        {completed && <p className="mt-8 rounded-2xl bg-success/10 p-4 text-sm font-semibold text-success">Lesson complete ✓</p>}

        {rules.read && !ctx.preview && <div className="mt-6"><ReadButton lessonId={lesson.id} alreadyRead={Boolean(progress?.readAt)} waitSeconds={Math.max(0, minReadSeconds(lesson.estimatedMinutes) - Math.floor((Date.now() - (progress?.startedAt.getTime() ?? Date.now())) / 1000))} /></div>}

        {quiz && (
          <div className="mt-8">
            {ctx.preview
              ? <p className="rounded-2xl bg-story-mist p-4 text-sm">Lesson quiz (preview): learners answer it here.</p>
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
            <section key={a.id} className="mt-8 rounded-3xl border border-border-soft bg-surface p-5 sm:p-6">
              <h2 className="text-lg font-bold">{a.title}</h2>
              <Markdown source={a.brief} className="mt-1" />
              {a.rubric && <p className="mt-3 text-xs text-muted">Marking guide: {a.rubric}</p>}
              {!ctx.preview && <AssignmentForm assignmentId={a.id} status={sub?.status ?? null} feedback={sub?.feedback ?? null} initialContent={sub?.content ?? ""} initialLink={sub?.linkUrl ?? ""} />}
            </section>
          );
        })}

        {structure.course.aiCoachEnabled && !ctx.preview && <div className="mt-10"><CoachPanel courseSlug={slug} lessonId={lesson.id} /></div>}

        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-border-soft pt-6">
          {idx > 0 ? <Link href={`/courses/${slug}/learn/${order[idx - 1].slug}`} className="inline-flex items-center gap-1 rounded-full border border-border-soft px-5 py-2.5 text-sm font-semibold text-story-royal transition-all hover:border-story-royal">← {order[idx - 1].title}</Link> : <span />}
          {completed || ctx.preview
            ? nextLesson
              ? <Link href={`/courses/${slug}/learn/${nextLesson.slug}`} className="rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95">Next: {nextLesson.title} →</Link>
              : structure.finalQuizId && <Link href={`/courses/${slug}/assessment`} className="rounded-full bg-story-royal px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-95">Final assessment →</Link>
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
    <Shell ctx={ctx} wide={false} card crumb="Final assessment" chip="Assessment">
      <span className="story-eyebrow">Course assessment</span>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">Final assessment</h1>
      <p className="mt-2 text-muted">{structure.course.title}</p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
        <li>Pass mark: <strong>{pass}%</strong>. Your certificate unlocks when you reach it.</li>
        <li>{quiz.questionCount ?? quiz._count.questions} questions{quiz.timeLimitMinutes ? `, ${quiz.timeLimitMinutes} minutes` : ", no time limit"}.</li>
        <li>{quiz.maxAttempts ? `${quiz.maxAttempts} attempts allowed${state ? ` (${state.finalAttempts} used)` : ""}.` : "Unlimited attempts."}{quiz.cooldownMinutes ? ` Wait ${quiz.cooldownMinutes} minutes between attempts.` : ""}</li>
      </ul>

      {!ctx.preview && state && !state.view.finalUnlocked ? (
        <p role="status" className="mt-6 rounded-2xl bg-story-mist p-4 text-sm">{state.view.finalLockReason}</p>
      ) : ctx.preview ? (
        <p className="mt-6 rounded-2xl bg-story-mist p-4 text-sm">Preview: learners take the assessment here.</p>
      ) : (
        <div className="mt-6">
          <QuizRunner quizId={quiz.id} label="Begin the final assessment" intro={`Answer every question, then submit. You need ${pass}% to pass.`} bestPercent={state?.finalBestPercent ?? null} passed={state?.view.finalPassed} />
        </div>
      )}

      {state && (
        <section className="mt-10 rounded-3xl border border-border-soft bg-surface p-5 sm:p-6">
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
