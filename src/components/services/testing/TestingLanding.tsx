import type { ReactNode } from "react";
import { Section, Container } from "@/components/ui/Section";
import { TestingEnquiryForm } from "./TestingEnquiryForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { faqStructuredData, serviceStructuredData } from "@/lib/structuredData";
import type { ServiceLandingProps } from "@/components/services/ServiceLanding";
import { AreaGrid } from "@/components/services/story/StoryLanding";
import { RelatedLinks } from "@/components/services/story/RelatedLinks";
import { PointList } from "@/components/services/story/PointList";
import { WebAutomationMonitor, ApiMonitor, MobileTestingPhone, RegressionMonitor, StepTracker } from "./TestingVisuals";

const TESTING_ICONS = ["testing", "devops", "network", "data", "git", "ai"];

/** One alternating text + device row, matching the home-page story chapters. */
export function StoryRow({ eyebrow, title, text, points, visual, flip, id, top }: { eyebrow: string; title: string; text: string; points: string[]; visual: ReactNode; flip?: boolean; id: string; top?: boolean }) {
  return (
    <section id={id} aria-label={eyebrow} className={"scroll-mt-24 mx-auto mt-16 grid w-full min-w-0 max-w-6xl gap-10 px-5 sm:mt-20 sm:px-8 lg:grid-cols-2 lg:gap-16" + (top ? " lg:items-start" : " lg:items-center")}>
      <div className={(flip ? "min-w-0 lg:order-2" : "min-w-0") + (top ? " lg:pt-12" : "")}>
        <Reveal><span className="story-eyebrow">{eyebrow}</span></Reveal>
        <SplitHeadline as="h2" text={title} className="story-subheading mt-4 max-w-lg text-story-navy dark:text-foreground" />
        <Reveal direction="up" delay={0.15}>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted sm:text-base">{text}</p>
        </Reveal>
        <PointList points={points} />
      </div>
      <Reveal direction={flip ? "right" : "left"} delay={0.1} className={flip ? "min-w-0 lg:order-1" : "min-w-0"}>
        {visual}
      </Reveal>
    </section>
  );
}

