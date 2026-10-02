import dynamic from "next/dynamic";
import { createPageMetadata } from "@/lib/seo";
import { StoryStage } from "@/components/experience/StoryStage";
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
