import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

const brandKeywords = [
  "MyLoginn",
  "MyLoginn Tech",
  "MyLoginn Tech Private Limited",
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
    // Keep only brand identity terms global; service/course intent belongs to
    // the page where that content is actually covered.
    keywords: [...brandKeywords, ...keywords],
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
