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
  title: "About the Company",
  description:
    "Learn about MyLoginn Tech Private Limited, the company behind MyLoginn, and its web and mobile development, AI, digital marketing, courses, and internships.",
  path: "/about",
  keywords: ["about MyLoginn", "MyLoginn Tech Private Limited company", "MyLoginn technology company", "MyLoginn IT company"],
});

const offerings = [
  { title: "Courses", text: "Structured, practical technology courses you can learn at your own pace.", href: "/courses", icon: "student", color: "#2563eb" },
  { title: "Projects", text: "Build real projects that turn what you learn into a portfolio.", href: "/projects", icon: "webdev", color: "#7c3aed" },
  { title: "Internships", text: "Explore internship opportunities with real work and mentor guidance.", href: "/internships", icon: "career", color: "#059669" },
  { title: "Services", text: "Web, mobile, AI and digital marketing solutions for businesses.", href: "/services", icon: "business", color: "#d97706" },
];

const principles: { title: string; description: string; Icon: LucideIcon; color: string }[] = [
  { title: "Innovation", Icon: Target, color: "#2563eb", description: "We embrace new ideas and modern technology to create better solutions." },
  { title: "Integrity", Icon: ShieldCheck, color: "#7c3aed", description: "We believe in honesty, transparency and doing what’s right, always." },
  { title: "Collaboration", Icon: Users, color: "#059669", description: "We grow together by supporting, sharing and learning from each other." },
  { title: "Impact", Icon: TrendingUp, color: "#d97706", description: "We focus on real outcomes for people, businesses and the digital future." },
];

const faqs = [
  { question: "What is MyLoginn Tech Private Limited?", answer: "MyLoginn Tech Private Limited is an Indian technology company. MYLOGINN is the company’s primary brand spelling." },
  { question: "Is MyLoginn the same as MyLogin or My Login?", answer: "No. MyLoginn (with two n's), also written My Loginn, is MyLoginn Tech Private Limited, an India-based technology company at myloginn.com. It is not related to MyLogin, the school single sign-on service, or to other products with similar names." },
  { question: "What does MyLoginn do?", answer: "MyLoginn brings digital product development, applied AI, digital marketing, and practical technology learning together." },
  { question: "Does MyLoginn offer courses and internships?", answer: "Yes. The company offers technology courses and internship opportunities. Visit the Courses and Internships pages for current information." },
  { question: "How can I discuss a project or program?", answer: "Use the Contact page to tell the team about your goals and the kind of support you are looking for." },
];

export default function AboutPage() {
  return (
    <Section className="pt-6 sm:pt-10">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />

      {/* Hero */}
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <Reveal><span className="story-eyebrow">About MYLOGINN</span></Reveal>
          <SplitHeadline as="h1" text="Turning Ideas Into Digital Success" className="mt-4 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}>
            <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">
              <strong className="font-semibold text-foreground">MYLOGINN TECH</strong> is a next-generation digital platform focused on learning, innovation and real-world growth. We help individuals and businesses build skills, create opportunities and achieve more through technology and practical experience.
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <ArrowLink href="#who-we-are">Our mission</ArrowLink>
            <Link href="/services" className="rounded-full border border-border-soft bg-surface px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:text-story-royal active:scale-95">
              Explore services
            </Link>
          </Reveal>
        </div>
        <Reveal direction="left" delay={0.15} className="min-w-0"><GrowthOrbit /></Reveal>
      </div>

      {/* Who we are */}
      <StoryRow
        id="who-we-are"
        eyebrow="Who we are"
        title="We’re more than just a tech platform."
        text="MYLOGINN TECH is built with a vision to empower people with the right skills, practical exposure and modern tools. We bridge learning and real-world opportunities, helping you grow with confidence in the digital world."
        points={["The right skills and modern tools", "Practical exposure on real work", "A bridge from learning to opportunity"]}
        visual={<JourneyMonitor />}
        flip
      />

      {/* What we offer */}
      <Container className="mt-24 max-w-6xl sm:mt-32">
        <section aria-labelledby="offer-title">
          <Reveal><span className="story-eyebrow">What we offer</span></Reveal>
          <h2 id="offer-title" className="story-subheading mt-3 text-story-navy dark:text-foreground">Everything you need to grow</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted">From learning to doing, explore the ways MYLOGINN supports learners, partners and businesses.</p>
          <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <p className="mt-3 max-w-2xl leading-7 text-muted">Our values shape how we work, create and support every learner, partner and team member.</p>
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
              <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Ready to build your future with us?</h2>
              <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">Join MYLOGINN TECH and be part of a growing community of learners, creators and digital achievers.</p>
            </div>
            <div className="relative mt-6 lg:mt-0 lg:shrink-0"><ArrowLink href="/contact" tone="light">Get started</ArrowLink></div>
          </div>
        </Reveal>
      </Container>

      {/* FAQ */}
      <Container className="mt-24 max-w-4xl sm:mt-32">
        <section aria-labelledby="about-faq">
          <Reveal><span className="story-eyebrow">Learn more</span></Reveal>
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
