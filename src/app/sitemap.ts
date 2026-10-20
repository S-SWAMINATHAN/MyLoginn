import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";
import { SUBJECTS } from "@/lib/logiquest/catalog";
import { TRACKS } from "@/lib/logiquest/coding/tracks";
import { ALL_PROBLEMS } from "@/lib/logiquest/coding/problems";
import { clientProjects } from "@/lib/clientProjects";

type Freq = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
type Route = { path: string; priority: number; changeFrequency: Freq };

/**
 * Public pages, in order of importance: the company and its five services first, then the learning platform.
 * Account pages, sessions and switched-off sections (astrology, tutoring) are left out and blocked in robots.ts.
 */
const companyRoutes: Route[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/app-web-development", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/ai-development", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/digital-marketing", priority: 0.9, changeFrequency: "monthly" },
  { path: "/services/testing-automation", priority: 0.8, changeFrequency: "monthly" },
  { path: "/projects", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/careers", priority: 0.7, changeFrequency: "weekly" },
  { path: "/internships", priority: 0.7, changeFrequency: "weekly" },
  { path: "/locations/tamil-nadu", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
];

const learnRoutes: Route[] = [
  { path: "/courses", priority: 0.7, changeFrequency: "weekly" },
  { path: "/logiquest", priority: 0.7, changeFrequency: "weekly" },
  { path: "/logiquest/online-test", priority: 0.6, changeFrequency: "monthly" },
  { path: "/logiquest/coding", priority: 0.6, changeFrequency: "monthly" },
  { path: "/logiquest/sudoku", priority: 0.4, changeFrequency: "monthly" },
  { path: "/practice", priority: 0.6, changeFrequency: "monthly" },
  { path: "/practice/interview", priority: 0.6, changeFrequency: "monthly" },
  { path: "/practice/gd", priority: 0.5, changeFrequency: "monthly" },
  { path: "/practice/speaking", priority: 0.5, changeFrequency: "monthly" },
];

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courseResult, internshipResult, showcaseResult] = await Promise.allSettled([
    prisma.course.findMany({ where: { status: "published" }, select: { slug: true, updatedAt: true } }),
    prisma.internship.findMany({ where: { status: { not: "draft" } }, select: { slug: true } }),
    prisma.showcaseProject.findMany({ select: { slug: true } }),
  ]);
  // Keep the main sitemap available even when the content database is offline.
  const courses = courseResult.status === "fulfilled" ? courseResult.value : [];
  const internships = internshipResult.status === "fulfilled" ? internshipResult.value : [];
  const clientSlugs = new Set(clientProjects.map((p) => p.slug));
  const showcase = showcaseResult.status === "fulfilled" ? showcaseResult.value.filter((p) => !clientSlugs.has(p.slug)) : [];

  const entry = (path: string, priority: number, changeFrequency: Freq, lastModified?: Date) => ({
    url: `${siteUrl}${path}`,
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {}),
  });

  return [
    ...companyRoutes.map((r) => entry(r.path, r.priority, r.changeFrequency)),
    // client work
    ...clientProjects.map((p) => entry(`/projects/${p.slug}`, 0.7, "monthly")),
    ...showcase.map((p) => entry(`/projects/${p.slug}`, 0.5, "monthly")),
    ...internships.map((i) => entry(`/internships/${i.slug}`, 0.6, "weekly")),
    // learning platform
    ...learnRoutes.map((r) => entry(r.path, r.priority, r.changeFrequency)),
    ...courses.map((c) => entry(`/courses/${c.slug}`, 0.6, "weekly", c.updatedAt)),
    ...SUBJECTS.flatMap((s) => [
      entry(`/logiquest/${s.slug}`, 0.6, "monthly"),
      ...s.topics.map((t) => entry(`/logiquest/${s.slug}/${t.slug}`, 0.5, "monthly")),
    ]),
    ...SUBJECTS.filter((s) => s.kind === "mcq").map((s) => entry(`/logiquest/online-test/${s.slug}`, 0.4, "monthly")),
    ...TRACKS.map((t) => entry(`/logiquest/coding/${t.slug}`, 0.5, "monthly")),
    ...ALL_PROBLEMS.map((p) => entry(`/logiquest/coding/problems/${p.slug}`, 0.4, "monthly")),
  ];
}
