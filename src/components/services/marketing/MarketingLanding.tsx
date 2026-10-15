import { Section, Container } from "@/components/ui/Section";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/experience/SplitHeadline";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqStructuredData } from "@/lib/structuredData";
import { StoryRow } from "@/components/services/testing/TestingLanding";
import { AreaGrid } from "@/components/services/story/StoryLanding";
import { StepTracker } from "@/components/services/testing/TestingVisuals";
import { TestingEnquiryForm, type NeedOption } from "@/components/services/testing/TestingEnquiryForm";
import { CampaignDashboardMonitor, ContentCalendarMonitor, BudgetPlannerMonitor, WhatsAppLeadPhone, PlanMarketingButton } from "./MarketingVisuals";

type Area = { title: string; description: string };
type Faq = { question: string; answer: string };

const MARKETING_ICONS = ["data", "comm", "marketing", "business", "leader", "network"];

const STEPS = [
  { title: "Discovery", text: "Clarify your goals, audience, current channels and budget." },
  { title: "Plan", text: "Agree on the channel mix, creative needs, targeting and measures." },
  { title: "Launch", text: "Set up and publish the approved campaigns." },
  { title: "Review", text: "Assess available performance data and discuss next steps." },
];

const NEEDS: NeedOption[] = [
  { label: "SEO & content", color: "#2563eb" },
  { label: "Social media", color: "#7c3aed" },
  { label: "Instagram / Facebook / YouTube", color: "#e11d48" },
  { label: "LinkedIn", color: "#2563eb" },
  { label: "Google Ads", color: "#059669" },
  { label: "Meta Ads", color: "#d97706" },
  { label: "Lead generation", color: "#7c3aed" },
  { label: "WhatsApp marketing", color: "#059669" },
  { label: "Not sure yet", color: "#e11d48" },
];

/** Digital marketing service page: same flat, animated, interactive layout as the testing page. */
export function MarketingLanding({ areas, faqs }: { areas: Area[]; faqs: Faq[] }) {
  return (
    <Section className="pt-6 sm:pt-10">
      <JsonLd data={faqStructuredData(faqs)} />

      {/* Hero */}
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <Reveal><span className="story-eyebrow">Growth Marketing</span></Reveal>
          <SplitHeadline as="h1" text="Scale your business with data-driven digital marketing" className="mt-4 max-w-xl text-4xl font-bold leading-[1.08] tracking-tight text-story-navy sm:text-5xl dark:text-foreground" />
          <Reveal direction="up" delay={0.15}>
            <p className="mt-5 max-w-lg text-base leading-8 text-muted sm:text-lg">
              For SMEs, startups and established businesses looking to scale online &mdash; we run performance marketing powered by AI, with WhatsApp built into the customer journey.
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.25} className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <PlanMarketingButton />
            <a href="#enquiry" className="rounded-full border border-border-soft bg-surface px-6 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-1 hover:border-story-royal hover:text-story-royal active:scale-95">
              Get a proposal
            </a>
          </Reveal>
          <Reveal direction="up" delay={0.35} className="mt-10"><StepTracker steps={STEPS} /></Reveal>
        </div>
        <Reveal direction="left" delay={0.15} className="min-w-0"><CampaignDashboardMonitor /></Reveal>
      </div>

      <StoryRow
        id="social-media"
        eyebrow="Social media"
        title="Content that keeps a steady rhythm."
        text="Channel plans, publishing calendars and platform-appropriate creative for Instagram, Facebook, YouTube and LinkedIn. Filter the calendar to see each platform."
        points={["Publishing calendars planned around your goals", "Platform-specific organic and paid creative", "Professional content for LinkedIn business audiences"]}
        visual={<ContentCalendarMonitor />}
        flip
      />

      <StoryRow
        id="paid-ads"
        eyebrow="Meta and Google Ads"
        title="Paid campaigns planned before launch."
        text="We set up campaign structure, audiences, budgets and measurement for your review before anything goes live. Try the planner to see how a budget could be split."
        points={["Budget and channel split agreed up front", "Audience and campaign structure for Meta and Google", "Ad spend and account access agreed separately"]}
        visual={<BudgetPlannerMonitor />}
      />

      <StoryRow
        id="whatsapp"
        eyebrow="Lead generation"
        title="From first message to qualified lead."
        text="Connect campaign activity to enquiry paths, including WhatsApp flows planned in line with consent and platform requirements, and review the data available to guide next steps."
        points={["Enquiry paths from ads and content to your team", "WhatsApp messages and lead flows with consent in mind", "Measurable goals and practical reviews"]}
        visual={<WhatsAppLeadPhone />}
        flip
        top
      />

      {/* Services */}
      <Container className="mt-24 max-w-6xl sm:mt-32">
        <section aria-labelledby="marketing-services">
          <Reveal><span className="story-eyebrow">What we deliver</span></Reveal>
          <h2 id="marketing-services" className="story-subheading mt-3 text-story-navy dark:text-foreground">Digital marketing services</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Choose a focused set of activities based on your audience, goals and budget. MyLoginn supports businesses in India and worldwide. The team agrees on deliverables and measurement before campaign work begins.</p>
          <AreaGrid areas={areas.map((a, i) => ({ title: a.title, text: a.description, icon: MARKETING_ICONS[i % MARKETING_ICONS.length] }))} />
        </section>
      </Container>

      {/* FAQ + form */}
      <Container className="mt-24 max-w-6xl sm:mt-32">
        <div className="grid gap-12 lg:grid-cols-5">
          <section aria-labelledby="marketing-faq" className="min-w-0 lg:col-span-3">
            <Reveal><span className="story-eyebrow">FAQ</span></Reveal>
            <h2 id="marketing-faq" className="story-subheading mt-3 text-story-navy dark:text-foreground">Digital marketing FAQs</h2>
            <FaqAccordion items={faqs} className="mt-8" />
          </section>
          <div id="enquiry" className="scroll-mt-24 lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <TestingEnquiryForm
                service="Digital Marketing"
                needs={NEEDS}
                needsQuestion="What do you need help with?"
                goalsPrefix="Marketing needs"
                submitLabel="Request a proposal"
                messagePlaceholder="Tell us about your business, audience, channels or website…"
                heading="Plan your marketing campaign"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
