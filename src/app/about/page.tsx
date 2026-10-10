import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Briefcase,
  GraduationCap,
  Handshake,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import aboutHeader from "@/images/About us header.png";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal } from "@/components/ui/Reveal";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { CONTACT_EMAIL } from "@/lib/contactInfo";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "About the Company",
  description:
    "Learn about MyLoginn Tech Private Limited, the company behind MyLoginn, and its web and mobile development, AI, digital marketing, courses, and internships.",
  path: "/about",
  keywords: ["about MyLoginn", "MyLoginn Tech Private Limited company", "MyLoginn technology company", "MyLoginn IT company"],
});

const highlights = [
  { value: "Learn", label: "Skills that matter", Icon: Lightbulb },
  { value: "Build", label: "Real-world projects", Icon: Rocket },
  { value: "Practice", label: "Hands-on approach", Icon: ShieldCheck },
  { value: "Grow", label: "Supportive community", Icon: Sparkles },
];

const offerings = [
  { title: "Courses", text: "Structured, practical technology courses you can learn at your own pace.", href: "/courses", Icon: BookOpenCheck },
  { title: "Projects", text: "Build real projects that turn what you learn into a portfolio.", href: "/projects", Icon: Rocket },
  { title: "Internships", text: "Explore internship opportunities with real work and mentor guidance.", href: "/internships", Icon: Briefcase },
  { title: "Services", text: "Web, mobile, AI and digital marketing solutions for businesses.", href: "/services", Icon: Handshake },
];

const principles = [
  { title: "Innovation", Icon: Target, description: "We embrace new ideas and modern technology to create better solutions." },
  { title: "Integrity", Icon: ShieldCheck, description: "We believe in honesty, transparency and doing what’s right, always." },
  { title: "Collaboration", Icon: Users, description: "We grow together by supporting, sharing and learning from each other." },
  { title: "Impact", Icon: TrendingUp, description: "We focus on real outcomes for people, businesses and the digital future." },
];

