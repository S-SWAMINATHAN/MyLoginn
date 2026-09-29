import { createPageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/ui/Section";
import { LeadForm } from "@/components/services/LeadForm";
import { DigitalMarketingHero } from "@/components/services/DigitalMarketingHero";
import { FeatureBentoGrid } from "@/components/services/FeatureBentoGrid";
import { HowItWorksTimeline } from "@/components/services/HowItWorksTimeline";
import { ProjectRequestTrigger } from "@/components/services/ProjectRequestTrigger";
import { JsonLd } from "@/components/seo/JsonLd";

const marketingAreas = [
  { title: "Search and content strategy", description: "Plan useful search content, on-page improvements and content themes around your audience and business goals." },
  { title: "Social media marketing", description: "Shape channel plans, publishing calendars and platform-appropriate creative for your social presence." },
  { title: "Instagram, Facebook and YouTube", description: "Plan platform-specific organic content and paid campaign creative for the channels relevant to your audience." },
  { title: "LinkedIn marketing", description: "Develop professional content and campaign plans for business audiences and company pages." },
  { title: "Meta and Google Ads", description: "Set up paid campaign structure, audiences, budgets and measurement for review before launch." },
  { title: "Lead generation and measurement", description: "Connect campaign activity to enquiry paths and review available performance data to guide next steps." },
];

const marketingFaqs = [
  { question: "What does MyLoginn include in digital marketing?", answer: "Scope can include search and content strategy, social media, paid campaign planning, lead generation paths, and performance review. The exact work is agreed for each enquiry." },
  { question: "Which social platforms can you support?", answer: "The service can cover Instagram, Facebook, YouTube, and LinkedIn, depending on the audience, goals, and agreed scope." },
  { question: "Do you manage Google Ads and Meta Ads?", answer: "Campaign planning and setup for Google Ads and Meta Ads can be discussed as part of a marketing engagement. Ad spend and access requirements are agreed separately." },
  { question: "Can you guarantee leads or a specific return on ad spend?", answer: "No. Results depend on the offer, audience, budget, platform, and other factors. MyLoginn can agree on measurement and review campaign performance, but cannot guarantee a particular outcome." },
  { question: "How can I request a marketing proposal?", answer: "Use the marketing enquiry form on this page to share your goals, audience, channels, and any relevant website or campaign details." },
];

export const metadata = createPageMetadata({
  title: "AI Digital Marketing Agency & Services",
  description: "Grow your business with MyLoginn Tech Private Limited, an AI-focused digital marketing company offering SEO, paid campaigns, social media, content, and performance analytics.",
  path: "/services/digital-marketing",
  keywords: [
    "MyLoginn digital marketing", "digital marketing company",
    "digital marketing services", "AI digital marketing solutions",
    "SEO services", "social media marketing", "Google Ads management",
    "Meta Ads management", "paid advertising", "content marketing",
    "marketing analytics",
  ],
});

export default function DigitalMarketingServicesPage() {
  return (
    <Section className="overflow-hidden pt-3 sm:pt-5">
      <Container className="max-w-[1480px]">
        <DigitalMarketingHero />
        <ProjectRequestTrigger service="marketing" label="Plan your marketing campaign" className="mt-8" />
        <section aria-labelledby="marketing-services" className="mt-12">
          <h2 id="marketing-services" className="text-2xl font-semibold tracking-tight sm:text-3xl">Digital marketing services</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted">Choose a focused set of activities based on your audience, goals and budget. The team agrees on deliverables and measurement before campaign work begins.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {marketingAreas.map((area) => <article key={area.title} className="rounded-2xl border border-border-soft bg-surface p-5"><h3 className="font-semibold">{area.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{area.description}</p></article>)}
          </div>
        </section>
        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <FeatureBentoGrid />
            <HowItWorksTimeline />
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <LeadForm service="Digital Marketing" variant="dynamic" />
            </div>
          </div>
        </div>
        <section aria-labelledby="marketing-faq" className="mt-16">
          <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: marketingFaqs.map(({ question, answer }) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) }} />
          <h2 id="marketing-faq" className="text-2xl font-semibold tracking-tight sm:text-3xl">Digital marketing FAQs</h2>
          <div className="mt-5 divide-y divide-border-soft rounded-2xl border border-border-soft bg-surface px-5 sm:px-7">
            {marketingFaqs.map(({ question, answer }) => <details key={question} className="py-5"><summary className="cursor-pointer font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">{question}</summary><p className="mt-3 max-w-3xl leading-7 text-muted">{answer}</p></details>)}
          </div>
        </section>
      </Container>
    </Section>
  );
}
