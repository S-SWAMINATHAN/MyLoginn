import Link from "next/link";
import { createPageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { RelatedLinks } from "@/components/services/story/RelatedLinks";
import { ServicesExplorer, type ServiceItem } from "@/components/pages/ServicesExplorer";

export const metadata = createPageMetadata({
  title: "IT Services: Web, App, AI Agents & Digital Marketing",
  description: "Web development, mobile apps, custom desktop software, AI agents, software testing and digital marketing from MyLoginn, an India-based IT company.",
  path: "/services",
  keywords: [
    "MyLoginn IT services", "IT services", "technology services",
    "software solutions", "software development services", "digital solutions",
    "AI technology solutions", "business technology solutions",
  ],
});

const services: ServiceItem[] = [
  { key: "app-web", short: "App & Web", title: "App & Web Development", text: "Website development, web applications, mobile apps, and custom software built around your product needs.", href: "/services/app-web-development", icon: "webdev", color: "#2563eb", points: ["Websites and web applications", "Android, iOS and cross-platform apps", "APIs, databases and cloud release"] },
  { key: "ai", short: "AI", title: "AI Development & AI Agents", text: "Generative AI features, AI agents and workflow automation integrated into your business software.", href: "/services/ai-development", icon: "ai", color: "#7c3aed", points: ["LLM apps and answers from your documents", "AI agents and workflow automation", "Chatbots and support assistants"] },
  { key: "testing", short: "Testing", title: "Software Testing & Automation", text: "Manual QA, API testing and Playwright test automation for web applications.", href: "/services/testing-automation", icon: "testing", color: "#d97706", points: ["Manual and API testing", "Playwright test automation", "Regression suites in CI/CD"] },
  { key: "marketing", short: "Marketing", title: "Digital Marketing", text: "SEO, paid campaigns, social media, content, and performance analytics for business growth.", href: "/services/digital-marketing", icon: "marketing", color: "#e11d48", points: ["SEO and content strategy", "Social and paid campaigns", "Lead generation and measurement"] },
];

export default function ServicesPage() {
  return (
    <Section className="pt-6 sm:pt-10">
      {/* Hero */}
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <SplitHeadline as="h1" text="IT and technology services" className="mt-0 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}>
            <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">MyLoginn provides website and app development, custom software, AI-driven technology solutions, UI/UX, and digital marketing. Explore our service areas and contact the team to discuss a project.</p>
          </Reveal>
          <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <ArrowLink href="/contact">Discuss a project</ArrowLink>
            <Link href="#all-services" className="btn-sweep rounded-full border border-border-soft bg-surface px-6 py-2.5 text-sm font-semibold active:scale-95">See all services</Link>
          </Reveal>
        </div>
        <Reveal direction="left" delay={0.15} className="min-w-0"><ServicesExplorer services={services} /></Reveal>
      </div>

      {/* All services */}
      <Container id="all-services" className="mt-24 max-w-6xl scroll-mt-24 sm:mt-28">
        <Reveal><span className="story-eyebrow">What we do</span></Reveal>
        <h2 className="story-subheading mt-3 text-story-navy dark:text-foreground">Our service areas</h2>
        <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {services.map((service, i) => (
            <RevealItem key={service.href} className="h-full">
              <article className="group relative h-full" style={{ "--c": service.color } as React.CSSProperties}>
                <Link href={service.href} className="flex h-full flex-col overflow-hidden rounded-3xl border border-border-soft bg-surface p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--c)] hover:shadow-[0_18px_36px_-22px_var(--c)]">
                  <span className="flex flex-1 items-start justify-between gap-3">
                    <span className="min-w-0">
                      <h3 className="text-base font-semibold text-story-navy dark:text-foreground">{service.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">{service.text}</p>
                    </span>
                    <IconBadge size="sm" delay={i * 0.05} className="!h-12 !w-12 shrink-0"><ContentIcon keyword={service.icon} className="h-10 w-10" /></IconBadge>
                  </span>
                  <span className="mt-5 flex items-center justify-between border-t border-border-soft pt-3.5">
                    <span className="text-sm font-semibold text-[var(--c)]">Explore</span>
                    <span aria-hidden className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--c)_12%,transparent)] text-[var(--c)] transition-colors duration-300 group-hover:bg-[var(--c)] group-hover:text-white">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[180%]"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute -translate-x-[180%] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-0"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
                    </span>
                  </span>
                </Link>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>

      {/* More from MyLoginn */}
      <Container className="max-w-6xl">
        <RelatedLinks
          wide
          related={[
            { href: "/projects", label: "Projects" },
            { href: "/about", label: "About MyLoginn" },
            { href: "/careers", label: "Careers" },
            { href: "/contact", label: "Contact MyLoginn" },
          ]}
        />
      </Container>
    </Section>
  );
}
