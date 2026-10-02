import { createPageMetadata } from "@/lib/seo";
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
import { JsonLd } from "@/components/seo/JsonLd";

const developmentAreas = [
  "Business websites and landing pages",
  "Web applications and internal tools",
  "Android, iOS and cross-platform apps",
  "UI and UX design implementation",
  "Backend services, APIs and integrations",
  "Database design and authentication",
  "Cloud deployment and release support",
  "Testing, maintenance and performance improvements",
];

const developmentFaqs = [
  { question: "What can MyLoginn build?", answer: "The team can discuss websites, web applications, mobile apps, custom software, APIs and related product work. Scope is agreed for each project." },
  { question: "Can you work on an existing website or application?", answer: "Yes. Share the current product, goals and technical context through the project enquiry form so the team can assess a suitable scope." },
  { question: "Which technology will my project use?", answer: "The technology stack is selected around the product requirements, integrations, hosting and maintenance needs. The stack shown on this page is an overview of technologies used by the team." },
  { question: "Do you provide testing and maintenance?", answer: "Testing and ongoing maintenance can be included in the project plan. The deliverables and support period are agreed before work begins." },
  { question: "How do I request an estimate?", answer: "Use the enquiry form to outline your goals, expected users, key features, integrations and any timeline constraints. The team can follow up to clarify the scope." },
];

const features: { iconKey: CourseIconKey; title: string; description: string }[] = [
  {
    iconKey: "webdev",
    title: "Full-stack development",
    description: "Modern websites and apps shaped around an agreed project scope and business need.",
  },
  {
    iconKey: "ai",
    title: "Smooth animations",
    description: "Polished interactions designed to work smoothly across supported devices.",
  },
  {
    iconKey: "devops",
    title: "Server maintenance",
    description: "Monitoring, maintenance, patching and scaling can be included in the agreed delivery scope.",
  },
  {
    iconKey: "network",
    title: "Real-time updates",
    description: "Live data updates can connect dashboards, apps and admin tools where the project needs them.",
  },
];

const stack = ["Next.js", "React Native", "Node.js", "PostgreSQL", "Prisma", "Three.js", "Tailwind CSS", "AWS / Vercel"];

export const metadata = createPageMetadata({
  title: "App & Web Development Services",
  description: "Plan and build secure, scalable websites, web applications, and mobile apps with MyLoginn Tech Private Limited.",
  path: "/services/app-web-development",
  keywords: [
    "MyLoginn website development", "web development company",
    "website development services", "web application development",
    "mobile app development company", "app development company",
    "custom software development", "full-stack development",
  ],
});

export default function AppWebDevelopmentPage() {
  return (
    <Section className="mobile-page-glow pt-3 sm:pt-5">
      <Container className="max-w-[1480px]">
        <div className="relative mb-10 block items-center gap-4 rounded-[2rem] bg-[radial-gradient(ellipse_at_75%_45%,rgba(117,177,255,.25),transparent_48%),radial-gradient(ellipse_at_55%_70%,rgba(91,220,235,.16),transparent_45%)] py-5 max-md:mb-5 max-md:py-2 md:grid md:grid-cols-[1.05fr_.95fr]">
          <div className="relative float-right ml-3 mb-2 block h-24 w-32 max-md:mb-0 md:order-2 md:float-none md:ml-auto md:mb-0 md:h-[430px] md:w-full md:max-w-xl">
            <Image src={developmentHeader} alt="App and web development with connected devices and code" fill priority className="object-contain object-right md:scale-110 md:object-center" sizes="(max-width: 768px) 128px, 48vw" />
          </div>
          <div className="relative z-10 md:order-1">
            <Eyebrow className="max-md:gap-1.5 max-md:px-2 max-md:text-[10px] max-md:tracking-normal"><Smartphone className="h-4 w-4 shrink-0" /> Full-stack development</Eyebrow>
            <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight max-md:mt-1 max-md:text-[1.625rem] max-[380px]:text-2xl sm:text-5xl">Development that builds <span className="brand-gradient-text">scalable platforms</span></h1>
            <p className="mt-4 max-w-2xl text-base text-muted max-md:mt-1 max-md:text-sm max-md:leading-[1.35] sm:text-lg">Custom end-to-end app and web development, leveraging modern technology stacks for robust, high-performance, and secure user experiences.</p>
            <div className="mt-7 clear-both grid w-full grid-cols-2 gap-3 max-md:mt-2 sm:grid-cols-4">{[{ icon: "development-projects", value: "Complete", label: "Project delivery" }, { icon: "development-clients", value: "Teamwork", label: "Client approach" }, { icon: "development-stacks", value: "Modern", label: "Technology stacks" }, { icon: "development-rating", value: "Reliable", label: "Development" }].map(({ icon, value, label }) => <div key={label} className="flex min-h-36 min-w-0 flex-col justify-between rounded-2xl border border-border-soft bg-surface/85 p-3 shadow-[var(--shadow-soft)] sm:p-4"><ReferenceStatIcon name={icon as "development-projects" | "development-clients" | "development-stacks" | "development-rating"} className="h-11 w-11 shrink-0 sm:h-10 sm:w-10" /><div className="mt-4 min-w-0"><p className="whitespace-nowrap text-xl font-semibold leading-6 sm:text-lg">{value}</p><p className="mt-1 min-h-8 text-xs uppercase leading-4 text-muted sm:text-[11px]">{label}</p></div></div>)}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {features.map((f, i) => (
                <Card
                  key={f.title}
                  className={`animate-fade-up stagger-${i + 1} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold sm:text-lg">{f.title}</h3>
                      <p className="mt-2 text-sm text-muted">{f.description}</p>
                    </div>
                    <IconBadge size="xl" className="shrink-0 text-brand-500 dark:text-brand-400" delay={i * 0.06}>
                      <ContentIcon keyword={f.iconKey} className="h-12 w-12" />
                    </IconBadge>
                  </div>
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

            <section aria-labelledby="development-capabilities" className="mt-12">
              <h2 id="development-capabilities" className="text-2xl font-semibold tracking-tight">Development capabilities</h2>
              <p className="mt-3 leading-7 text-muted">Select the product and support areas relevant to your project. Final scope, platform support and delivery details are agreed during discovery.</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {developmentAreas.map((area) => <li key={area} className="rounded-xl border border-border-soft bg-surface p-4 text-sm font-medium">{area}</li>)}
              </ul>
            </section>

            <section aria-labelledby="development-process" className="mt-12 rounded-3xl bg-surface-2 p-6 sm:p-8">
              <h2 id="development-process" className="text-2xl font-semibold tracking-tight">A clear project workflow</h2>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {["Discuss goals and requirements", "Agree on scope and milestones", "Design and build the product", "Test, release and review support needs"].map((step, index) => <li key={step} className="flex gap-3 rounded-xl border border-border-soft bg-surface p-4 text-sm"><span className="font-semibold text-brand-600">0{index + 1}</span><span>{step}</span></li>)}
              </ol>
            </section>

            <section aria-labelledby="development-faq" className="mt-12">
              <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: developmentFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
              <h2 id="development-faq" className="text-2xl font-semibold tracking-tight">App and web development FAQs</h2>
              <div className="mt-5 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface px-5 sm:px-7">
                {developmentFaqs.map(({ question, answer }) => <details key={question} className="py-5"><summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">{question}</summary><p className="mt-3 max-w-3xl leading-7 text-muted">{answer}</p></details>)}
              </div>
            </section>
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
