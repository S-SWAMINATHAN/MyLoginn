import { CONTACT_EMAIL, CONTACT_PHONES } from "@/lib/contactInfo";
import { siteUrl } from "@/lib/site";

export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "MyLoginn Tech Private Limited",
  alternateName: ["MyLoginn", "MyLogin", "My Loginn", "MyLoginn Tech"],
  legalName: "MyLoginn Tech Private Limited",
  url: siteUrl,
  logo: `${siteUrl}/myloginn-logo.png`,
  image: `${siteUrl}/myloginn-logo.png`,
  description:
    "MyLoginn Tech Private Limited is an Indian technology company providing web and mobile development, custom software, AI solutions, digital marketing, technology courses, tutoring, and internships.",
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONES[0].tel,
  sameAs: ["https://www.instagram.com/myloginntech/"],
  contactPoint: CONTACT_PHONES.map((phone) => ({
    "@type": "ContactPoint",
    telephone: phone.tel,
    email: CONTACT_EMAIL,
    contactType: "customer support",
    areaServed: "IN",
  })),
  areaServed: ["Coimbatore", "Pollachi", "Erode"].map((name) => ({
    "@type": "City",
    name,
  })),
  knowsAbout: [
    "Website development",
    "Web application development",
    "Mobile app development",
    "Custom software development",
    "Artificial intelligence",
    "Digital marketing",
    "Technology education",
    "Online tutoring",
    "Technology internships",
  ],
};

export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "MyLoginn",
  alternateName: ["MyLoginn Tech", "MyLoginn Tech Private Limited", "myloginn.com"],
  url: `${siteUrl}/`,
  publisher: { "@id": `${siteUrl}/#organization` },
  inLanguage: "en-IN",
};
