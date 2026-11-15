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
  /** Short project-specific result displayed in the visual preview. */
  cardMetric?: string;
  description: string;
  longDescription: string;
  highlights: string[];
  /** Who the product is built for. */
  audience?: string;
  /** Feature areas shown as cards on the detail page. */
  features?: { title: string; text: string }[];
  /** What MyLoginn delivered on the project. */
  deliverables?: string[];
  /** Delivery platform; defaults to "web". */
  platform?: "web" | "mobile" | "desktop";
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
    audience: "Style-conscious shoppers who want modern, Seoul-inspired fashion, accessories and stationery delivered across India.",
    features: [
      { title: "Storefront by category", text: "Separate Dresses, Accessories and Stationery storefronts keep browsing quick and focused." },
      { title: "Merchandising built in", text: "Trending Now and New Arrivals sections keep the home page fresh without a redesign." },
      { title: "Clear shipping and support", text: "Free shipping on orders over ₹999 and support Monday to Saturday, 10am to 7pm IST are visible where shoppers decide." },
    ],
    deliverables: ["E-commerce storefront design", "Responsive shopping experience", "Product catalogue and merchandising sections", "Launch, hosting support and ongoing updates"],
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
    audience: "Families, couples and adventure travellers planning Nilgiris holidays, plus visitors who need airport transfers from Coimbatore.",
    features: [
      { title: "Trip styles", text: "Family, couple, adventure and fully custom travel options help visitors pick the right experience fast." },
      { title: "Rich itineraries", text: "Routes cover Ooty, Mudumalai, Pykara Lake, Coonoor, Kotagiri and more, from day trips to multi-day tours." },
      { title: "Easy booking", text: "Online booking with a pay-later option and 24×7 support removes friction at the moment of decision." },
    ],
    deliverables: ["Travel website design and build", "Package and itinerary pages", "Booking enquiry flow", "Launch and ongoing updates"],
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
    audience: "Students, mentors and administrators who run mentor-led soft-skill and IT training end to end.",
    features: [
      { title: "Live, mentor-led learning", text: "Live sessions, project-based tracks and internships sit together in one place." },
      { title: "Payments that fit learners", text: "Razorpay checkout with zero-cost EMI and bundle discounts makes courses easier to afford." },
      { title: "Role-based dashboards", text: "Separate student, mentor and admin dashboards keep every role focused on its own tasks." },
    ],
    deliverables: ["Admin platform design and build", "Student, mentor and admin dashboards", "Payment integration", "Launch and ongoing support"],
    status: "live",
  },
  {
    slug: "u-tele-services",
    name: "U Tele Services",
    url: "",
    category: "Digital marketing",
    artKey: "network",
    cardMetric: "100+ leads generated",
    description: "Digital marketing for a network company, with 100+ leads generated.",
    longDescription:
      "U Tele Services is a network company. MyLoginn supported its digital marketing and lead generation, generating more than 100 leads. The campaign result is presented with a visual data summary.",
    highlights: ["100+ leads generated", "Network company", "Visual campaign result summary"],
    audience: "A network services business looking to grow its customer enquiries.",
    features: [
      { title: "Lead generation", text: "Digital marketing work focused on bringing relevant enquiries to U Tele Services." },
      { title: "Results at a glance", text: "A visual campaign summary makes the 100+ generated leads easy to scan." },
    ],
    deliverables: ["Digital marketing support", "Lead generation campaign", "Visual summary of campaign results"],
    status: "live",
  },
  {
    slug: "loginn-digital-jadhagam",
    name: "Loginn Digital Jadhagam",
    url: "",
    category: "Digital marketing",
    artKey: "jadhagam",
    cardMetric: "69+ leads generated",
    description: "Digital marketing that generated 69+ leads for Loginn Digital Jadhagam.",
    longDescription:
      "MyLoginn supported digital marketing and lead generation for Loginn Digital Jadhagam, generating more than 69 leads.",
    highlights: ["69+ leads generated", "Digital marketing", "Lead generation"],
    deliverables: ["Digital marketing support", "Lead generation campaign", "Campaign result reporting"],
    status: "live",
  },
  {
    slug: "tcs-creakers-shops",
    name: "TCS Creakers Shops",
    url: "",
    category: "Digital marketing",
    artKey: "shop-leads",
    cardMetric: "80+ real leads",
    description: "Digital marketing for TCS Creakers Shops, generating 80+ real leads.",
    longDescription:
      "MyLoginn supported digital marketing and lead generation for TCS Creakers Shops, generating more than 80 real leads.",
    highlights: ["80+ real leads", "Digital marketing", "Lead generation"],
    deliverables: ["Digital marketing support", "Lead generation campaign", "Campaign result reporting"],
    status: "live",
  },
  {
    slug: "tcs-creakers-shop-crm",
    name: "TCS Creakers Shop CRM",
    url: "",
    category: "Desktop CRM application",
    artKey: "crm",
    cardMetric: "Desktop CRM",
    description: "A custom desktop CRM application built for TCS Creakers Shop.",
    longDescription:
      "MyLoginn built a desktop customer relationship management application for TCS Creakers Shop. The application is a private business tool and does not have a public website preview.",
    highlights: ["Desktop application", "CRM for TCS Creakers Shop", "Private business software"],
    audience: "TCS Creakers Shop staff managing customer relationships for the business.",
    deliverables: ["Desktop CRM application", "Application setup for TCS Creakers Shop"],
    platform: "desktop",
    status: "live",
  },
  {
    slug: "rentmitra",
    name: "RentMitra.app",
    url: "",
    category: "Mobile app in development",
    artKey: "mobile",
    platform: "mobile",
    description: "A mobile app in development. The public product preview will arrive when it is ready to share.",
    longDescription:
      "RentMitra is a mobile app currently in active development. We'll publish a full walkthrough here as soon as it's ready for a public preview.",
    highlights: [],
    status: "in-development",
  },
];

export function getClientProject(slug: string): ClientProject | undefined {
  return clientProjects.find((p) => p.slug === slug);
}
