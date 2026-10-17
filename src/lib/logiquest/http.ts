import { NextResponse } from "next/server";

export const err = (error: string, status: number) => NextResponse.json({ error }, { status });

export async function readBody<T>(request: Request, maxBytes = 20_000): Promise<T | null> {
  const text = await request.text().catch(() => "");
  if (!text || text.length > maxBytes) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/** Client address for rate limiting anonymous requests. */
export function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anon";
}
