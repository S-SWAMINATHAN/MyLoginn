import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clientProjects, type ClientProject } from "@/lib/clientProjects";

function fromRow(row: {
  slug: string; name: string; url: string; category: string; artKey: string; cardMetric: string | null;
  description: string; longDescription: string; highlights: Prisma.JsonValue; audience: string | null;
  features: Prisma.JsonValue | null; deliverables: Prisma.JsonValue | null; platform: string | null;
  status: string; fallbackPreview: boolean;
}): ClientProject {
  const list = (value: Prisma.JsonValue | null): string[] | undefined =>
    Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : undefined;
  const features = Array.isArray(row.features)
    ? row.features.flatMap((feature) => {
        if (!feature || typeof feature !== "object" || Array.isArray(feature)) return [];
        const item = feature as Prisma.JsonObject;
        return typeof item.title === "string" && typeof item.text === "string" ? [{ title: item.title, text: item.text }] : [];
      })
    : undefined;
  const validArtKeys = new Set(["ml", "cyber", "testing", "marketing", "cloud", "webdev", "mobile", "ecommerce", "travel", "platform", "network", "jadhagam", "shop-leads", "crm"]);
  return {
    slug: row.slug,
    name: row.name,
    url: row.url,
    category: row.category,
    artKey: (validArtKeys.has(row.artKey) ? row.artKey : "webdev") as ClientProject["artKey"],
    cardMetric: row.cardMetric ?? undefined,
    description: row.description,
    longDescription: row.longDescription,
    highlights: list(row.highlights) ?? [],
    audience: row.audience ?? undefined,
    features,
    deliverables: list(row.deliverables),
    platform: row.platform === "mobile" || row.platform === "desktop" ? row.platform : "web",
    status: row.status === "in-development" ? "in-development" : "live",
    fallbackPreview: row.fallbackPreview,
  };
}

export async function initializeClientPortfolio() {
  await prisma.$transaction(async (tx) => {
    const state = await tx.clientPortfolioSettings.upsert({ where: { id: "main" }, update: {}, create: { id: "main" } });
    if (state.initialized) return;
    const claim = await tx.clientPortfolioSettings.updateMany({ where: { id: "main", initialized: false }, data: { initialized: true } });
    if (!claim.count) return;
    await tx.clientPortfolioProject.createMany({
      data: clientProjects.map((project, sortOrder) => ({
        slug: project.slug,
        name: project.name,
        url: project.url,
        category: project.category,
        artKey: project.artKey,
        cardMetric: project.cardMetric,
        description: project.description,
        longDescription: project.longDescription,
        highlights: project.highlights as Prisma.InputJsonValue,
        audience: project.audience,
        features: project.features as Prisma.InputJsonValue | undefined,
        deliverables: project.deliverables as Prisma.InputJsonValue | undefined,
        platform: project.platform ?? "web",
        status: project.status,
        fallbackPreview: project.fallbackPreview ?? false,
        sortOrder,
      })),
    });
  });
}

export async function getClientProjects(): Promise<ClientProject[]> {
  try {
    await initializeClientPortfolio();
    const rows = await prisma.clientPortfolioProject.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    return rows.map(fromRow);
  } catch (error) {
    console.warn("Unable to load client portfolio from the database; using the bundled portfolio.", error);
    return clientProjects;
  }
}
