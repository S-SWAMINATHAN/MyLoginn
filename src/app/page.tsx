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

export const metadata = createPageMetadata({
  title: "MyLoginn | AI Digital Marketing & Technology Solutions",
  description:
    "MyLoginn (also searched as My Login or MyLogin) is an Indian technology company offering AI-powered digital marketing, web and mobile development, practical courses, and career support.",
  path: "/",
  keywords: ["AI digital marketing company", "AI digital marketing agency", "digital marketing company in India", "custom software company", "AI development", "business digital transformation", "career training"],
});

export default function Home() {
  return (
    <>
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
