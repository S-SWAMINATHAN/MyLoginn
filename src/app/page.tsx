import { Preloader } from "@/components/experience/Preloader";
import { StoryStage } from "@/components/experience/StoryStage";
import { Hero } from "@/components/sections/Hero";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { WebStory } from "@/components/sections/WebStory";
import { MobileStory } from "@/components/sections/MobileStory";
import { DesktopStory } from "@/components/sections/DesktopStory";
import { AiStory } from "@/components/sections/AiStory";
import { AgentsStory } from "@/components/sections/AgentsStory";
import { AutomationStory } from "@/components/sections/AutomationStory";
import { TestingStory } from "@/components/sections/TestingStory";
import { HowWeBuild } from "@/components/sections/HowWeBuild";
import { BusinessSolutions } from "@/components/sections/BusinessSolutions";
import { Education } from "@/components/sections/Education";
import { WhyMyLoginn } from "@/components/sections/WhyMyLoginn";
import { FinalCta } from "@/components/sections/FinalCta";

export default function Home() {
  return (
    <>
      <Preloader />
      <StoryStage>
        <Hero />
        <Ecosystem />
        <WebStory />
        <MobileStory />
        <DesktopStory />
        <AiStory />
        <AgentsStory />
        <AutomationStory />
        <TestingStory />
        <HowWeBuild />
        <BusinessSolutions />
        <Education />
        <WhyMyLoginn />
        <FinalCta />
      </StoryStage>
    </>
  );
}
