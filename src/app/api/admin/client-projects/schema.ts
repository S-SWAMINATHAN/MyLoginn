import { z } from "zod";

const artKeys = ["ml", "cyber", "testing", "marketing", "cloud", "webdev", "mobile", "ecommerce", "travel", "platform", "network", "jadhagam", "shop-leads", "crm"] as const;
const httpUrl = z.union([z.string().url().max(500).refine((value) => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS URL"), z.literal("")]);
export const projectShape = z.object({
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens for the slug"),
  name: z.string().trim().min(2).max(120),
  url: httpUrl,
  category: z.string().trim().min(2).max(100),
  artKey: z.enum(artKeys),
  cardMetric: z.string().trim().max(100).optional().nullable(),
  description: z.string().trim().min(10).max(300),
  longDescription: z.string().trim().min(10).max(3000),
  highlights: z.array(z.string().trim().min(1).max(200)).max(12),
  audience: z.string().trim().max(500).optional().nullable(),
  features: z.array(z.object({ title: z.string().trim().min(1).max(100), text: z.string().trim().min(1).max(300) })).max(12).default([]),
  deliverables: z.array(z.string().trim().min(1).max(180)).max(20).default([]),
  platform: z.enum(["web", "mobile", "desktop"]).default("web"),
  status: z.enum(["live", "in-development"]),
  fallbackPreview: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(10000).default(0),
});
