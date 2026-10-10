/**
 * Real client/company work shown in the homepage "Built for the real world"
 * section (ProjectShowcase) and linked into their own /projects/[slug] pages.
 * Single source of truth so the homepage cards and the detail pages never
 * drift out of sync.
 */
import type { CardArtKey } from "./projectCardArt";

export type ClientProject = {
  slug: string;
  name: string;
  url: string;
  category: string;
  /** Which illustrated card-banner scene to use (see projectCardArt.ts). */
  artKey: CardArtKey;
  description: string;
  longDescription: string;
  highlights: string[];
  status: "live" | "in-development";
  /** Ooty Nigel Travels blocks being embedded in an iframe — show the
   * hand-built fallback preview instead of trying to load the real site. */
  fallbackPreview?: boolean;
};

export const clientProjects: ClientProject[] = [
  {
    slug: "ziyakart",
    name: "ZiyaKart",
    url: "https://www.ziyakart.com/",
    category: "E-commerce website",
    artKey: "ecommerce",
    description: "A live commerce experience built for browsing and buying.",
    longDescription:
      "Ziya — the Fashion Closet is a Chennai-based online store for Korean-inspired fashion, accessories, and stationery, built for style-conscious shoppers who want modern pieces inspired by Seoul.",
    highlights: [
      "Dresses, accessories and stationery storefronts with Trending Now and New Arrivals",
      "Free shipping on orders over ₹999",
      "Customer support Mon–Sat, 10am–7pm IST",
    ],
    status: "live",
  },
  {
    slug: "ooty-nigel-travels",
    name: "Ooty Nigel Travels",
    url: "https://www.ootynigeltravels.com/",
    category: "Travel website",
    artKey: "travel",
    description: "A focused digital home for discovering Ooty travel experiences.",
    longDescription:
      "Ooty Nigel Travels is a Tamil Nadu travel agency offering private chauffeur-driven taxis and curated Nilgiris holiday packages, from Coimbatore airport transfers to multi-day luxury tours.",
    highlights: [
      "Trip styles for family, couple, adventure and fully custom travel",
      "Itineraries covering Ooty, Mudumalai, Pykara Lake, Coonoor, Kotagiri and more",
      "Online booking with a pay-later option and 24×7 support",
    ],
    status: "live",
    fallbackPreview: true,
  },
  {
    slug: "skill-up-now",
    name: "Skill Up Now",
    url: "https://skillupnowadmin.org",
    category: "Admin platform",
    artKey: "platform",
    description: "A structured platform for managing learning operations.",
    longDescription:
      "SkillUpNow is a Chennai-based mentor-led training platform covering soft skills and IT courses, with separate student, mentor and admin dashboards to manage learning operations end-to-end.",
    highlights: [
      "Live, mentor-led sessions plus project-based tracks and internships",
      "Razorpay payments with zero-cost EMI and bundle discounts",
      "Role-based dashboards for students, mentors and admins",
    ],
    status: "live",
  },
  {
    slug: "rentmitra",
    name: "RentMitra.app",
    url: "",
    category: "Application in development",
    artKey: "webdev",
    description: "A work in progress. The public product preview will arrive when it is ready to share.",
    longDescription:
      "RentMitra.app is currently in active development. We'll publish a full walkthrough here as soon as it's ready for a public preview.",
    highlights: [],
    status: "in-development",
  },
];

export function getClientProject(slug: string): ClientProject | undefined {
  return clientProjects.find((p) => p.slug === slug);
}
