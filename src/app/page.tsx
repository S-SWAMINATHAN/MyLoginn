import nextDynamic from "next/dynamic";
import { createPageMetadata } from "@/lib/seo";
import { localKeywords, regionalKeywords } from "@/lib/localSeo";
import { StoryStage } from "@/components/experience/StoryStage";
import { JsonLd } from "@/components/seo/JsonLd";
import { coreServicesStructuredData, organizationStructuredData, websiteStructuredData } from "@/lib/structuredData";
import { CORE_SERVICES } from "@/lib/coreServices";
import { prisma } from "@/lib/prisma";
import { ReviewSection } from "@/components/about/ReviewSection";

import { Hero } from "@/components/sections/Hero";
const ProblemsSolutions = nextDynamic(() => import("@/components/sections/home/ProblemsSolutions").then((mod) => mod.ProblemsSolutions), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const ServiceShowcase = nextDynamic(() => import("@/components/sections/home/ServiceShowcase").then((mod) => mod.ServiceShowcase), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const ProcessFlow = nextDynamic(() => import("@/components/sections/home/ProcessFlow").then((mod) => mod.ProcessFlow), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const ProjectShowcase = nextDynamic(() => import("@/components/sections/ProjectShowcase").then((mod) => mod.ProjectShowcase), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const AboutValues = nextDynamic(() => import("@/components/sections/home/AboutValues").then((mod) => mod.AboutValues), {
  loading: () => <div className="min-h-[420px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const CareersCta = nextDynamic(() => import("@/components/sections/home/CareersLearnBand").then((mod) => mod.CareersCta), {
  loading: () => <div className="min-h-[160px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
const FinalCta = nextDynamic(() => import("@/components/sections/FinalCta").then((mod) => mod.FinalCta), {
  loading: () => <div className="min-h-[220px] w-full bg-slate-50" aria-busy="true" aria-live="polite" />,
});
export const metadata = createPageMetadata({
  title: "MyLoginn | Web, App & Digital Solutions for Businesses",
  absoluteTitle: true,
  description:
    "Your technology partner to build, automate and grow. MyLoginn creates websites, mobile apps, desktop software and AI agents, and grows them with digital marketing.",
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
    "SaaS development", "CRM development", "ERP development", "iOS app development", "Android app development", "business automation",
  ],
});
export const dynamic = "force-dynamic";

export default async function Home() {
  const reviewFields = { id: true, name: true, company: true, rating: true, content: true, submittedAt: true } as const;
  const reviewOrder = [{ sortOrder: "asc" as const }, { submittedAt: "desc" as const }];
  const featuredReviews = await prisma.customerReview.findMany({ where: { status: "APPROVED", published: true, featured: true }, orderBy: reviewOrder, take: 6, select: reviewFields }).catch(() => []);
  const reviews = featuredReviews.length ? featuredReviews : await prisma.customerReview.findMany({ where: { status: "APPROVED", published: true }, orderBy: reviewOrder, take: 6, select: reviewFields }).catch(() => []);
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [organizationStructuredData, websiteStructuredData, coreServicesStructuredData(CORE_SERVICES)],
      }} />
      <StoryStage>
        <Hero />
        <ServiceShowcase />
        <ProblemsSolutions />
        <ProcessFlow />
        <ProjectShowcase />
        <AboutValues />
        {reviews.length > 0 && <div className="w-full bg-story-mist py-14 sm:py-18"><ReviewSection compact reviews={reviews.map((review) => ({ ...review, submittedAt: review.submittedAt.toISOString() }))} /></div>}
        <CareersCta />
        <FinalCta />
      </StoryStage>
    </>
  );
}
