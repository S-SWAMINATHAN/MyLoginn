import "server-only";
import { prisma } from "@/lib/prisma";
import { ApiError } from "./http";

/**
 * Fixed-window rate limit stored in Postgres, so it holds across every serverless instance.
 * One upsert per call; old windows are deleted by the tick.
 */
export async function hit(key: string, limit: number, windowSeconds: number) {
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "CcRateLimit" ("key", "windowStart", "count") VALUES (${key}, ${windowStart}, 1)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "CcRateLimit"."windowStart" = EXCLUDED."windowStart" THEN "CcRateLimit"."count" + 1 ELSE 1 END,
      "windowStart" = EXCLUDED."windowStart"
    RETURNING "count"`;
  return { allowed: (rows[0]?.count ?? 1) <= limit, count: rows[0]?.count ?? 1 };
}

export async function limit(key: string, max: number, windowSeconds: number, message = "Too many requests. Please wait a moment and try again.") {
  const r = await hit(key, max, windowSeconds);
  if (!r.allowed) throw new ApiError(429, message, "RATE_LIMITED");
  return r.count;
}

export async function cleanupRateLimits() {
  await prisma.ccRateLimit.deleteMany({ where: { windowStart: { lt: new Date(Date.now() - 6 * 3600_000) } } });
}