const faqs = [
  { question: "What is MyLoginn Tech Private Limited?", answer: "MyLoginn Tech Private Limited is an Indian technology company. MYLOGINN is the company’s primary brand spelling." },
  { question: "What does MyLoginn do?", answer: "MyLoginn brings digital product development, applied AI, digital marketing, and practical technology learning together." },
  { question: "Does MyLoginn offer courses and internships?", answer: "Yes. The company offers technology courses, tutoring, and internship opportunities. Visit the Courses and Internships pages for current information." },
  { question: "How can I discuss a project or program?", answer: "Use the Contact page to tell the team about your goals and the kind of support you are looking for." },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />

      {/* Hero */}
      <Section className="mobile-page-glow pt-3 sm:pt-5 pb-10 sm:pb-14 lg:pb-16">
        <Container className="max-w-[1480px]">
          <div className="grid items-center gap-6 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
            <div className="text-left">
              <Eyebrow><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> About MYLOGINN</Eyebrow>
              <h1 className="mt-4 max-w-2xl text-[1.9rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl">
                Turning Ideas Into <span className="brand-gradient-text">Digital Success</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-lg sm:leading-8">
                <strong className="font-semibold text-foreground">MYLOGINN TECH</strong> is a next-generation digital platform focused on learning, innovation and real-world growth. We help individuals and businesses build skills, create opportunities and achieve more through technology and practical experience.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#who-we-are" className="group inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white shadow-[var(--shadow-lift)] transition hover:-translate-y-0.5 hover:bg-brand-700">
                  Our Mission <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </a>
                <Link href="/services" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-soft bg-surface px-6 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-brand-300">
                  Explore Services
                </Link>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
              <div aria-hidden="true" className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-brand-400/15 blur-3xl dark:bg-brand-500/15" />
              <Image src={aboutHeader} alt="A bright illustration representing ideas becoming digital products and growth" preload sizes="(max-width: 1023px) 90vw, 48vw" className="h-auto w-full select-none object-contain" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Who we are */}
      <Section id="who-we-are" aria-labelledby="who-we-are-title" className="scroll-mt-24 py-0">
        <Container className="max-w-[1480px]">
          <Reveal>
            <div className="glass-panel grid gap-8 rounded-3xl p-5 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12 lg:p-10">
              <div>
                <Eyebrow>Who We Are</Eyebrow>
                <h2 id="who-we-are-title" className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  We’re more than just a <span className="brand-gradient-text">tech platform</span>
                </h2>
                <p className="mt-4 text-sm leading-6 text-muted sm:text-base sm:leading-7">
                  MYLOGINN TECH is built with a vision to empower people with the right skills, practical exposure and modern tools. We bridge learning and real-world opportunities, helping you grow with confidence in the digital world.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {highlights.map(({ value, label, Icon }) => (
                  <div key={value} className="card-shine relative overflow-hidden rounded-2xl border border-border-soft bg-surface p-4 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 sm:p-5">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-xl font-semibold leading-tight sm:text-2xl">{value}</p>
                    <p className="mt-1 text-xs leading-5 text-muted sm:text-sm">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* What we offer */}
      <Section aria-labelledby="offer-title" className="py-12 sm:py-16 lg:py-20">
        <Container className="max-w-[1480px]">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow><GraduationCap className="h-3.5 w-3.5" aria-hidden="true" /> What We Offer</Eyebrow>
              <h2 id="offer-title" className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">Everything you need to grow</h2>
              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">From learning to doing, explore the ways MYLOGINN supports learners, partners and businesses.</p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {offerings.map(({ title, text, href, Icon }, i) => (
              <Reveal key={title} delay={i * 0.06} className="h-full">
                <Link href={href} className="group card-shine relative flex h-full flex-col overflow-hidden rounded-2xl border border-border-soft bg-surface p-5 shadow-[var(--shadow-soft)] transition hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-muted">{text}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300">
                    Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section id="our-values" aria-labelledby="values-title" className="py-0 pb-12 sm:pb-16 lg:pb-20">
        <Container className="max-w-[1480px]">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <Eyebrow>Our Values</Eyebrow>
              <h2 id="values-title" className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">What drives us</h2>
              <p className="mt-3 text-sm leading-6 text-muted sm:text-base">Our values shape how we work, create and support every learner, partner and team member.</p>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {principles.map(({ title, description, Icon }, i) => (
              <Reveal key={title} delay={i * 0.06} className="h-full">
                <article className="glass-panel h-full rounded-2xl p-5 transition hover:-translate-y-1 sm:p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section aria-label="Get started" className="py-0 pb-12 sm:pb-16 lg:pb-20">
        <Container className="max-w-[1480px]">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 px-6 py-10 text-white shadow-[var(--shadow-lift)] sm:px-10 sm:py-12 lg:flex lg:items-center lg:justify-between lg:gap-8">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
              <div className="relative max-w-2xl">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to build your future with us?</h2>
                <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base">Join MYLOGINN TECH and be part of a growing community of learners, creators and digital achievers.</p>
              </div>
              <Link href="/contact" className="group relative mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 lg:mt-0 lg:shrink-0">
                Get Started <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* FAQ */}
      <Section aria-labelledby="about-faq" className="border-t border-border-soft bg-[var(--surface-2)] py-12 sm:py-16">
        <Container className="max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-brand-600 dark:text-brand-300">Learn more</p>
            <h2 id="about-faq" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">A few common questions</h2>
          </div>
          <FaqAccordion items={faqs} className="mt-6" />
          <p className="mt-6 text-center text-sm text-muted">
            Have another question? <Link href="/contact" className="font-semibold text-brand-600 dark:text-brand-300">Talk to our team</Link> · <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-brand-600 dark:text-brand-300">{CONTACT_EMAIL}</a>
          </p>
        </Container>
      </Section>
    </>
  );
}
