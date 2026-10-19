import { createPageMetadata } from "@/lib/seo";
import { localKeywords, regionalKeywords } from "@/lib/localSeo";
import { StoryLanding } from "@/components/services/story/StoryLanding";
import { PlanCta, StackLayersMonitor, AppPhone, DeployMonitor } from "@/components/services/story/StoryVisuals";
import { ClientRequestMonitor } from "@/components/services/story/ClientRequestMonitor";

const developmentAreas = [
  { title: "Business websites and landing pages", text: "Clear, fast sites that present your business and lead visitors to an enquiry.", icon: "html" },
  { title: "Web applications and internal tools", text: "Dashboards, portals and admin tools built around your team's workflows.", icon: "webdev" },
  { title: "Android, iOS and cross-platform apps", text: "Mobile apps for your customers or staff, with platform support agreed per project.", icon: "react" },
  { title: "UI and UX design implementation", text: "Your designs turned into responsive, accessible interfaces.", icon: "css" },
  { title: "Backend services, APIs and integrations", text: "Server logic, APIs and connections to the tools and services you already use.", icon: "nodejs" },
  { title: "Database design and authentication", text: "Structured data, secure sign-in and role-based access.", icon: "postgresql" },
  { title: "Cloud deployment and release support", text: "Hosting, deployment and release steps set up and documented.", icon: "cloud" },
  { title: "Testing, maintenance and performance", text: "Quality checks, ongoing maintenance and performance improvements.", icon: "testing" },
];

const developmentFaqs = [
  { question: "What can MyLoginn build?", answer: "The team can discuss websites, web applications, mobile apps, custom software, APIs and related product work. Scope is agreed for each project." },
  { question: "Can you work on an existing website or application?", answer: "Yes. Share the current product, goals and technical context through the project enquiry form so the team can assess a suitable scope." },
  { question: "Which technology will my project use?", answer: "The technology stack is selected around the product requirements, integrations, hosting and maintenance needs. The stack shown on this page is an overview of technologies used by the team." },
  { question: "Do you provide testing and maintenance?", answer: "Testing and ongoing maintenance can be included in the project plan. The deliverables and support period are agreed before work begins." },
  { question: "How do I request an estimate?", answer: "Use the enquiry form to outline your goals, expected users, key features, integrations and any timeline constraints. The team can follow up to clarify the scope." },
];

const stack = ["Next.js", "React Native", "Node.js", "PostgreSQL", "Prisma", "Three.js", "Tailwind CSS", "AWS / Vercel"];

export const metadata = createPageMetadata({
  title: "Web, App & Desktop Software Development",
  description: "Websites, web apps and SaaS platforms, iOS and Android apps, and custom desktop software such as CRMs and ERPs, built by MyLoginn's India-based team.",
  path: "/services/app-web-development",
  keywords: [
    ...regionalKeywords(["web development company", "mobile app development"]),
    ...localKeywords(["web development company", "website development", "mobile app development", "custom software development"]),
    "MyLoginn website development", "web development company",
    "website development services", "web application development",
    "mobile app development company", "app development company",
    "custom software development", "full-stack development",
    "desktop application development", "CRM development", "ERP development", "SaaS development",
    "iOS app development", "Android app development", "business website development",
  ],
});

const needs = [
  { label: "Business website", color: "#2563eb" },
  { label: "Web application", color: "#7c3aed" },
  { label: "Mobile app (Android / iOS)", color: "#059669" },
  { label: "Custom software", color: "#d97706" },
  { label: "APIs & integrations", color: "#e11d48" },
  { label: "UI / UX design", color: "#2563eb" },
  { label: "Maintenance & support", color: "#7c3aed" },
  { label: "Not sure yet", color: "#059669" },
];

export default function AppWebDevelopmentPage() {
  return (
    <StoryLanding
      service={{ name: "Web, App and Desktop Software Development", description: "Websites, web applications, SaaS platforms, iOS and Android apps, and custom desktop software built around how a business works.", path: "/services/app-web-development", serviceType: "Software development" }}
      eyebrow="Full-stack development"
      h1="Development that builds scalable platforms"
      intro="Custom end-to-end app and web development, leveraging modern technology stacks for robust, high-performance, and secure user experiences."
      extraIntro="We work with businesses in India and worldwide on website development, mobile app development, and custom software projects."
      cta={<PlanCta label="Plan a web project" service="web" />}
      secondaryLabel="Get an estimate"
      heroVisual={<ClientRequestMonitor />}
      steps={[
        { title: "Discuss goals", text: "Discuss goals and requirements." },
        { title: "Agree scope", text: "Agree on scope and milestones." },
        { title: "Build", text: "Design and build the product." },
        { title: "Release", text: "Test, release and review support needs." },
      ]}
      rows={[
        { id: "stack", eyebrow: "Technology stack", title: "A stack chosen for your product.", text: "The technology stack is selected around product requirements, integrations, hosting and maintenance needs. Select a layer to see the tools we use.", points: ["Full-stack development shaped around an agreed scope", "Polished interactions designed to work across supported devices", "Live data updates for dashboards and admin tools where needed"], visual: <StackLayersMonitor />, flip: true },
        { id: "mobile-apps", eyebrow: "Mobile apps", title: "Android and iOS apps people keep.", text: "Android, iOS and cross-platform apps, built on the same backend as your website so there is one source of truth.", points: ["Android, iOS and cross-platform apps", "UI and UX design implementation", "Backend services, APIs and integrations"], visual: <AppPhone /> },
        { id: "release", eyebrow: "Release and support", title: "Shipped, monitored, maintained.", text: "Cloud deployment, release support, monitoring and maintenance can be included in the agreed delivery scope.", points: ["Cloud deployment and release support", "Testing, maintenance and performance improvements", "Monitoring, patching and scaling as agreed"], visual: <DeployMonitor />, flip: true },
      ]}
      areasId="development-capabilities"
      areasTitle="Development capabilities"
      areasIntro="Select the product and support areas relevant to your project. Final scope, platform support and delivery details are agreed during discovery."
      areas={developmentAreas}
      tools={stack}
      toolsTitle="Our stack"
      faqs={developmentFaqs}
      faqId="development-faq"
      faqTitle="App and web development FAQs"
      form={{ service: "App & Website Development", needs, needsQuestion: "What do you want to build?", goalsPrefix: "Project type", submitLabel: "Request an estimate", messagePlaceholder: "Describe your goals, expected users, key features, integrations or timeline…", heading: "Tell us about your project" }}
    />
  );
}
