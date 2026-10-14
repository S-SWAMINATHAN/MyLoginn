import { createPageMetadata } from "@/lib/seo";
import { localKeywords, regionalKeywords } from "@/lib/localSeo";
import { MarketingLanding } from "@/components/services/marketing/MarketingLanding";

const marketingAreas = [
  { title: "Search and content strategy", description: "Plan useful search content, on-page improvements and content themes around your audience and business goals." },
  { title: "Social media marketing", description: "Shape channel plans, publishing calendars and platform-appropriate creative for your social presence." },
  { title: "Instagram, Facebook and YouTube", description: "Plan platform-specific organic content and paid campaign creative for the channels relevant to your audience." },
  { title: "LinkedIn marketing", description: "Develop professional content and campaign plans for business audiences and company pages." },
  { title: "Meta and Google Ads", description: "Set up paid campaign structure, audiences, budgets and measurement for review before launch." },
  { title: "Lead generation and measurement", description: "Connect campaign activity to enquiry paths and review available performance data to guide next steps." },
];

const marketingFaqs = [
  { question: "What does MyLoginn include in digital marketing?", answer: "Scope can include search and content strategy, social media, paid campaign planning, lead generation paths, and performance review. The exact work is agreed for each enquiry." },
  { question: "Which social platforms can you support?", answer: "The service can cover Instagram, Facebook, YouTube, and LinkedIn, depending on the audience, goals, and agreed scope." },
  { question: "Do you manage Google Ads and Meta Ads?", answer: "Campaign planning and setup for Google Ads and Meta Ads can be discussed as part of a marketing engagement. Ad spend and access requirements are agreed separately." },
  { question: "Can you guarantee leads or a specific return on ad spend?", answer: "No. Results depend on the offer, audience, budget, platform, and other factors. MyLoginn can agree on measurement and review campaign performance, but cannot guarantee a particular outcome." },
  { question: "How can I request a marketing proposal?", answer: "Use the marketing enquiry form on this page to share your goals, audience, channels, and any relevant website or campaign details." },
];

export const metadata = createPageMetadata({
  title: "Digital Marketing",
  description: "SEO, paid campaigns, social media, content and analytics from MyLoginn, an India-based team supporting businesses across India, including Coimbatore and Tamil Nadu, and internationally.",
  path: "/services/digital-marketing",
  keywords: [
    ...regionalKeywords(["digital marketing agency", "SEO company"]),
    ...localKeywords(["digital marketing company", "SEO services", "social media marketing", "Google Ads agency"]),
    "MyLoginn digital marketing", "digital marketing company",
    "digital marketing services", "AI digital marketing solutions",
    "SEO services", "social media marketing", "Google Ads management",
    "Meta Ads management", "paid advertising", "content marketing",
    "marketing analytics",
  ],
});

export default function DigitalMarketingServicesPage() {
  return <MarketingLanding areas={marketingAreas} faqs={marketingFaqs} />;
}
