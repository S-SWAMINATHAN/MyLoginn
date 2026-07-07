import { Section, Container } from "@/components/ui/Section";
import { LeadForm } from "@/components/services/LeadForm";
import { DigitalMarketingHero } from "@/components/services/DigitalMarketingHero";
import { FeatureBentoGrid } from "@/components/services/FeatureBentoGrid";
import { HowItWorksTimeline } from "@/components/services/HowItWorksTimeline";

export const metadata = { title: "Digital Marketing Services — MyLoginn" };

export default function DigitalMarketingServicesPage() {
  return (
    <Section className="overflow-hidden pt-14">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <DigitalMarketingHero />
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
