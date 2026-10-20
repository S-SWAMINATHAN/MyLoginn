import "server-only";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/** An error whose message is safe to show the caller. Anything else becomes a generic 500. */
export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });

/** Wraps a route handler: ApiError → its status and message; unexpected errors are logged and hidden. */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof ApiError) return json({ error: error.message, code: error.code }, error.status);
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021")
        return json({ error: "The coding competition tables do not exist in this database yet. They are created by prisma db push (run automatically by the next deploy).", code: "TABLES_MISSING" }, 503);
      console.error("[coding-competition]", error);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  };
}

/**
 * CSRF guard for cookie-authenticated mutations. Browsers always send Origin on cross-site POSTs, so a present
 * Origin must match this host. (Session cookies are also SameSite=Lax.)
 */
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    if (request.headers.get("sec-fetch-site") === "cross-site") throw new ApiError(403, "Cross-site request refused.");
    return;
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  let originHost = "";
  try {
    originHost = new URL(origin).host;
  } catch {
    /* falls through to the refusal */
  }
  if (!host || originHost !== host) throw new ApiError(403, "Cross-site request refused.");
}

/** Parses a JSON body with a hard size limit. Throws 400/413 on bad input. */
export async function readJson<T = Record<string, unknown>>(request: Request, maxBytes = 16_000): Promise<T> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > maxBytes) throw new ApiError(413, "Request is too large.");
  const text = await request.text().catch(() => "");
  if (text.length > maxBytes) throw new ApiError(413, "Request is too large.");
  try {
    const value = JSON.parse(text || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as T;
  } catch {
    throw new ApiError(400, "Invalid request body.");
  }
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Truncated, salted hash of the client IP: enough to spot shared networks, not enough to identify anyone. */
export function ipHash(request: Request) {
  return createHash("sha256").update(`${process.env.JWT_SECRET ?? ""}:ip:${clientIp(request)}`).digest("hex").slice(0, 16);
}

export const isUniqueViolation = (e: unknown, field?: string) =>
  e instanceof Prisma.PrismaClientKnownRequestError &&
  e.code === "P2002" &&
  (!field || JSON.stringify(e.meta?.target ?? "").includes(field));

export const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
