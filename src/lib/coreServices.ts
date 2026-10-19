import { Bot, CodeXml, Megaphone, MonitorCog, Smartphone, type LucideIcon } from "lucide-react";

/**
 * The five core MyLoginn offerings. Every company-facing section of the homepage (hero, technology map, service
 * showcase) reads from this list, so the services are always named and described the same way.
 */
export type CoreServiceId = "web" | "mobile" | "ai" | "marketing" | "software";

export type CoreService = {
  id: CoreServiceId;
  name: string;
  /** Large heading for the service row on the homepage. */
  headline: string;
  /** Label for tight spaces such as the technology map nodes. */
  short: string;
  icon: LucideIcon;
  href: string;
  summary: string;
  points: [string, string, string];
};

export const CORE_SERVICES: CoreService[] = [
  {
    id: "web",
    headline: "We build digital experiences.",
    name: "Web Development",
    short: "Web",
    icon: CodeXml,
    href: "/services/app-web-development",
    summary: "Professional websites, web applications, business platforms and SaaS products, built around how your business works.",
    points: ["Business websites & landing pages", "Web apps, portals & dashboards", "SaaS products & custom platforms"],
  },
  {
    id: "mobile",
    headline: "Apps people actually keep.",
    name: "App Development",
    short: "App",
    icon: Smartphone,
    href: "/services/app-web-development",
    summary: "Modern mobile applications for iOS and Android, with app experiences that scale as your customers grow.",
    points: ["iOS, Android & cross-platform", "Payments, bookings & notifications", "Admin panel & shared backend"],
  },
  {
    id: "ai",
    headline: "AI agents that do real work.",
    name: "AI Agent Creation",
    short: "AI",
    icon: Bot,
    href: "/services/ai-development",
    summary: "AI agents, intelligent automation and AI-powered workflows that work with your data and your tools.",
    points: ["Custom AI agents & assistants", "Workflow & business automation", "Human approval where it matters"],
  },
  {
    id: "marketing",
    headline: "Marketing that brings customers.",
    name: "Digital Marketing",
    short: "Marketing",
    icon: Megaphone,
    href: "/services/digital-marketing",
    summary: "Meta Ads, Google Ads, SEO, branding and performance marketing focused on acquiring customers.",
    points: ["Meta Ads & Google Ads", "SEO & search visibility", "Branding & customer acquisition"],
  },
  {
    id: "software",
    headline: "Software shaped around your business.",
    name: "Custom Software & Desktop Apps",
    short: "Software",
    icon: MonitorCog,
    href: "/services/app-web-development",
    summary: "Custom software and desktop applications — CRMs, ERPs and internal tools shaped around how your business works.",
    points: ["Custom CRM, ERP & internal tools", "Windows & cross-platform desktop apps", "Integrations with your systems"],
  },
];
