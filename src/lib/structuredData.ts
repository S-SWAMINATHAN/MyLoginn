import { CONTACT_EMAIL, CONTACT_PHONES, SOCIAL_LINKS } from "@/lib/contactInfo";
import { siteUrl } from "@/lib/site";

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "MyLoginn Tech Private Limited",
  alternateName: ["MyLoginn", "My Loginn", "MyLoginn Tech"],
  legalName: "MyLoginn Tech Private Limited",
  url: siteUrl,
  logo: `${siteUrl}/myloginn-logo.png`,
  image: `${siteUrl}/myloginn-logo.png`,
  description:
    "MyLoginn Tech Private Limited is an India-based IT company building websites, web apps, mobile apps, custom desktop software, AI agents and digital marketing for businesses in India and worldwide.",
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONES[0].tel,
  sameAs: SOCIAL_LINKS.filter((s) => !("pending" in s)).map((s) => s.href),
  contactPoint: CONTACT_PHONES.map((phone) => ({
    "@type": "ContactPoint",
    telephone: phone.tel,
    email: CONTACT_EMAIL,
    contactType: "customer support",
    areaServed: "IN",
  })),
  slogan: "Intelligence | Innovation | Integrity | Impact",
  disambiguatingDescription:
    "MyLoginn (two n's) is an India-based technology company at myloginn.com. It is not related to MyLogin, the school single sign-on service.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "MyLoginn services",
    itemListElement: [
      { name: "Web development", path: "/services/app-web-development" },
      { name: "Mobile app development", path: "/services/app-web-development" },
      { name: "Custom software and desktop application development", path: "/services/app-web-development" },
      { name: "AI agent development and automation", path: "/services/ai-development" },
      { name: "Digital marketing: Meta Ads, Google Ads and SEO", path: "/services/digital-marketing" },
      { name: "Software testing and test automation", path: "/services/testing-automation" },
    ].map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, url: `${siteUrl}${s.path}` },
    })),
  },
  areaServed: [
    { "@type": "Country", name: "India" },
    ...["Coimbatore", "Pollachi", "Udumalpet", "Erode"].map((name) => ({
      "@type": "City",
      name,
    })),
    { "@type": "AdministrativeArea", name: "Tamil Nadu" },
  ],
  knowsAbout: [
    "Website development",
    "Web application development",
    "SaaS development",
    "Mobile app development",
    "iOS and Android apps",
    "Custom software development",
    "Desktop application development",
    "CRM and ERP software",
    "Artificial intelligence",
    "AI agent development",
    "Business process automation",
    "Digital marketing",
    "Meta Ads",
    "Google Ads",
    "Search engine optimization",
    "Software testing and test automation",
  ],
};

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "MyLoginn",
  alternateName: [
    "My Loginn",
    "MyLoginn Tech",
    "MyLoginn Tech Private Limited",
    "myloginn.com",
  ],
  url: `${siteUrl}/`,
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: "en-IN",
};

/** Service schema for a service page; provider links back to the single Organization entity. */
export function serviceStructuredData({
  name,
  description,
  path,
  serviceType,
}: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${siteUrl}${path}#service`,
    name,
    serviceType,
    description,
    url: `${siteUrl}${path}`,
    provider: { "@id": `${siteUrl}/#organization` },
    areaServed: [{ "@type": "Country", name: "India" }, { "@type": "Place", name: "Worldwide (remote delivery)" }],
  };
}

export function faqStructuredData(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

/** The five core services, as an ordered list for the homepage. */
export function coreServicesStructuredData(services: { name: string; summary: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteUrl}/#services`,
    name: "MyLoginn services",
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.name,
        description: s.summary,
        url: `${siteUrl}${s.href}`,
        provider: { "@id": `${siteUrl}/#organization` },
      },
    })),
  };
}
