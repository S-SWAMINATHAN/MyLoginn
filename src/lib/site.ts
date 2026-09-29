const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.myloginn.com";

// Use the same canonical host in metadata, structured data, robots.txt, and
// sitemap.xml. Normalize the value so URL joins never produce double slashes.
export const siteUrl = configuredSiteUrl.replace(/\/+$/, "");
