import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

const publicRoutes = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/courses", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/internships", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/projects", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/tutoring", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/services/app-web-development", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/services/digital-marketing", priority: 0.8, changeFrequency: "monthly" as const },
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, internships] = await Promise.all([
    prisma.course.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.internship.findMany({ select: { slug: true, createdAt: true } }),
  ]);

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
      lastModified: internship.createdAt,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];
}
