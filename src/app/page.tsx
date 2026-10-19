import dynamic from "next/dynamic";
import { createPageMetadata } from "@/lib/seo";
import { localKeywords, regionalKeywords } from "@/lib/localSeo";
import { StoryStage } from "@/components/experience/StoryStage";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationStructuredData, websiteStructuredData } from "@/lib/structuredData";

const Hero = dynamic(() => import("@/components/sections/Hero").then((mod) => mod.Hero), {
  loading: () => <div className="min-h-[440px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const ProblemsSolutions = dynamic(() => import("@/components/sections/home/ProblemsSolutions").then((mod) => mod.ProblemsSolutions), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const ServiceShowcase = dynamic(() => import("@/components/sections/home/ServiceShowcase").then((mod) => mod.ServiceShowcase), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const ProcessFlow = dynamic(() => import("@/components/sections/home/ProcessFlow").then((mod) => mod.ProcessFlow), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const ProjectShowcase = dynamic(() => import("@/components/sections/ProjectShowcase").then((mod) => mod.ProjectShowcase), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const AboutValues = dynamic(() => import("@/components/sections/home/AboutValues").then((mod) => mod.AboutValues), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const CareersCta = dynamic(() => import("@/components/sections/home/CareersLearnBand").then((mod) => mod.CareersCta), {
  loading: () => <div className="min-h-[160px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const FinalCta = dynamic(() => import("@/components/sections/FinalCta").then((mod) => mod.FinalCta), {
  loading: () => <div className="min-h-[220px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const LearnTeaser = dynamic(() => import("@/components/sections/home/CareersLearnBand").then((mod) => mod.LearnTeaser), {
  loading: () => <div className="min-h-[80px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});

export const metadata = createPageMetadata({
  title: "MyLoginn",
  absoluteTitle: true,
  description:
    "MyLoginn Tech Private Limited is an India-based IT company: web development, app development, AI agent creation, digital marketing and custom software and desktop applications for businesses in Coimbatore, Tamil Nadu and worldwide.",
  path: "/",
  keywords: [
    ...regionalKeywords(["web development company", "software development company", "AI development company"]),
    ...localKeywords(["web development company", "software development company", "app development company", "AI solutions", "digital marketing company", "technology company"]),
    "MyLoginn company", "MyLoginn IT company", "MyLoginn software company",
    "MyLoginn technology company", "MyLoginn official website", "myloginn.com",
    "AI-driven IT company", "technology solutions", "website development",
    "web development", "app development", "mobile app development",
    "digital marketing", "custom software solutions", "UI/UX design", "AI solutions",
    "AI agent development", "Meta Ads", "Google Ads", "SEO services", "custom software development", "desktop application development",
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
        <ProblemsSolutions />
        <ServiceShowcase />
        <ProcessFlow />
        <ProjectShowcase />
        <AboutValues />
        <CareersCta />
        <FinalCta />
        <LearnTeaser />
      </StoryStage>
    </>
  );
}
