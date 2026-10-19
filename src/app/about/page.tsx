import Link from "next/link";
import { Handshake, ShieldCheck, Target, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Container, Section } from "@/components/ui/Section";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { StoryRow } from "@/components/services/testing/TestingLanding";
import { GrowthOrbit, JourneyMonitor } from "@/components/about/AboutVisuals";
import { CONTACT_EMAIL } from "@/lib/contactInfo";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About MyLoginn",
  absoluteTitle: true,
  description:
    "MyLoginn Tech Private Limited is an India-based IT company building websites, mobile apps, desktop software, AI agents and digital marketing for businesses.",
  path: "/about",
  keywords: ["about MyLoginn", "MyLoginn Tech Private Limited company", "MyLoginn technology company", "MyLoginn IT company"],
});

const offerings = [
  { title: "Web Development", text: "Websites, portals, dashboards and web platforms that convert and scale.", href: "/services/app-web-development", icon: "webdev", color: "#2563eb" },
  { title: "App Development", text: "Android, iOS and cross-platform apps built around your customers.", href: "/services/app-web-development", icon: "mobile", color: "#7c3aed" },
  { title: "Desktop Applications", text: "Custom business software for billing, inventory and operations.", href: "/services/app-web-development", icon: "software", color: "#0891b2" },
  { title: "AI Agents", text: "Agents and automation that take repetitive work off your team.", href: "/services/ai-development", icon: "ai", color: "#059669" },
  { title: "Digital Marketing", text: "Meta Ads, Google Ads, SEO and branding that bring customers.", href: "/services/digital-marketing", icon: "marketing", color: "#d97706" },
];

const principles: { title: string; description: string; Icon: LucideIcon; color: string }[] = [
  { title: "Innovation", Icon: Target, color: "#2563eb", description: "We embrace new ideas and modern technology to create better solutions." },
  { title: "Integrity", Icon: ShieldCheck, color: "#7c3aed", description: "We believe in honesty, transparency and doing what’s right, always." },
  { title: "Partnership", Icon: Users, color: "#059669", description: "We work as an extension of your team, with clear scope and open communication." },
  { title: "Impact", Icon: TrendingUp, color: "#d97706", description: "We measure success by what changes for your business after launch." },
];

const faqs = [
  { question: "What is MyLoginn Tech Private Limited?", answer: "MyLoginn Tech Private Limited is an Indian technology company. MYLOGINN is the company’s primary brand spelling." },
  { question: "Is MyLoginn the same as MyLogin or My Login?", answer: "No. MyLoginn (with two n's), also written My Loginn, is MyLoginn Tech Private Limited, an India-based technology company at myloginn.com. It is not related to MyLogin, the school single sign-on service, or to other products with similar names." },
  { question: "What does MyLoginn do?", answer: "MyLoginn builds websites, mobile apps, desktop applications and AI agents, and runs digital marketing, for startups and businesses in India and worldwide." },
  { question: "How can I start a project with MyLoginn?", answer: "Use the Contact page to tell the team about your business, your goals and what you want to build. We reply with next steps and a proposed scope." },
  { question: "Does MyLoginn also offer learning?", answer: "Yes. MyLoginn Learn is a separate learning platform with technology courses and practice. Visit the Learn section for details." },
];

