import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FadeIn, ProgressBar } from "@/components/dashboard/DashboardShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { Avatar } from "@/components/ui/Avatar";
import { EmailVerificationNotice } from "@/components/dashboard/EmailVerificationNotice";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedReward } from "@/components/ui/icons/AnimatedReward";
import { AnimatedSparkle } from "@/components/ui/icons/AnimatedSparkle";
import { AnimatedCalendar } from "@/components/ui/icons/AnimatedCalendar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CourseIconKey } from "@/lib/courseIcons";
import { recordDailyActivity, getStreakSummary, toDayKey } from "@/lib/streak";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Visiting the dashboard counts as the day's activity â€” sessions last 30
  // days, so most days never touch the login route. Idempotent per day.
  await recordDailyActivity(user.id);

  const streak = await getStreakSummary(user.id);
  const [enrollments, applications, projects, bookings] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId: user.id, status: { not: "cancelled" } }, include: { course: true }, orderBy: { enrolledAt: "desc" } }),
    prisma.internshipApplication.findMany({ where: { userId: user.id, status: "accepted" }, include: { internship: true }, orderBy: { appliedAt: "desc" } }),
    prisma.project.findMany({ where: { userId: user.id }, include: { mentor: true }, orderBy: { updatedAt: "desc" } }),
    prisma.tutoringBooking.findMany({ where: { userId: user.id }, include: { tutor: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlines = [
    ...projects
      .filter((p) => p.dueDate && p.dueDate >= today)
      .map((p) => ({ label: `Project: ${p.title}`, date: p.dueDate as Date })),
  ]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const activitiesExist = enrollments.length + applications.length + projects.length > 0;
  const stats: { iconKey: CourseIconKey; label: string; value: number }[] = [
    ...(enrollments.length ? [{ iconKey: "student" as const, label: "Courses enrolled", value: enrollments.length }] : []),
    ...(applications.length ? [{ iconKey: "career" as const, label: "Internships joined", value: applications.length }] : []),
    ...(projects.length ? [{ iconKey: "webdev" as const, label: "Projects", value: projects.length }] : []),
  ];

  return (
    <Section className="py-10 sm:py-12">
      <Container>
        <FadeIn id="profile" className="scroll-mt-24 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} avatarColor={user.avatarColor} avatarUrl={user.avatarUrl} size={56} className="rounded-2xl text-lg" />
            <div>
              <h1 className="text-xl font-semibold">Welcome back, {user.name.split(" ")[0]}</h1>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>
          {user.grade && (
            <span className="rounded-full bg-surface-2 px-4 py-2 text-sm font-medium">
              {user.grade} Â· {user.board}
            </span>
          )}
        </FadeIn>

        {!user.emailVerified && <FadeIn delay={0.05}><EmailVerificationNotice email={user.email} /></FadeIn>}

        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4 sm:gap-5">
          {stats.map((s, i) => (
            <FadeIn key={s.label} delay={0.1 + i * 0.06}>
              <Card className="flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <IconBadge size="lg" className="text-brand-500 dark:text-brand-400">
                  <ContentIcon keyword={s.iconKey} className="h-10.5 w-10.5" />
                </IconBadge>
                <div>
                  <p className="text-2xl font-semibold">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </div>
              </Card>
            </FadeIn>
          ))}
          <FadeIn delay={0.28}>
            <Card className="flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <IconBadge size="lg">
                <AnimatedFlame className="h-9.5 w-9.5" />
              </IconBadge>
              <div>
                <p className="text-2xl font-semibold">{streak.currentStreak}</p>
                <p className="text-xs text-muted">Day streak</p>
              </div>
            </Card>
          </FadeIn>
          <FadeIn delay={0.34}>
            <Card className="flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <IconBadge size="lg">
                <AnimatedReward className="h-9.5 w-9.5" />
              </IconBadge>
              <div>
                <p className="text-2xl font-semibold">{streak.points.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted">Reward points</p>
              </div>
            </Card>
          </FadeIn>
        </div>

        {!activitiesExist && (
          <FadeIn delay={0.15} className="mt-10">
            <Card className="p-7 sm:p-9">
              <h2 className="text-lg font-semibold">Your learning and work activities will appear here.</h2>
              <p className="mt-2 text-sm text-muted">Explore an opportunity to get started.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href="/courses" variant="secondary" size="sm">Explore courses</Button>
                <Button href="/internships" variant="secondary" size="sm">Explore internships</Button>
                <Button href="/projects" variant="secondary" size="sm">Explore projects</Button>
              </div>
            </Card>
          </FadeIn>
        )}

        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
          <div className="flex min-w-0 flex-col gap-6">
            {enrollments.length > 0 && <FadeIn delay={0.15}>
              <h2 className="mb-4 font-semibold">My courses</h2>
              <div className="flex flex-col gap-3">
                  {enrollments.map((e) => (
                    <Link key={e.id} href={`/courses/${e.course.slug}`} aria-label={`Continue ${e.course.title}`} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
                    <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{e.course.title}</p>
                          <p className="truncate text-xs text-muted">{e.course.category} · {e.progress >= 100 ? "Completed" : e.progress > 0 ? "In progress" : "Registered"}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <div className="relative grid h-12 w-12 place-items-center sm:h-14 sm:w-14" role="img" aria-label={`${e.course.title}: ${Math.min(100, Math.max(0, e.progress))}% complete`}>
                            <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
                              <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-surface-2" />
                              <circle cx="24" cy="24" r="20" fill="none" stroke={`hsl(${Math.round(120 * Math.min(100, Math.max(0, e.progress)) / 100)} 72% 42%)`} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - Math.min(100, Math.max(0, e.progress)) / 100)}`} className="transition-[stroke-dashoffset] duration-700" />
                            </svg>
                            <span className="text-[11px] font-bold tabular-nums">{Math.min(100, Math.max(0, e.progress))}%</span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-brand-500" aria-hidden="true" />
                        </div>
                      </div>
                    </Card>
                    </Link>
                  ))}
              </div>
            </FadeIn>}

            {projects.length > 0 && <FadeIn delay={0.2}>
              <h2 className="mb-4 font-semibold">My projects</h2>
                <div className="flex flex-col gap-3">
                  {projects.map((p) => (
                    <Link key={p.id} href={`/dashboard/projects/${p.id}`} aria-label={`View project ${p.title}`} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"><Card className="p-5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{p.title}</p>
                          {p.mentor && <p className="text-xs text-muted">Mentor: {p.mentor.name}</p>}
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="mt-3">
                        <ProgressBar value={p.progress} color="var(--accent-500)" />
                      </div>
                      {p.feedback && (
                        <p className="mt-3 rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm text-muted">
                          &ldquo;{p.feedback}&rdquo;
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-600">View project <ArrowRight className="h-4 w-4" /></span>
                    </Card></Link>
                  ))}
                </div>
            </FadeIn>}

            {applications.length > 0 && <FadeIn delay={0.25}>
              <h2 className="mb-4 font-semibold">My internships</h2>
                <div className="flex flex-col gap-3">
                  {applications.map((a) => (
                    <Link key={a.id} href={`/internships/${a.internship.slug}`} aria-label={`View internship ${a.internship.title}`} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"><Card className="flex items-center justify-between gap-4 p-5 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                      <div>
                        <p className="font-medium">{a.internship.title}</p>
                        <p className="text-xs text-muted">{a.internship.company}</p>
                      </div>
                      <span className="inline-flex items-center gap-2"><StatusBadge status={a.status} /><ArrowRight className="h-4 w-4 text-brand-500" /></span>
                    </Card></Link>
                  ))}
                </div>
            </FadeIn>}
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <FadeIn delay={0.12}>
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <AnimatedFlame className="h-5.5 w-5.5" /> Login streak
              </h2>
              <Card className="p-5">
                <StreakCalendar
                  activeDays={streak.activeDays}
                  todayKey={toDayKey()}
                  currentStreak={streak.currentStreak}
                  longestStreak={streak.longestStreak}
                />
              </Card>
            </FadeIn>

            <FadeIn delay={0.16}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-1 py-1 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 [&::-webkit-details-marker]:hidden">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300"><AnimatedReward className="h-5 w-5" /></span>
                  <span>Recent rewards</span>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted">{streak.transactions.length}</span>
                  <span className="ml-auto text-xs font-medium text-brand-600 group-open:hidden dark:text-brand-300">View rewards</span>
                  <span className="ml-auto hidden text-xs font-medium text-muted group-open:inline">Hide rewards</span>
                </summary>
                <Card className="mt-3 overflow-hidden border-brand-500/10 bg-gradient-to-br from-brand-500/[0.06] via-surface to-surface p-0">
                  {streak.transactions.length === 0 ? (
                    <p className="p-4 text-sm text-muted">Your points and course rewards will appear here.</p>
                  ) : (
                    <ul aria-label="Recent reward history" tabIndex={0} className="max-h-[10.5rem] divide-y divide-border-soft overflow-y-auto overscroll-contain px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-400">
                      {streak.transactions.map((t) => (
                        <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{t.label}</p>
                            <p className="mt-0.5 text-xs text-muted">{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                          </div>
                          <span className="shrink-0 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-600 dark:text-brand-300">+{t.amount} pts</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </details>
            </FadeIn>


            {deadlines.length > 0 && <FadeIn delay={0.15}>
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <AnimatedCalendar className="h-5.5 w-5.5 transition-transform duration-300 hover:scale-110" /> Upcoming deadlines
              </h2>
              <Card className="p-5">
                <ul className="flex flex-col gap-3.5">
                    {deadlines.map((d, i) => (
                      <li key={i} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted">{d.label}</span>
                        <span className="shrink-0 font-medium">
                          {d.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </li>
                    ))}
                </ul>
              </Card>
            </FadeIn>}

            {bookings.length > 0 && <FadeIn delay={0.2}>
              <h2 className="mb-4 font-semibold">Tutoring bookings</h2>
              <Card className="p-5">
                <ul className="flex flex-col gap-4">
                    {bookings.map((b) => (
                      <li key={b.id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{b.tutor.name}</p>
                          <p className="text-xs text-muted">{b.subject} Â· {b.preferredSlot}</p>
                        </div>
                        <StatusBadge status={b.status} />
                      </li>
                    ))}
                </ul>
              </Card>
            </FadeIn>}
          </div>
        </div>

      </Container>
    </Section>
  );
}

