import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import { SUBJECTS } from "@/lib/logiquest/catalog";

const publicRoutes = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/courses", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/internships", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/projects", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/locations/tamil-nadu", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/logiquest", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/logiquest/online-test", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/practice", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/practice/interview", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/practice/gd", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/practice/speaking", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/services/app-web-development", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/services/ai-development", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/services/testing-automation", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/services/digital-marketing", priority: 0.8, changeFrequency: "monthly" as const },
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courseResult, internshipResult] = await Promise.allSettled([
    prisma.course.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    prisma.internship.findMany({ select: { slug: true } }),
  ]);
  // Keep the main sitemap available even when the content database is offline.
  const courses = courseResult.status === "fulfilled" ? courseResult.value : [];
  const internships = internshipResult.status === "fulfilled" ? internshipResult.value : [];

  return [
    ...publicRoutes.map((route) => ({
      url: `${siteUrl}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...courses.map((course) => ({
      url: `${siteUrl}/courses/${course.slug}`,
      lastModified: course.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...internships.map((internship) => ({
      url: `${siteUrl}/internships/${internship.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    // LogiQuest subject and topic pages (public question banks).
    ...SUBJECTS.flatMap((s) => [
      { url: `${siteUrl}/logiquest/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.7 },
      ...s.topics.map((t) => ({ url: `${siteUrl}/logiquest/${s.slug}/${t.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ]),
  ];
}
