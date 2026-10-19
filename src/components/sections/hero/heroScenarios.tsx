"use client";

import type { ReactNode } from "react";
import { Scaled } from "@/components/sections/home/showcase/kit";
import { AiAnalytics, AiWorkflow, MkOverview, MkSeo, SwHr } from "@/components/sections/home/showcase/BusinessTours";
import {
  CafeInventory, CafeSite, CarShowroom, ConciergeChat, DeliveryConsole, FoodDeliveryApp, LocalSearch, PaymentsTerminal, ReviewAgent,
  SalonScheduler, SalonStaffApp, SpaMobile, TravelAd,
} from "@/components/sections/hero/heroPagesB";
import {
  AppAnalytics, ClinicAssistant, ClinicSite, ContentCalendar, FieldServiceApp, FitnessApp, FleetDashboard, InvoiceExtract,
  PropertyAd, RealEstateMobile, ResortSite, RestaurantPos,
} from "@/components/sections/hero/heroPages";

export type DeviceId = "desktop" | "tablet" | "phone";
export type ScenarioId = "web" | "mobile" | "ai" | "marketing" | "software";

export type Scenario = {
  id: ScenarioId;
  /** Short name used on the service rail. */
  label: string;
  /** Full service name. */
  area: string;
  /** One line that says what we deliver; the devices do the rest of the explaining. */
  tagline: string;
  href: string;
  /** The device that tells this story best; it is brought forward while the scenario plays. */
  device: DeviceId;
  /** Address shown in the desktop browser bar (or the window title, for a desktop application). */
  url: string;
  /** A native desktop application: the monitor shows an app window instead of a browser. */
  app?: boolean;
  /** Where the desktop cursor clicks and where a finger taps the tablet and phone, as % of each screen. */
  touches: Record<DeviceId, { x: number; y: number }>;
  screens: Record<DeviceId, () => ReactNode>;
  /** Further sample sets — each time the service comes round again, the next set plays. */
  more?: SampleSet[];
};

export type SampleSet = { url: string; app?: boolean; screens: Record<DeviceId, () => ReactNode> };

/** The scenario with its `n`-th sample set (0 is the scenario's own screens). */
export function withSet(s: Scenario, n: number): Scenario {
  const sets: SampleSet[] = [{ url: s.url, app: s.app, screens: s.screens }, ...(s.more ?? [])];
  const set = sets[n % sets.length];
  return { ...s, url: set.url, app: set.app, screens: set.screens };
}

/*
 * The hero devices run the same full product pages as the service tours, laid out at real size and scaled to each
 * screen: desktop pages at 540px wide, tablet pages at 400px and phone pages at 200px.
 */
const D = (Page: () => ReactNode) => function DesktopScreen() { return <Scaled width={540}><Page /></Scaled>; };
const T = (Page: () => ReactNode) => function TabletScreen() { return <Scaled width={400}><Page /></Scaled>; };
const P = (Page: () => ReactNode) => function PhoneScreen() { return <Scaled width={200}><Page /></Scaled>; };

export const SCENARIOS: Scenario[] = [
  {
    id: "web", label: "Web", area: "Web Development", device: "desktop", href: "/services/app-web-development", url: "yourresort.com",
    tagline: "Websites, web apps and SaaS platforms that convert.",
    touches: { desktop: { x: 30, y: 93 }, tablet: { x: 50, y: 12 }, phone: { x: 50, y: 90 } },
    screens: { desktop: D(ResortSite), tablet: T(ClinicSite), phone: P(RealEstateMobile) },
    more: [{ url: "yourcafe.com", screens: { desktop: D(CafeSite), tablet: T(CarShowroom), phone: P(SpaMobile) } }],
  },
  {
    id: "mobile", label: "App", area: "App Development", device: "phone", href: "/services/app-web-development", url: "console.yourapp.com",
    tagline: "iOS and Android apps your customers keep using.",
    touches: { desktop: { x: 30, y: 70 }, tablet: { x: 90, y: 14 }, phone: { x: 72, y: 50 } },
    screens: { desktop: D(AppAnalytics), tablet: T(RestaurantPos), phone: P(FitnessApp) },
    more: [{ url: "partners.yourapp.com", screens: { desktop: D(DeliveryConsole), tablet: T(PaymentsTerminal), phone: P(FoodDeliveryApp) } }],
  },
  {
    id: "ai", label: "AI Agents", area: "AI Agent Creation", device: "tablet", href: "/services/ai-development", url: "agents.yourbusiness.com",
    tagline: "AI agents and workflows that act around the clock.",
    touches: { desktop: { x: 50, y: 50 }, tablet: { x: 50, y: 45 }, phone: { x: 50, y: 92 } },
    screens: { desktop: D(AiWorkflow), tablet: T(InvoiceExtract), phone: P(ClinicAssistant) },
    more: [{ url: "studio.yourbusiness.ai", screens: { desktop: D(AiAnalytics), tablet: T(ReviewAgent), phone: P(ConciergeChat) } }],
  },
  {
    id: "marketing", label: "Marketing", area: "Digital Marketing", device: "tablet", href: "/services/digital-marketing", url: "ads.yourbusiness.com",
    tagline: "Meta Ads, Google Ads and SEO that bring customers.",
    touches: { desktop: { x: 80, y: 70 }, tablet: { x: 50, y: 88 }, phone: { x: 12, y: 62 } },
    screens: { desktop: D(MkOverview), tablet: T(ContentCalendar), phone: P(PropertyAd) },
    more: [{ url: "seo.yourbusiness.com", screens: { desktop: D(MkSeo), tablet: T(LocalSearch), phone: P(TravelAd) } }],
  },
  {
    id: "software", label: "Software", area: "Custom Software & Desktop Apps", device: "desktop", href: "/services/app-web-development", url: "Fleet Manager", app: true,
    tagline: "Custom software and desktop applications built around your workflow.",
    touches: { desktop: { x: 12, y: 33 }, tablet: { x: 90, y: 30 }, phone: { x: 50, y: 92 } },
    screens: { desktop: D(FleetDashboard), tablet: T(SwHr), phone: P(FieldServiceApp) },
    more: [{ url: "Salon Manager", app: true, screens: { desktop: D(SalonScheduler), tablet: T(CafeInventory), phone: P(SalonStaffApp) } }],
  },
];
