import type { ReactNode } from "react";
import { Section, Container } from "@/components/ui/Section";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { TechMarquee } from "./TechMarquee";
import { RelatedLinks } from "./RelatedLinks";
import { IconBadge } from "@/components/ui/IconBadge";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqStructuredData, serviceStructuredData } from "@/lib/structuredData";
import { StoryRow } from "@/components/services/testing/TestingLanding";
import { StepTracker } from "@/components/services/testing/TestingVisuals";
import { TestingEnquiryForm, type NeedOption } from "@/components/services/testing/TestingEnquiryForm";

export type AreaItem = { title: string; text: string; icon: string };

/** Capability cards with the app's animated, topic-matched icons (same set as the course cards). */
export function AreaGrid({ areas }: { areas: AreaItem[] }) {
  return (
    <RevealGroup className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {areas.map((a, i) => (
        <RevealItem key={a.title}>
          <article className="group relative h-full overflow-hidden rounded-2xl border border-border-soft bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:shadow-[var(--shadow-lift)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold sm:text-lg">{a.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{a.text}</p>
              </div>
              <IconBadge size="md" className="shrink-0" delay={i * 0.05}>
                <ContentIcon keyword={a.icon} className="h-13 w-13" />
              </IconBadge>
            </div>
            <span aria-hidden className="absolute bottom-0 left-0 h-0.5 w-0 bg-story-royal transition-all duration-500 group-hover:w-full" />
          </article>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export type StoryRowData = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  points: string[];
  visual: ReactNode;
  flip?: boolean;
  top?: boolean;
};

export type StoryLandingProps = {
  eyebrow: string;
  h1: string;
  intro: string;
  extraIntro?: string;
  cta: ReactNode;
  secondaryLabel: string;
  heroVisual: ReactNode;
  steps: { title: string; text: string }[];
  rows: StoryRowData[];
  areasId: string;
  areasEyebrow?: string;
  areasTitle: string;
  areasIntro?: string;
  areas: AreaItem[];
  tools?: string[];
  toolsTitle?: string;
  faqs: { question: string; answer: string }[];
  faqId: string;
  faqTitle: string;
  related?: { href: string; label: string }[];
  service?: { name: string; description: string; path: string; serviceType: string };
  form: {
    service: string;
    needs: NeedOption[];
    needsQuestion: string;
    goalsPrefix: string;
    submitLabel: string;
    messagePlaceholder: string;
    heading: string;
  };
};

/** Shared flat, animated, interactive service-page layout (same look as the testing page). */
export function StoryLanding(p: StoryLandingProps) {
  return (
    <Section className="pt-6 sm:pt-10">
      {p.service && <JsonLd data={serviceStructuredData({ name: p.service.name, description: p.service.description, path: p.service.path, serviceType: p.service.serviceType })} />}
      <JsonLd data={faqStructuredData(p.faqs)} />

      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <Reveal><span className="story-eyebrow">{p.eyebrow}</span></Reveal>
          <SplitHeadline as="h1" text={p.h1} className="mt-4 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}>
            <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">{p.intro}</p>
            {p.extraIntro && <p className="mt-3 max-w-lg text-sm leading-6 text-muted">{p.extraIntro}</p>}
          </Reveal>
          <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center gap-3">
            {p.cta}
            <a href="#enquiry" className="rounded-full border border-border-soft bg-surface px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:text-story-royal active:scale-95">
              {p.secondaryLabel}
            </a>
          </Reveal>
          <Reveal direction="up" delay={0.35} className="mt-10"><StepTracker steps={p.steps} /></Reveal>
        </div>
        <Reveal direction="left" delay={0.15} className="min-w-0">{p.heroVisual}</Reveal>
      </div>

      {p.rows.map((r) => <StoryRow key={r.id} {...r} />)}

      <Container className="mt-24 max-w-6xl sm:mt-32">
        <section aria-labelledby={p.areasId}>
          <Reveal><span className="story-eyebrow">{p.areasEyebrow ?? "What we deliver"}</span></Reveal>
          <h2 id={p.areasId} className="story-subheading mt-3 text-story-navy dark:text-foreground">{p.areasTitle}</h2>
          {p.areasIntro && <p className="mt-3 max-w-2xl leading-7 text-muted">{p.areasIntro}</p>}
          <AreaGrid areas={p.areas} />
        </section>

        {p.tools && (
          <section aria-label={p.toolsTitle ?? "Technologies"} className="mt-16">
            <Reveal><span className="story-eyebrow">{p.toolsTitle ?? "Technologies we work with"}</span></Reveal>
            <TechMarquee tools={p.tools} />
          </section>
        )}
      </Container>

      <Container className="mt-24 max-w-6xl sm:mt-32">
        <div className="grid gap-12 lg:grid-cols-5">
          <section aria-labelledby={p.faqId} className="lg:col-span-3">
            <Reveal><span className="story-eyebrow">FAQ</span></Reveal>
            <h2 id={p.faqId} className="story-subheading mt-3 text-story-navy dark:text-foreground">{p.faqTitle}</h2>
            <FaqAccordion items={p.faqs} className="mt-8" />
            {p.related && <RelatedLinks related={p.related} />}
          </section>
          <div id="enquiry" className="scroll-mt-24 lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <TestingEnquiryForm
                service={p.form.service}
                needs={p.form.needs}
                needsQuestion={p.form.needsQuestion}
                goalsPrefix={p.form.goalsPrefix}
                submitLabel={p.form.submitLabel}
                messagePlaceholder={p.form.messagePlaceholder}
                heading={p.form.heading}
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
