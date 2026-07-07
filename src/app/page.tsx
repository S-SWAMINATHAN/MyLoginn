import { HeroSection } from "@/components/sections/HeroSection";
import { ModulesSection } from "@/components/sections/ModulesSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { CTASection } from "@/components/sections/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ModulesSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}
