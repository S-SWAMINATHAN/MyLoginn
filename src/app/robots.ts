import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Crawl rules: everything public is open; only admin, API, checkout and developer pages are blocked. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Account pages (login, sign-up, profile, reports...) are NOT blocked here on purpose: they carry `noindex`,
      // and Google must be able to crawl a page to see that tag and drop it from results.
      // Switched-off sections (astrology, tutoring) return 404 for the same reason.
      disallow: [
        "/admin",
        "/api/",
        "/dashboard",
        "/courses/*/checkout",
        "/dev-lesson-preview",
        "/certificate/dev-preview",
        // tracking and sort parameters create duplicate URLs
        "/*?*utm_",
        "/*?*sort=",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
