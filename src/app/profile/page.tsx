import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, GraduationCap, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Container, Section } from "@/components/ui/Section";
import { ProfilePhotoButton } from "@/components/layout/ProfilePhotoButton";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Profile",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const role = user.role.charAt(0) + user.role.slice(1).toLowerCase();
  const joinedOn = user.createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Section className="pt-12 sm:pt-16">
      <Container className="max-w-5xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">Account</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My profile</h1>
          <p className="mt-2 text-muted">Your personal details and learning profile.</p>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <Avatar
                  name={user.name}
                  avatarColor={user.avatarColor}
                  avatarUrl={user.avatarUrl}
                  size={88}
                  className="rounded-3xl text-2xl shadow-md"
                />
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold">{user.name}</h2>
                  <p className="mt-1 truncate text-sm text-muted">{user.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">{role}</span>
                    {user.emailVerified ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <BadgeCheck className="h-3.5 w-3.5" /> Email verified
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                        Email not verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ProfilePhotoButton />
            </div>
          </div>

          <div className="grid gap-8 border-t border-border-soft p-6 sm:grid-cols-2 sm:p-8">
            <section aria-labelledby="personal-details-title">
              <h3 id="personal-details-title" className="mb-4 flex items-center gap-2 font-semibold">
                <UserRound className="h-4 w-4 text-brand-500" /> Personal details
              </h3>
              <dl className="space-y-4">
                <Detail icon={<UserRound className="h-4 w-4" />} label="Full name" value={user.name} />
                <Detail icon={<Mail className="h-4 w-4" />} label="Email address" value={user.email} />
                <Detail icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone || "Not added"} />
                <Detail icon={<MapPin className="h-4 w-4" />} label="Country" value={user.country || "Not added"} />
              </dl>
            </section>

            <section aria-labelledby="learning-profile-title">
              <h3 id="learning-profile-title" className="mb-4 flex items-center gap-2 font-semibold">
                <GraduationCap className="h-4 w-4 text-brand-500" /> Learning profile
              </h3>
              <dl className="space-y-4">
                <Detail icon={<GraduationCap className="h-4 w-4" />} label="Grade" value={user.grade || "Not added"} />
                <Detail icon={<ShieldCheck className="h-4 w-4" />} label="Board" value={user.board || "Not added"} />
                <Detail icon={<BadgeCheck className="h-4 w-4" />} label="Account type" value={role} />
                <Detail icon={<UserRound className="h-4 w-4" />} label="Member since" value={joinedOn} />
              </dl>
            </section>
          </div>
        </Card>

        <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-border-soft bg-surface-2/60 p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-semibold">Your learning activity</h2>
            <p className="mt-1 text-sm text-muted">See your courses, projects, applications and account settings.</p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Open dashboard
          </Link>
        </div>
      </Container>
    </Section>
  );
}

function Detail({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-medium">{value}</dd>
      </div>
    </div>
  );
}
