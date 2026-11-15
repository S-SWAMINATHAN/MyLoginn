import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CodeXml,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import { Container, Section } from "@/components/ui/Section";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "StudentNest",
  description: "Explore MyLoginn student courses, internships, coding challenges, aptitude practice and learning progress in one place.",
  path: "/studentnest",
});

const pathways = [
  {
    href: "/courses",
    label: "Courses",
    description: "Build practical skills with guided technology courses and hands-on projects.",
    action: "Explore courses",
    Icon: BookOpen,
    iconMotion: "group-hover:[transform:perspective(28px)_rotateY(-12deg)_rotateX(5deg)] motion-reduce:group-hover:transform-none",
    tone: "text-teal-700 bg-teal-50 ring-teal-600/10",
  },
  {
    href: "/practice",
    label: "Interview practice",
    description: "Prepare with interview, group discussion and speaking practice.",
    action: "Start practising",
    Icon: Lightbulb,
    iconMotion: "group-hover:-translate-y-0.5 group-hover:rotate-[-8deg] motion-reduce:group-hover:transform-none",
    tone: "text-orange-700 bg-orange-50 ring-orange-600/10",
  },
  {
    href: "/logiquest",
    label: "LogiQuest",
    description: "Strengthen aptitude, reasoning and programming with explained questions and timed tests.",
    action: "Open LogiQuest",
    Icon: GraduationCap,
    iconMotion: "group-hover:-translate-y-1 group-hover:rotate-[-7deg] motion-reduce:group-hover:transform-none",
    tone: "text-violet-700 bg-violet-50 ring-violet-600/10",
  },
  {
    href: "/coding-competition",
    label: "Coding competition",
    description: "Take on coding challenges, track results and earn certificates.",
    action: "Enter competition",
    Icon: CodeXml,
    iconMotion: "group-hover:translate-x-1 motion-reduce:group-hover:transform-none",
    tone: "text-blue-700 bg-blue-50 ring-blue-600/10",
  },
  {
    href: "/internships",
    label: "Internships",
    description: "Review current roles, eligibility and application details.",
    action: "Browse internships",
    Icon: BriefcaseBusiness,
    iconMotion: "group-hover:-translate-y-1 group-hover:rotate-[-4deg] motion-reduce:group-hover:transform-none",
    tone: "text-pink-700 bg-pink-50 ring-pink-600/10",
  },
  {
    href: "/dashboard",
    label: "My learning",
    description: "Open your dashboard to review learning progress and assigned projects.",
    action: "Open dashboard",
    Icon: LayoutDashboard,
    iconMotion: "group-hover:rotate-3 motion-reduce:group-hover:transform-none",
    tone: "text-amber-700 bg-amber-50 ring-amber-600/10",
  },
  {
    href: "/logiquest/leaderboard",
    label: "Leaderboard",
    description: "See learner rankings and celebrate practice milestones.",
    action: "See leaderboard",
    Icon: Trophy,
    iconMotion: "group-hover:-translate-y-1 group-hover:rotate-[-8deg] motion-reduce:group-hover:transform-none",
    tone: "text-yellow-700 bg-yellow-50 ring-yellow-600/10",
  },
  {
    href: "/contact",
    label: "Student support",
    description: "Have a question? Get help choosing a course or finding the right next step.",
    action: "Get support",
    Icon: UsersRound,
    iconMotion: "group-hover:-translate-y-0.5 group-hover:rotate-3 motion-reduce:group-hover:transform-none",
    tone: "text-indigo-700 bg-indigo-50 ring-indigo-600/10",
  },
];

const journeySteps = [
  { label: "Build skills", Icon: BookOpen, tone: "bg-teal-50 text-teal-700" },
  { label: "Practise with purpose", Icon: Lightbulb, tone: "bg-orange-50 text-orange-700" },
  { label: "Take your next step", Icon: BriefcaseBusiness, tone: "bg-blue-50 text-blue-700" },
];

