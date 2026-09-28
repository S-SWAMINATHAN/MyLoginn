import type { Metadata } from "next";
import { Section, Container, Eyebrow } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { LeadForm } from "@/components/services/LeadForm";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import type { CourseIconKey } from "@/lib/courseIcons";
import Image from "next/image";
import developmentHeader from "@/images/App & Web Development header.png";
import { ReferenceStatIcon } from "@/components/ui/ReferenceStatIcon";
import { Smartphone } from "lucide-react";

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

export const metadata: Metadata = {
  title: "App & Website Development — MyLoginn",
  description: "Build fast, scalable web and mobile products with MyLoginn's full-stack engineering team.",
  alternates: { canonical: "/services/app-web-development" },
};

export default function AppWebDevelopmentPage() {
  return (
    <Section className="mobile-page-glow pt-3 sm:pt-5">
      <Container className="max-w-[1480px]">
        <div className="relative mb-10 grid items-center gap-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_75%_45%,rgba(117,177,255,.25),transparent_48%),radial-gradient(ellipse_at_55%_70%,rgba(91,220,235,.16),transparent_45%)] py-5 md:grid-cols-[1.05fr_.95fr]">
          <div className="relative z-10">
            <Eyebrow><Smartphone className="h-4 w-4" /> Full-stack development</Eyebrow>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">Development that builds <span className="brand-gradient-text">scalable platforms</span></h1>
            <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">Custom end-to-end app and web development, leveraging modern technology stacks for robust, high-performance, and secure user experiences.</p>
            <div className="mt-7 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">{[{ icon: "development-projects", value: "75+", label: "Projects delivered" }, { icon: "development-clients", value: "30+", label: "Active clients" }, { icon: "development-stacks", value: "10+", label: "Key tech stacks" }, { icon: "development-rating", value: "4.8/5", label: "Client rating" }].map(({ icon, value, label }) => <div key={label} className="flex min-h-28 flex-col justify-between rounded-2xl border border-border-soft bg-surface/85 p-4 shadow-[var(--shadow-soft)]"><ReferenceStatIcon name={icon as "development-projects" | "development-clients" | "development-stacks" | "development-rating"} className="h-10 w-10" /><div><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-[11px] uppercase text-muted">{label}</p></div></div>)}</div>
          </div>
          <div className="relative mx-auto h-64 w-full max-w-xl md:h-[430px]"><Image src={developmentHeader} alt="App and web development with connected devices and code" fill priority className="scale-110 object-contain" sizes="(max-width: 768px) 100vw, 48vw" /></div>
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">

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
