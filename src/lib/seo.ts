import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

const coreKeywords = [
  "MyLoginn",
  "MyLoginn Tech Private Limited",
  "software development company",
  "web development company",
  "mobile app development",
  "AI solutions",
  "digital marketing services",
  "technology courses",
  "online tutoring",
  "internships",
];

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = new URL(path, siteUrl).toString();

  return {
    title,
    description,
    keywords: [...coreKeywords, ...keywords],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "MyLoginn",
      title,
      description,
      url,
      images: [{
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${title} - MyLoginn`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}
