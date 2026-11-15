import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getRuntimeDatasourceUrl() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return undefined;

  try {
    const url = new URL(connectionString);
    url.searchParams.set("connection_limit", process.env.PRISMA_CONNECTION_LIMIT || "1");
    return url.toString();
  } catch {
    return connectionString;
  }
}

const datasourceUrl = getRuntimeDatasourceUrl();
export const prisma = globalForPrisma.prisma ?? new PrismaClient(datasourceUrl ? { datasourceUrl } : undefined);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
