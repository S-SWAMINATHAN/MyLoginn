import { createPageMetadata } from "@/lib/seo";
import { Section, Container } from "@/components/ui/Section";
import { LeadForm } from "@/components/services/LeadForm";
import { DigitalMarketingHero } from "@/components/services/DigitalMarketingHero";
import { FeatureBentoGrid } from "@/components/services/FeatureBentoGrid";
import { HowItWorksTimeline } from "@/components/services/HowItWorksTimeline";
import { ProjectRequestTrigger } from "@/components/services/ProjectRequestTrigger";

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
      </Container>
    </Section>
  );
}