/** Testing & QA service page: flat-colour, animated and interactive. Same schema, FAQ and enquiry form as ServiceLanding. */
export function TestingLanding(p: ServiceLandingProps) {
  return (
    <Section className="pt-6 sm:pt-10">
      <JsonLd data={serviceStructuredData({ name: p.schemaName, description: p.intro, path: p.path, serviceType: p.serviceType })} />
      <JsonLd data={faqStructuredData(p.faqs)} />

      {/* Hero: web automation monitor */}
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <Reveal><span className="story-eyebrow">{p.eyebrow}</span></Reveal>
          <SplitHeadline as="h1" text={p.h1} className="mt-4 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}>
            <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">{p.intro}</p>
          </Reveal>
          <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap gap-3">
            <a href="#enquiry" className="rounded-full px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] active:scale-95" style={{ background: "var(--story-royal)" }}>
              Request a test scope
            </a>
            <a href="#mobile-testing" className="rounded-full border border-border-soft bg-surface px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:text-story-royal active:scale-95">
              Explore mobile testing
            </a>
          </Reveal>
          <Reveal direction="up" delay={0.35} className="mt-10">
            <StepTracker />
          </Reveal>
        </div>
        <Reveal direction="left" delay={0.15} className="min-w-0">
          <WebAutomationMonitor />
        </Reveal>
      </div>

      <StoryRow
        id="api-testing"
        eyebrow="API testing"
        title="Catch backend bugs before users do."
        text="We test endpoints directly, so authentication, error handling and data contracts are checked independently of the UI."
        points={["Status codes, schemas and response times", "Authentication and permission checks", "Negative cases such as bad input and missing tokens"]}
        visual={<ApiMonitor />}
        flip
      />

      <StoryRow
        id="mobile-testing"
        eyebrow="Mobile testing"
        title="Apps that work on every screen."
        text="Functional and layout checks for mobile apps and mobile web: launch, sign-in, checkout, offline behaviour and different screen sizes. Pick a scenario to see it run on Android and iOS."
        points={["Functional testing of key user journeys", "Layout checks across phone screen sizes", "Android and iOS coverage agreed per project", "Defect reports with steps and screenshots"]}
        visual={<MobileTestingPhone />}
        top
      />

      <StoryRow
        id="regression-ci"
        eyebrow="Regression and CI/CD"
        title="A safety net on every release."
        text="Stable flows become a repeatable suite that runs in your pipeline on each change and reports results clearly."
        points={["Automated regression suites for critical flows", "Runs on every pull request in CI", "Readable reports, traces and screenshots"]}
        visual={<RegressionMonitor />}
        flip
      />

      {/* Capabilities */}
      <Container className="mt-24 max-w-6xl sm:mt-32">
        <section aria-labelledby="svc-areas">
          <Reveal><span className="story-eyebrow">What we deliver</span></Reveal>
          <h2 id="svc-areas" className="story-subheading mt-3 text-story-navy dark:text-foreground">What we can build and deliver</h2>
          <AreaGrid areas={p.areas.map((a, i) => ({ ...a, icon: TESTING_ICONS[i % TESTING_ICONS.length] }))} />
        </section>
      </Container>

      {/* Process + tools */}
      <Container className="mt-24 max-w-6xl sm:mt-32">
        <div className="grid gap-12 lg:grid-cols-5">
          <section aria-labelledby="svc-process" className="lg:col-span-3">
            <Reveal><span className="story-eyebrow">Process</span></Reveal>
            <h2 id="svc-process" className="story-subheading mt-3 text-story-navy dark:text-foreground">How an engagement works</h2>
            <ol className="mt-8 space-y-5 border-l-2 pl-8" style={{ borderColor: "var(--story-line)" }}>
              {p.steps.map((step, i) => (
                <li key={step} className="relative">
                  <Reveal direction="right" delay={i * 0.06}>
                    <span className="absolute -left-[3.05rem] top-1.5 grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white" style={{ background: "var(--story-royal)", boxShadow: "0 0 0 6px var(--background)" }}>{i + 1}</span>
                    <p className="rounded-xl border border-border-soft bg-surface p-4 text-sm leading-6 transition-all duration-300 hover:translate-x-1 hover:border-story-royal">{step}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="svc-tools" className="lg:col-span-2">
            <Reveal><span className="story-eyebrow">Stack</span></Reveal>
            <h2 id="svc-tools" className="story-subheading mt-3 text-story-navy dark:text-foreground">Technologies we work with</h2>
            <RevealGroup className="mt-8 flex flex-wrap gap-2.5">
              {p.tools.map((t) => (
                <RevealItem key={t}>
                  <span className="inline-block cursor-default rounded-full border border-border-soft bg-surface px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-story-royal hover:bg-story-royal hover:text-white">{t}</span>
                </RevealItem>
              ))}
            </RevealGroup>
            <p className="mt-8 leading-7 text-muted">
              MyLoginn Tech Private Limited is an India-based technology company. We work with startups, small and mid-sized businesses and organisations across India, and serve clients in other countries remotely. Scope, timelines and deliverables are agreed in writing before work begins.
            </p>
          </section>
        </div>
      </Container>

      {/* FAQ + form */}
      <Container className="mt-24 max-w-6xl sm:mt-32">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <section aria-labelledby="svc-faq">
              <Reveal><span className="story-eyebrow">FAQ</span></Reveal>
              <h2 id="svc-faq" className="story-subheading mt-3 text-story-navy dark:text-foreground">Frequently asked questions</h2>
              <FaqAccordion items={p.faqs} className="mt-8" />
            </section>
            <RelatedLinks related={p.related} />
          </div>
          <div id="enquiry" className="scroll-mt-24 lg:col-span-2">
            <div className="lg:sticky lg:top-24"><TestingEnquiryForm service={p.leadService} /></div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
