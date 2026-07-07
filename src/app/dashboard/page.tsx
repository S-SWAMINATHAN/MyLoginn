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
import { ShieldAlert, Settings as SettingsIcon } from "lucide-react";
import { AnimatedFlame } from "@/components/ui/icons/AnimatedFlame";
import { AnimatedSparkle } from "@/components/ui/icons/AnimatedSparkle";
import { AnimatedCalendar } from "@/components/ui/icons/AnimatedCalendar";
import { AnimatedMail } from "@/components/ui/icons/AnimatedMail";
import { AnimatedPhone } from "@/components/ui/icons/AnimatedPhone";
import type { CourseIconKey } from "@/lib/courseIcons";
import { recordDailyActivity, getStreakSummary, toDayKey } from "@/lib/streak";

export const metadata = { title: "Dashboard — MyLoginn" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Visiting the dashboard counts as the day's activity — sessions last 30
  // days, so most days never touch the login route. Idempotent per day.
  await recordDailyActivity(user.id);

  const streak = await getStreakSummary(user.id);
  const [enrollments, applications, projects, bookings] = await Promise.all([
    prisma.enrollment.findMany({ where: { userId: user.id }, include: { course: true }, orderBy: { enrolledAt: "desc" } }),
    prisma.internshipApplication.findMany({ where: { userId: user.id }, include: { internship: true }, orderBy: { appliedAt: "desc" } }),
    prisma.project.findMany({ where: { userId: user.id }, include: { mentor: true }, orderBy: { updatedAt: "desc" } }),
    prisma.tutoringBooking.findMany({ where: { userId: user.id }, include: { tutor: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const deadlines = [
    ...applications
      .filter((a) => a.status !== "rejected")
      .map((a) => ({ label: `Internship: ${a.internship.title}`, date: a.internship.applyDeadline })),
    ...projects
      .filter((p) => p.dueDate)
      .map((p) => ({ label: `Project: ${p.title}`, date: p.dueDate as Date })),
  ]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const stats: { iconKey: CourseIconKey; label: string; value: number }[] = [
    { iconKey: "student", label: "Courses enrolled", value: enrollments.length },
    { iconKey: "career", label: "Internship applications", value: applications.length },
    { iconKey: "webdev", label: "Active projects", value: projects.filter((p) => p.status !== "completed").length },
  ];

  return (
    <Section className="pt-12">
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
              {user.grade} · {user.board}
            </span>
          )}
        </FadeIn>

        {!user.emailVerified && (
          <FadeIn delay={0.05} className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-amber-500/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-300">
            <ShieldAlert className="h-6.5 w-6.5 shrink-0 animate-pulse" />
            Your email isn&apos;t verified yet. Check your signup verification step to unlock certificates.
          </FadeIn>
        )}

        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
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
                <AnimatedSparkle className="h-9.5 w-9.5" />
              </IconBadge>
              <div>
                <p className="text-2xl font-semibold">{streak.points.toLocaleString("en-IN")}</p>
                <p className="text-xs text-muted">Reward points</p>
              </div>
            </Card>
          </FadeIn>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <FadeIn delay={0.15}>
              <h2 className="mb-4 font-semibold">My courses</h2>
              {enrollments.length === 0 ? (
                <EmptyState label="No courses yet." href="/courses" cta="Browse courses" />
              ) : (
                <div className="flex flex-col gap-3">
                  {enrollments.map((e) => (
                    <Card key={e.id} className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">{e.course.title}</p>
                          <p className="text-xs text-muted">{e.course.category}</p>
                        </div>
                        <span className="text-sm font-semibold text-brand-500">{e.progress}%</span>
                      </div>
                      <div className="mt-3">
                        <ProgressBar value={e.progress} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="mb-4 font-semibold">My projects &amp; mentor feedback</h2>
              {projects.length === 0 ? (
                <EmptyState label="No active projects yet." href="/internships" cta="Explore internships" />
              ) : (
                <div className="flex flex-col gap-3">
                  {projects.map((p) => (
                    <Card key={p.id} className="p-5">
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
                    </Card>
                  ))}
                </div>
              )}
            </FadeIn>

            <FadeIn delay={0.25}>
              <h2 className="mb-4 font-semibold">Internship applications</h2>
              {applications.length === 0 ? (
                <EmptyState label="No applications yet." href="/internships" cta="View internships" />
              ) : (
                <div className="flex flex-col gap-3">
                  {applications.map((a) => (
                    <Card key={a.id} className="flex items-center justify-between gap-4 p-5">
                      <div>
                        <p className="font-medium">{a.internship.title}</p>
                        <p className="text-xs text-muted">{a.internship.company}</p>
                      </div>
                      <StatusBadge status={a.status} />
                    </Card>
                  ))}
                </div>
              )}
            </FadeIn>
          </div>

          <div className="flex flex-col gap-8">
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
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <AnimatedSparkle className="h-5.5 w-5.5" /> Recent rewards
              </h2>
              <Card className="p-5">
                {streak.transactions.length === 0 ? (
                  <p className="text-sm text-muted">Log in daily and enroll in courses to earn points.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {streak.transactions.map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium">{t.label}</p>
                          <p className="text-xs text-muted">
                            {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                          +{t.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h2 className="mb-4 flex items-center gap-2 font-semibold">
                <AnimatedCalendar className="h-5.5 w-5.5 transition-transform duration-300 hover:scale-110" /> Upcoming deadlines
              </h2>
              <Card className="p-5">
                {deadlines.length === 0 ? (
                  <p className="text-sm text-muted">Nothing due right now.</p>
                ) : (
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
                )}
              </Card>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h2 className="mb-4 font-semibold">Tutoring bookings</h2>
              <Card className="p-5">
                {bookings.length === 0 ? (
                  <EmptyState label="No bookings yet." href="/tutoring" cta="Find a tutor" />
                ) : (
                  <ul className="flex flex-col gap-4">
                    {bookings.map((b) => (
                      <li key={b.id} className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{b.tutor.name}</p>
                          <p className="text-xs text-muted">{b.subject} · {b.preferredSlot}</p>
                        </div>
                        <StatusBadge status={b.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </FadeIn>
          </div>
        </div>

        <FadeIn id="settings" delay={0.3} className="scroll-mt-24 mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <SettingsIcon className="h-5.5 w-5.5 transition-transform duration-300 hover:scale-110 hover:rotate-45" /> Account settings
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="flex items-center gap-3.5 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <AnimatedMail className="h-8 w-8 shrink-0" />
              <div>
                <p className="text-xs text-muted">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3.5 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
              <AnimatedPhone className="h-8 w-8 shrink-0" />
              <div>
                <p className="text-xs text-muted">Phone</p>
                <p className="text-sm font-medium">{user.phone ?? "Not added"}</p>
              </div>
            </Card>
          </div>
        </FadeIn>
      </Container>
    </Section>
  );
}

function EmptyState({ label, href, cta }: { label: string; href: string; cta: string }) {
  return (
    <Card className="flex flex-col items-start gap-3 p-5">
      <p className="text-sm text-muted">{label}</p>
      <Button size="sm" variant="secondary" href={href}>
        {cta}
      </Button>
    </Card>
  );
}
