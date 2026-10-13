import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Section, Container } from "@/components/ui/Section";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Counter } from "@/components/pages/PageHeroVisuals";
import type { Badge } from "@/components/dashboard/LearningBadges";
import { ProgressHub } from "@/components/dashboard/ProgressHub";
import { getLeaderboard } from "@/lib/leaderboard";
import { CourseIconThumb } from "@/components/courses/CourseIconThumb";
import { FadeIn, ProgressBar } from "@/components/dashboard/DashboardShell";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { Avatar } from "@/components/ui/Avatar";
import { EmailVerificationNotice } from "@/components/dashboard/EmailVerificationNotice";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedReward } from "@/components/ui/icons/AnimatedReward";
import { AnimatedCalendar } from "@/components/ui/icons/AnimatedCalendar";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CourseIconKey } from "@/lib/courseIcons";
import { recordDailyActivity, getStreakSummary, toDayKey } from "@/lib/streak";
import { DownloadCertificate } from "@/components/courses/DownloadCertificate";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Visiting the dashboard counts as the day's activity: sessions last 30
  // days, so most days never touch the login route. Idempotent per day.
  await recordDailyActivity(user.id);

  const streak = await getStreakSummary(user.id);
  const [leaderboardWeek, leaderboardAll] = await Promise.all([getLeaderboard(user.id, 7), getLeaderboard(user.id)]);
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

  const completed = enrollments.filter((e) => e.progress >= 100).length;
  const badges: Badge[] = [
    { id: "first-step", title: "First step", description: "Enrol in your first course.", icon: "student", current: enrollments.length, target: 1, color: "#2563eb" },
    { id: "explorer", title: "Explorer", description: "Enrol in three courses.", icon: "ai", current: enrollments.length, target: 3, color: "#7c3aed" },
    { id: "finisher", title: "Finisher", description: "Complete a course.", icon: "leader", current: completed, target: 1, color: "#059669" },
    { id: "spark", title: "Spark", description: "Reach a 3-day login streak.", icon: "flame", current: streak.longestStreak, target: 3, color: "#f97316" },
    { id: "week", title: "Week warrior", description: "Reach a 7-day login streak.", icon: "flame", current: streak.longestStreak, target: 7, color: "#ea580c" },
    { id: "habit", title: "Habit builder", description: "Reach a 30-day login streak.", icon: "flame", current: streak.longestStreak, target: 30, color: "#dc2626" },
    { id: "points", title: "Point collector", description: "Earn 100 reward points.", icon: "reward", current: streak.points, target: 100, color: "#d97706" },
    { id: "hunter", title: "Reward hunter", description: "Earn 500 reward points.", icon: "reward", current: streak.points, target: 500, color: "#e11d48" },
    { id: "builder", title: "Builder", description: "Start a project with a mentor.", icon: "webdev", current: projects.length, target: 1, color: "#0891b2" },
    { id: "intern", title: "Intern", description: "Join an internship.", icon: "career", current: applications.length, target: 1, color: "#16a34a" },
  ];
  const lastPoints = streak.transactions[0];
  const firstName = user.name.split(" ")[0];
  const continueCourse = enrollments.find((e) => e.progress < 100) ?? enrollments[0];
  const card = "rounded-3xl border border-border-soft bg-surface";
  const hover = "transition-all duration-300 hover:-translate-y-1 hover:border-story-royal/40 hover:shadow-[var(--shadow-soft)]";

  return (
    <Section className="py-8 sm:py-12">
      <Container>
        {/* Welcome */}
        <FadeIn id="profile" className="scroll-mt-24 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} avatarColor={user.avatarColor} avatarUrl={user.avatarUrl} size={64} className="rounded-full text-xl shadow-md" />
            <div className="min-w-0">
              <span className="story-eyebrow">Dashboard</span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-story-navy sm:text-3xl dark:text-foreground">Welcome back, {firstName}</h1>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user.grade && <span className="rounded-full border border-border-soft px-4 py-2 text-sm font-semibold">{user.grade}{user.board ? ` · ${user.board}` : ""}</span>}
            {continueCourse && <ArrowLink href={`/courses/${continueCourse.course.slug}`}>Continue learning</ArrowLink>}
          </div>
        </FadeIn>

        {!user.emailVerified && <FadeIn delay={0.05}><EmailVerificationNotice email={user.email} /></FadeIn>}

        {/* Streak and rewards */}
        <div className="mt-8 grid gap-4 sm:gap-5 md:grid-cols-2">
          <FadeIn delay={0.08}>
            <div className={`${card} ${hover} flex items-center gap-5 p-5 sm:p-6`}>
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-orange-500/10"><AnimatedFlame className="h-14 w-14" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Day streak</p>
                <p className="mt-0.5 text-4xl font-bold tabular-nums text-story-navy dark:text-foreground"><Counter value={streak.currentStreak} /></p>
                <p className="mt-1 text-xs text-muted">Longest streak: <span className="font-semibold text-foreground">{streak.longestStreak} {streak.longestStreak === 1 ? "day" : "days"}</span></p>
              </div>
              <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex" aria-hidden>
                <div className="flex gap-1">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span key={i} className={`h-6 w-1.5 rounded-full ${i < Math.min(streak.currentStreak, 7) ? "bg-orange-500" : "bg-border-soft"}`} />
                  ))}
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">This week</span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.14}>
            <div className={`${card} ${hover} flex items-center gap-5 p-5 sm:p-6`}>
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-story-royal/10"><AnimatedReward className="h-14 w-14" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">Reward points</p>
                <p className="mt-0.5 text-4xl font-bold tabular-nums text-story-navy dark:text-foreground"><Counter value={streak.points} /></p>
                <p className="mt-1 truncate text-xs text-muted">{lastPoints ? <>Latest: <span className="font-semibold text-foreground">+{lastPoints.amount} pts</span> · {lastPoints.label}</> : "Earn points by learning every day"}</p>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Activity counts */}
        {stats.length > 0 && (
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(min(100%,13rem),1fr))] gap-4 sm:mt-5 sm:gap-5">
            {stats.map((st, i) => (
              <FadeIn key={st.label} delay={0.2 + i * 0.06}>
                <div className={`${card} ${hover} flex items-center gap-4 p-4`}>
                  <IconBadge size="sm" className="!h-12 !w-12"><ContentIcon keyword={st.iconKey} className="h-10 w-10" /></IconBadge>
                  <div>
                    <p className="text-2xl font-bold tabular-nums text-story-navy dark:text-foreground"><Counter value={st.value} /></p>
                    <p className="text-xs text-muted">{st.label}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}

        {!activitiesExist && (
          <FadeIn delay={0.15} className="mt-10">
            <div className={`${card} p-7 sm:p-9`}>
              <h2 className="text-lg font-bold text-story-navy dark:text-foreground">Your learning and work activities will appear here.</h2>
              <p className="mt-2 text-sm text-muted">Explore an opportunity to get started.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {[["/courses", "Explore courses"], ["/internships", "Explore internships"], ["/projects", "Explore projects"]].map(([href, label]) => (
                  <Link key={href} href={href} className="rounded-full border border-border-soft px-5 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:border-story-royal hover:text-story-royal active:scale-95">{label}</Link>
                ))}
              </div>
            </div>
          </FadeIn>
        )}

        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
          <div className="flex min-w-0 flex-col gap-8">
            {enrollments.length > 0 && <FadeIn delay={0.15}>
              <h2 className="mb-4 text-lg font-bold text-story-navy dark:text-foreground">My courses</h2>
              <div className="flex flex-col gap-3">
                {enrollments.map((e) => {
                  const pct = Math.min(100, Math.max(0, e.progress));
                  return (
                    <div key={e.id} className={`${card} ${hover} p-4 sm:p-5`}>
                      <Link href={`/courses/${e.course.slug}`} aria-label={`Continue ${e.course.title}`} className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal">
                        <div className="flex items-center gap-4">
                          <CourseIconThumb category={e.course.category} title={e.course.title} variant="round" className="h-12 w-12 shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold">{e.course.title}</p>
                            <p className="truncate text-xs text-muted">{e.course.category} · {pct >= 100 ? "Completed" : pct > 0 ? "In progress" : "Registered"}</p>
                            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-story-mist" role="img" aria-label={`${e.course.title}: ${pct}% complete`}>
                              <div className="h-full rounded-full bg-story-royal transition-[width] duration-700" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-bold tabular-nums text-story-royal">{pct}%</span>
                          <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-story-mist text-story-royal transition-all duration-300 group-hover:translate-x-1 group-hover:bg-story-royal group-hover:text-white"><ArrowRight className="h-4 w-4" /></span>
                        </div>
                      </Link>
                      {e.course.price === 0 && e.progress >= 100 && <DownloadCertificate courseSlug={e.course.slug} courseTitle={e.course.title} />}
                    </div>
                  );
                })}
              </div>
            </FadeIn>}

            {projects.length > 0 && <FadeIn delay={0.2}>
              <h2 className="mb-4 text-lg font-bold text-story-navy dark:text-foreground">My projects</h2>
              <div className="flex flex-col gap-3">
                {projects.map((p) => (
                  <Link key={p.id} href={`/dashboard/projects/${p.id}`} aria-label={`View project ${p.title}`} className={`group block ${card} ${hover} p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal sm:p-5`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.title}</p>
                        {p.mentor && <p className="text-xs text-muted">Mentor: {p.mentor.name}</p>}
                      </div>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="mt-3"><ProgressBar value={p.progress} color="var(--story-royal)" /></div>
                    {p.feedback && <p className="mt-3 border-l-2 border-story-royal/40 pl-3 text-sm italic text-muted">&ldquo;{p.feedback}&rdquo;</p>}
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-story-royal">View project <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></span>
                  </Link>
                ))}
              </div>
            </FadeIn>}

            {applications.length > 0 && <FadeIn delay={0.25}>
              <h2 className="mb-4 text-lg font-bold text-story-navy dark:text-foreground">My internships</h2>
              <div className="flex flex-col gap-3">
                {applications.map((a) => (
                  <Link key={a.id} href={`/internships/${a.internship.slug}`} aria-label={`View internship ${a.internship.title}`} className={`group flex items-center justify-between gap-4 ${card} ${hover} p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-story-royal sm:p-5`}>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{a.internship.title}</p>
                      <p className="text-xs text-muted">{a.internship.company}</p>
                    </div>
                    <span className="inline-flex items-center gap-2"><StatusBadge status={a.status} /><ArrowRight className="h-4 w-4 text-story-royal transition-transform duration-300 group-hover:translate-x-1" /></span>
                  </Link>
                ))}
              </div>
            </FadeIn>}
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <FadeIn delay={0.12}>
              <ProgressHub
                streak={{ activeDays: streak.activeDays, todayKey: toDayKey(), currentStreak: streak.currentStreak, longestStreak: streak.longestStreak }}
                badges={badges}
                week={leaderboardWeek}
                all={leaderboardAll}
              />
            </FadeIn>

            <FadeIn delay={0.16}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-story-navy dark:text-foreground">
                <AnimatedReward className="h-6 w-6" /> Recent rewards
                <span className="rounded-full bg-story-mist px-2 py-0.5 text-[11px] font-semibold text-muted">{streak.transactions.length}</span>
              </h2>
              <div className={`${card} overflow-hidden`}>
                {streak.transactions.length === 0 ? (
                  <p className="p-5 text-sm text-muted">Your points and course rewards will appear here.</p>
                ) : (
                  <ul aria-label="Recent reward history" tabIndex={0} className="max-h-72 divide-y divide-border-soft overflow-y-auto overscroll-contain px-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-story-royal">
                    {streak.transactions.map((t) => (
                      <li key={t.id} className="group flex items-center gap-3 py-3 text-sm">
                        <span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-story-mist text-story-royal transition-transform duration-300 group-hover:scale-110"><AnimatedReward className="h-5 w-5" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{t.label}</p>
                          <p className="mt-0.5 text-xs text-muted">{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-story-royal/10 px-2.5 py-1 text-xs font-bold text-story-royal">+{t.amount} pts</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </FadeIn>

            {deadlines.length > 0 && <FadeIn delay={0.15}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-story-navy dark:text-foreground">
                <AnimatedCalendar className="h-6 w-6" /> Upcoming deadlines
              </h2>
              <div className={`${card} p-5`}>
                <ul className="flex flex-col gap-3.5">
                  {deadlines.map((d, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted">{d.label}</span>
                      <span className="shrink-0 rounded-full bg-story-mist px-2.5 py-1 text-xs font-semibold">{d.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>}

            {bookings.length > 0 && <FadeIn delay={0.2}>
              <h2 className="mb-4 text-lg font-bold text-story-navy dark:text-foreground">Tutoring bookings</h2>
              <div className={`${card} p-5`}>
                <ul className="flex flex-col gap-4">
                  {bookings.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{b.tutor.name}</p>
                        <p className="text-xs text-muted">{b.subject} · {b.preferredSlot}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>}
          </div>
        </div>
      </Container>
    </Section>
  );
}
