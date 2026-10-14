import dynamic from "next/dynamic";
import { createPageMetadata } from "@/lib/seo";
import { localKeywords, regionalKeywords } from "@/lib/localSeo";
import { StoryStage } from "@/components/experience/StoryStage";
import { ScrollToSection } from "@/components/experience/ScrollToSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationStructuredData, websiteStructuredData } from "@/lib/structuredData";

const Hero = dynamic(() => import("@/components/sections/Hero").then((mod) => mod.Hero), {
  loading: () => <div className="min-h-[440px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const Ecosystem = dynamic(() => import("@/components/sections/Ecosystem").then((mod) => mod.Ecosystem), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const WebStory = dynamic(() => import("@/components/sections/WebStory").then((mod) => mod.WebStory), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const MobileStory = dynamic(() => import("@/components/sections/MobileStory").then((mod) => mod.MobileStory), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const DesktopStory = dynamic(() => import("@/components/sections/DesktopStory").then((mod) => mod.DesktopStory), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const AiStory = dynamic(() => import("@/components/sections/AiStory").then((mod) => mod.AiStory), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const HowWeBuild = dynamic(() => import("@/components/sections/HowWeBuild").then((mod) => mod.HowWeBuild), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const ProjectShowcase = dynamic(() => import("@/components/sections/ProjectShowcase").then((mod) => mod.ProjectShowcase), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const FinalCta = dynamic(() => import("@/components/sections/FinalCta").then((mod) => mod.FinalCta), {
  loading: () => <div className="min-h-[220px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});

export const metadata = createPageMetadata({
  title: "MyLoginn",
  absoluteTitle: true,
  description:
    "MyLoginn Tech Private Limited is an India-based technology company building web, mobile, custom software, AI and automation solutions for businesses worldwide, including Coimbatore and Tamil Nadu.",
  path: "/",
  keywords: [
    ...regionalKeywords(["web development company", "software development company", "AI development company"]),
    ...localKeywords(["web development company", "software development company", "app development company", "AI solutions", "digital marketing company", "technology company"]),
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
      <ScrollToSection id="ecosystem" />
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