export default function StudentNestPage() {
  return (
    <Section className="overflow-hidden py-6 sm:py-10">
      <Container className="max-w-7xl">
        <section className="relative isolate overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/80 px-5 py-7 shadow-[0_24px_70px_-45px_rgba(37,99,235,0.42)] sm:px-9 sm:py-10 lg:px-12 lg:py-12">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl motion-safe:animate-pulse" />
          <div aria-hidden className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl motion-safe:animate-pulse" />
          <div className="relative grid items-center gap-9 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-story-royal shadow-sm">
                <Sparkles aria-hidden className="h-3.5 w-3.5 motion-safe:animate-pulse" />
                Your learning space
              </span>
              <h1 className="mt-5 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl lg:text-[3.5rem]">
                Your next chapter starts{" "}
                <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-violet-600 bg-clip-text text-transparent">here.</span>
              </h1>
              <p className="mt-5 max-w-xl text-left text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                StudentNest brings learning, practice, coding challenges and career opportunities together—so you can focus on what comes next.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <ArrowLink href="/courses">Explore courses</ArrowLink>
                <ArrowLink href="/internships" tone="outline">Find internships</ArrowLink>
              </div>
            </Reveal>

            <Reveal direction="left" delay={0.12}>
              <div className="relative mx-auto max-w-lg rounded-[1.75rem] border border-white/80 bg-white/75 p-4 shadow-[0_24px_60px_-32px_rgba(30,64,175,0.4)] backdrop-blur-xl sm:p-5">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-1 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-story-royal">The student journey</p>
                    <p className="mt-1 text-lg font-bold text-story-navy">Learn. Practise. Grow.</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">Made for you</span>
                </div>
                <ol className="mt-4 space-y-3">
                  {journeySteps.map(({ label, Icon, tone }, index) => (
                    <li key={label} className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/80 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                        <Icon aria-hidden className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Step 0{index + 1}</span>
                        <span className="mt-0.5 block text-sm font-semibold text-story-navy">{label}</span>
                      </span>
                      <ArrowUpRight aria-hidden className="h-4 w-4 text-slate-400 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-story-royal" />
                    </li>
                  ))}
                </ol>
                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-600 px-4 py-3 text-white shadow-[0_12px_24px_-14px_rgba(37,99,235,0.75)]">
                  <Sparkles aria-hidden className="h-4 w-4" />
                  <p className="text-left text-xs font-medium leading-5">Small steps today. Stronger opportunities tomorrow.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Reveal className="mt-10 flex flex-col items-center gap-3 text-center sm:mt-14">
          <div className="text-center">
            <span className="story-eyebrow">Explore your options</span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-story-navy sm:text-3xl">Find your next step</h2>
          </div>
          <p className="max-w-md text-center text-sm leading-6 text-muted">Choose a pathway to learn, practise, connect and keep moving forward.</p>
        </Reveal>

        <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" stagger={0.07}>
          {pathways.map(({ href, label, description, action, Icon, iconMotion, tone }) => (
            <RevealItem key={href} className="h-full">
              <article className="group relative flex h-full min-h-[17rem] flex-col items-center overflow-hidden rounded-3xl border border-border-soft bg-white p-5 text-center shadow-[0_8px_24px_-20px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_22px_42px_-28px_rgba(37,99,235,0.42)]">
                <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100/50 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                <span className={`relative grid h-12 w-12 place-items-center rounded-2xl ring-1 ${tone}`}>
                  <Icon aria-hidden className={`h-6 w-6 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${iconMotion}`} />
                </span>
                <h3 className="relative mt-4 text-center text-lg font-bold text-story-navy">{label}</h3>
                <p className="relative mt-2 text-center text-sm leading-6 text-slate-600">{description}</p>
                <ArrowLink href={href} className="relative mt-auto h-11 max-w-full gap-2 whitespace-nowrap text-xs">
                  {action}
                </ArrowLink>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </Section>
  );
}
