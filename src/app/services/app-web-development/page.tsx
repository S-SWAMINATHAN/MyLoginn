import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { LeadForm } from "@/components/services/LeadForm";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import type { CourseIconKey } from "@/lib/courseIcons";

const features: { iconKey: CourseIconKey; title: string; description: string }[] = [
  {
    iconKey: "webdev",
    title: "Full-stack development",
    description: "Modern, scalable apps and websites built end-to-end by senior engineers.",
  },
  {
    iconKey: "ai",
    title: "Smooth animations",
    description: "Premium, cinematic interactions that feel fast on every device.",
  },
  {
    iconKey: "devops",
    title: "Server maintenance",
    description: "Ongoing monitoring, patching and scaling so you never worry about uptime.",
  },
  {
    iconKey: "network",
    title: "Real-time updates",
    description: "Live data sync across dashboards, apps and admin panels out of the box.",
  },
];

const stack = ["Next.js", "React Native", "Node.js", "PostgreSQL", "Prisma", "Three.js", "Tailwind CSS", "AWS / Vercel"];

export const metadata = { title: "App & Website Development — MyLoginn" };

export default function AppWebDevelopmentPage() {
  return (
    <Section className="pt-14">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <Eyebrow>Product Engineering</Eyebrow>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              App &amp; Website Development
            </h1>
            <p className="mt-4 max-w-xl text-muted">
              For startups, enterprises and organizations that need a premium
              mobile app or website &mdash; built, animated, and maintained by
              our in-house engineering team.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {features.map((f, i) => (
                <Card
                  key={f.title}
                  className={`animate-fade-up stagger-${i + 1} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]`}
                >
                  <IconBadge size="lg" className="text-brand-500 dark:text-brand-400" delay={i * 0.06}>
                    <ContentIcon keyword={f.iconKey} className="h-10.5 w-10.5" />
                  </IconBadge>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted">{f.description}</p>
                </Card>
              ))}
            </div>

            <div className="animate-fade-up stagger-5 mt-10">
              <h2 className="font-semibold">Our stack</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border-soft bg-surface px-3.5 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-[var(--shadow-soft)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <LeadForm service="App & Website Development" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
