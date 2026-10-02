import { createPageMetadata } from "@/lib/seo";
import { StoryStage } from "@/components/experience/StoryStage";
import { Hero } from "@/components/sections/Hero";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { WebStory } from "@/components/sections/WebStory";
import { MobileStory } from "@/components/sections/MobileStory";
import { DesktopStory } from "@/components/sections/DesktopStory";
import { AiStory } from "@/components/sections/AiStory";
import { HowWeBuild } from "@/components/sections/HowWeBuild";
import { FinalCta } from "@/components/sections/FinalCta";
import { ProjectShowcase } from "@/components/sections/ProjectShowcase";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationStructuredData, websiteStructuredData } from "@/lib/structuredData";

export const metadata = createPageMetadata({
  title: "MyLoginn | Web, App & AI Development in Coimbatore",
  description:
    "MyLoginn Tech Private Limited provides web and mobile app development, AI solutions, custom software, UI/UX and digital marketing for businesses in Coimbatore, Pollachi and Erode.",
  path: "/",
  keywords: [
    "MyLoginn company", "MyLoginn IT company", "MyLoginn software company",
    "MyLoginn technology company", "MyLoginn official website", "myloginn.com",
    "AI-driven IT company", "technology solutions", "website development",
    "web development", "app development", "mobile app development",
    "digital marketing", "custom software solutions", "UI/UX design", "AI solutions",
  ],
});

export default function Home() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [organizationStructuredData, websiteStructuredData],
      }} />
      <StoryStage>
        <Hero />
        <Ecosystem />
        <WebStory />
        <MobileStory />
        <DesktopStory />
        <AiStory />
        <HowWeBuild />
        <ProjectShowcase />
        <FinalCta />
      </StoryStage>
    </>
  );
}