export default function AboutPage() {
  return (
    <Section className="pt-6 sm:pt-10">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />

      {/* Hero */}
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <SplitHeadline as="h1" text="Turning Ideas Into Digital Success" className="mt-0 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}>
            <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">
              <strong className="font-semibold text-foreground">MYLOGINN TECH</strong> is a technology company. We design and build websites, apps, desktop software and AI agents, and run the digital marketing that helps businesses grow.
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <ArrowLink href="/contact">Start a project</ArrowLink>
            <Link href="/services" className="btn-sweep rounded-full border border-border-soft bg-surface px-6 py-3 text-sm font-semibold active:scale-95">
              Explore solutions
            </Link>
          </Reveal>
        </div>
        <Reveal direction="left" delay={0.15} className="min-w-0"><GrowthOrbit /></Reveal>
      </div>

      {/* Who we are */}
      <StoryRow
        id="who-we-are"
        eyebrow="Who we are"
        title="Technology built around the way your business works."
        text="We don’t start with a template or a favourite framework. We start with your operations, customers and goals, then design, build, automate and market the technology that serves them, with one team from first call to launch and beyond."
        points={["Discovery before technology", "One team from design to launch", "Support and growth after go-live"]}
        visual={<JourneyMonitor />}
        flip
      />

      {/* What we offer */}
      <Container className="mt-24 max-w-6xl sm:mt-32">
        <section aria-labelledby="offer-title">
          <Reveal><span className="story-eyebrow">What we offer</span></Reveal>
          <h2 id="offer-title" className="story-subheading mt-3 text-story-navy dark:text-foreground">Five core capabilities</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Everything a business needs to build, automate and grow digitally, delivered by one team.</p>
          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {offerings.map((o, i) => (
              <RevealItem key={o.title} className="h-full">
                <Link
                  href={o.href}
                  style={{ "--c": o.color } as React.CSSProperties}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--c)] hover:shadow-[0_18px_36px_-20px_var(--c)]"
                >
                  <IconBadge size="md" delay={i * 0.05}><ContentIcon keyword={o.icon} className="h-13 w-13" /></IconBadge>
                  <h3 className="mt-4 text-lg font-semibold">{o.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{o.text}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--c)]">
                    Learn more
                    <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full border border-[var(--c)] text-xs transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[var(--c)] group-hover:text-white">→</span>
                  </span>
                  <span aria-hidden className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--c)] transition-all duration-500 group-hover:w-full" />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      </Container>

      {/* Values */}
      <Container id="our-values" className="mt-24 max-w-6xl scroll-mt-24 sm:mt-32">
        <section aria-labelledby="values-title">
          <Reveal><span className="story-eyebrow">Our values</span></Reveal>
          <h2 id="values-title" className="story-subheading mt-3 text-story-navy dark:text-foreground">What drives us</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Our values shape how we work with every client, partner and team member.</p>
          <RevealGroup className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ title, description, Icon, color }) => (
              <RevealItem key={title}>
                <article className="group relative h-full rounded-[2rem] border border-border-soft bg-surface px-6 pb-6 pt-14 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-22px_var(--c)]" style={{ "--c": color } as React.CSSProperties}>
                  <span className="absolute -top-9 left-1/2 grid h-[4.5rem] w-[4.5rem] -translate-x-1/2 place-items-center rounded-full bg-surface">
                    <span aria-hidden className="absolute inset-0 animate-[spin_16s_linear_infinite] rounded-full border-2 border-dashed" style={{ borderColor: color }} />
                    <span className="grid h-12 w-12 place-items-center rounded-full text-white transition-transform duration-300 group-hover:scale-110" style={{ background: color }}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  </span>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      </Container>

      {/* CTA */}
      <Container className="mt-24 max-w-6xl sm:mt-32">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-story-navy px-6 py-10 text-white sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <span aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-white/5" />
            <span aria-hidden className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full border-[20px] border-white/5" />
            <div className="relative max-w-2xl">
              <Handshake className="h-8 w-8 text-story-cyan" aria-hidden="true" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Have something to build?</h2>
              <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">Tell us about your business and goals. We&apos;ll help you choose the right solution and build it with you.</p>
            </div>
            <div className="relative mt-6 lg:mt-0 lg:shrink-0"><ArrowLink href="/contact" tone="light">Start a project</ArrowLink></div>
          </div>
        </Reveal>
      </Container>

      {/* FAQ */}
      <Container className="mt-24 max-w-4xl sm:mt-32">
        <section aria-labelledby="about-faq">
          <Reveal><span className="story-eyebrow">FAQ</span></Reveal>
          <h2 id="about-faq" className="story-subheading mt-3 text-story-navy dark:text-foreground">A few common questions</h2>
          <FaqAccordion items={faqs} className="mt-8" />
          <p className="mt-6 text-sm text-muted">
            Have another question? <Link href="/contact" className="font-semibold text-story-royal">Talk to our team</Link> · <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-story-royal">{CONTACT_EMAIL}</a>
          </p>
        </section>
      </Container>
    </Section>
  );
}
