import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Container, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ProfilePhotoButton } from "@/components/layout/ProfilePhotoButton";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { CourseProgressRing } from "@/components/courses/CourseProgressRing";
import { ProfileDetails } from "@/components/profile/ProfileDetails";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const role = user.role.charAt(0) + user.role.slice(1).toLowerCase();
  const joinedOn = user.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // Profile completeness: how many of these details are filled in or verified.
  const checks = [Boolean(user.name), user.emailVerified, Boolean(user.phone && user.phoneVerified), Boolean(user.country), Boolean(user.grade), Boolean(user.board)];
  const done = checks.filter(Boolean).length;
  const percent = Math.round((done / checks.length) * 100);

  return (
    <Section className="pt-8 sm:pt-12">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Reveal>
            <Link href="/dashboard" className="group inline-flex items-center gap-2.5 rounded-full border border-border-soft bg-surface py-1.5 pl-1.5 pr-4 text-sm font-semibold text-muted transition-all duration-300 hover:-translate-x-0.5 hover:border-story-royal hover:text-story-royal active:scale-95">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-story-mist text-story-royal transition-colors duration-300 group-hover:bg-story-royal group-hover:text-white">
                <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </span>
              Back to dashboard
            </Link>
          </Reveal>

          <div className="text-right">
            <SplitHeadline as="h1" text="My profile" className="mt-0 text-3xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-4xl dark:text-foreground" />
            <Reveal direction="up" delay={0.15}>
              <p className="ml-auto mt-2 max-w-xl text-sm leading-6 text-muted sm:text-base">Your personal details and learning profile.</p>
            </Reveal>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[21rem_minmax(0,1fr)] lg:gap-8">
          {/* Identity */}
          <Reveal direction="right">
            <aside className="rounded-3xl border border-border-soft bg-surface p-6 text-center shadow-[var(--shadow-soft)] lg:sticky lg:top-24">
              <div className="mx-auto w-fit">
                <Avatar name={user.name} avatarColor={user.avatarColor} avatarUrl={user.avatarUrl} size={104} className="rounded-full text-3xl shadow-md" />
              </div>
              <h2 className="mt-4 truncate text-xl font-bold text-story-navy dark:text-foreground">{user.name}</h2>
              <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-border-soft px-3 py-1 text-xs font-semibold">{role}</span>
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <BadgeCheck className="h-3.5 w-3.5" /> Email verified
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">Email not verified</span>
                )}
              </div>

              <div className="mt-5 flex justify-center"><ProfilePhotoButton /></div>

              <div className="mt-6 border-t border-border-soft pt-5 text-left">
                <CourseProgressRing percent={percent} label="Profile completeness" sublabel={`${done} of ${checks.length} details complete`} />
              </div>
            </aside>
          </Reveal>

          {/* Details */}
          <div className="min-w-0 space-y-6">
            <Reveal direction="up" delay={0.1}>
              <ProfileDetails initial={{ name: user.name, country: user.country ?? "", grade: user.grade ?? "", board: user.board ?? "" }} role={role} joinedOn={joinedOn} />
            </Reveal>

            <AccountSettings email={user.email} emailVerified={user.emailVerified} phone={user.phone} phoneVerified={user.phoneVerified} />

            <Reveal>
              <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-border-soft p-5 text-center sm:flex-row sm:px-6 sm:text-left">
                <div>
                  <h2 className="font-semibold text-story-navy dark:text-foreground">Your learning activity</h2>
                  <p className="mt-1 text-sm text-muted">See your courses, projects, applications and account settings.</p>
                </div>
                <ArrowLink href="/dashboard">Open dashboard</ArrowLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
