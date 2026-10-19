import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

const brandKeywords = [
  "MyLoginn",
  "MyLoginn Tech",
  "MyLoginn Tech Private Limited",
];

/**
 * Metadata for a public page: title, description, canonical URL, Open Graph and Twitter cards in one place.
 * Keep titles under ~60 characters and descriptions around 140-160 so search results show them in full.
 */
/** Search results show about 160 characters of a description; longer text is cut at a word boundary. */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,;:.-]+\S*$/, "")}…`;
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  absoluteTitle = false,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  /** Use the title exactly as written, without the "| MyLoginn" suffix from the root layout template. */
  absoluteTitle?: boolean;
  /** Keep the page out of search results (links on it are still followed). */
  noIndex?: boolean;
}): Metadata {
  const url = new URL(path, siteUrl).toString();
  description = clampDescription(description);
  // shared cards show the full, branded title even where the page title relies on the layout template
  const socialTitle = absoluteTitle || title.includes("MyLoginn") ? title : `${title} | MyLoginn`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    // Keep only brand identity terms global; service/course intent belongs to
    // the page where that content is actually covered.
    keywords: [...brandKeywords, ...keywords],
    alternates: { canonical: path },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "MyLoginn",
      title: socialTitle,
      description,
      url,
      images: [{
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: socialTitle,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: ["/opengraph-image"],
    },
  };
}
