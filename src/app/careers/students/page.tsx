import Link from "next/link";
import { ArrowRight, BookOpen, ChartNoAxesColumnIncreasing, GraduationCap, LayoutDashboard, LogIn, UserPlus } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = createPageMetadata({
  title: "Students",
  description: "Courses, practice, LogiQuest, leaderboards, student login, signup, and dashboard at MyLoginn.",
  path: "/careers/students",
});

const links = [
  { href: "/careers/students/courses", label: "Courses", description: "Explore and continue job-ready courses.", Icon: BookOpen },
  { href: "/careers/students/practice", label: "Practice", description: "Build interview, speaking, and group-discussion skills.", Icon: GraduationCap },
  { href: "/careers/students/logiquest", label: "LogiQuest", description: "Practise aptitude, reasoning, programming, and interview questions.", Icon: ChartNoAxesColumnIncreasing },
  { href: "/careers/students/leaderboard", label: "Leaderboard", description: "See top learner rankings.", Icon: ChartNoAxesColumnIncreasing },
];

export default function StudentsPortalPage() {
  return (
    <div className="relative overflow-x-clip px-3 py-10 min-[360px]:px-5 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <span className="story-eyebrow">MyLoginn Students</span>
          <h1 className="mt-4 max-w-3xl text-[2rem] font-bold leading-[1.08] tracking-tight text-story-navy min-[360px]:text-4xl sm:text-6xl dark:text-foreground">
            Build skills for your next opportunity.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
            One Student Portal for learning, practice, LogiQuest, and your MyLoginn account.
          </p>
        </Reveal>

        <div className="mt-9 grid gap-4 sm:grid-cols-2">
          {links.map(({ href, label, description, Icon }) => (
            <Reveal key={label}>
              <Link href={href} className="group flex h-full items-start gap-4 rounded-3xl border border-border-soft bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-story-royal/40 hover:shadow-[var(--shadow-soft)] sm:p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-story-mist text-story-royal">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3 text-lg font-semibold text-story-navy dark:text-foreground">
                    {label}
                    <ArrowRight className="h-4 w-4 text-story-royal transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted">{description}</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-5 rounded-3xl border border-border-soft bg-surface p-4 min-[360px]:p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="shrink-0">
            <p className="text-lg font-semibold text-story-navy dark:text-foreground">Student account</p>
            <p className="mt-1 text-sm text-muted">Log in, create an account, or open your dashboard.</p>
          </div>
          <div className="grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:flex sm:flex-wrap sm:justify-end">
            <Link href="/careers/students/login" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border-soft px-4 py-2 text-sm font-semibold text-story-navy transition-colors hover:border-story-royal hover:text-story-royal dark:text-foreground">
              <LogIn className="h-4 w-4" /> Log in
            </Link>
            <Link href="/careers/students/signup" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-story-royal px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90">
              <UserPlus className="h-4 w-4" /> Get started
            </Link>
            <Link href="/careers/students/dashboard" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border-soft px-4 py-2 text-sm font-semibold text-story-navy transition-colors hover:border-story-royal hover:text-story-royal dark:text-foreground min-[360px]:col-span-2 sm:col-span-1">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
