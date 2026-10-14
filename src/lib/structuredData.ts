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
    "MyLoginn Tech Private Limited is an India-based technology company building web, mobile, custom software, AI, automation and digital solutions for businesses worldwide, and teaching practical technology skills.",
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONES[0].tel,
  sameAs: SOCIAL_LINKS.map((s) => s.href),
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
      { name: "Web, mobile app and custom software development", path: "/services/app-web-development" },
      { name: "AI development and AI agent development", path: "/services/ai-development" },
      { name: "Software testing and test automation", path: "/services/testing-automation" },
      { name: "Digital marketing and SEO", path: "/services/digital-marketing" },
      { name: "Technology courses", path: "/courses" },
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
    "Mobile app development",
    "Custom software development",
    "Artificial intelligence",
    "Generative AI",
    "AI agent development",
    "Software testing and test automation",
    "Digital marketing",
    "Technology education",
    "Technology internships",
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
