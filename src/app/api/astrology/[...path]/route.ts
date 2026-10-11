import { NextResponse } from "next/server";
import { pdfRequestAccess, type ReportAccess } from "@/lib/astrology/access";
import { getBuyer, hasAstrologyAccess } from "@/lib/astrologyAccess";

/**
 * Same-origin proxy to the Python astrology service (astrology/backend).
 *   /api/astrology/<path>  ->  ${ASTROLOGY_API_URL}/api/<path>
 *
 * The service itself is never exposed to browsers. Every print-quality PDF
 * (`pdf/*`) is generated only for a buyer who has paid for that report (no login needed).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const FORWARD_HEADERS = ["content-type", "accept", "accept-language"];
const BACKEND_TIMEOUT_MS = 55_000;

function backendBase() {
  return (process.env.ASTROLOGY_API_URL || "http://127.0.0.1:8765").replace(/\/+$/, "");
}

async function handle(req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joined = path.join("/");
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const rawBody = hasBody ? await req.arrayBuffer() : undefined;

  if (path[0] === "pdf") {
    const buyer = await getBuyer();
    let access: ReportAccess | null = null;
    if (path.length === 2 && rawBody) {
      try {
        access = pdfRequestAccess(path[1], JSON.parse(new TextDecoder().decode(rawBody)));
      } catch {
        access = null;
      }
    }
    if (!access) {
      // Unknown or free-form PDF endpoints (e.g. pdf/generate) are for administrators only.
      if (!buyer.isAdmin) {
        return NextResponse.json({ detail: "This PDF endpoint is not available." }, { status: 403 });
      }
    } else if (!(await hasAstrologyAccess(buyer, access))) {
      return NextResponse.json(
        { detail: "Payment required: unlock this report to print or download it.", product: access.product },
        { status: 402 },
      );
    }
  }

  const url = new URL(req.url);
  const target = `${backendBase()}/api/${joined}${url.search}`;
  const headers = new Headers();
  for (const name of FORWARD_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  if (process.env.ASTROLOGY_API_SECRET) headers.set("x-astrology-secret", process.env.ASTROLOGY_API_SECRET);

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: rawBody,
      cache: "no-store",
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    const out = new Headers();
    for (const name of ["content-type", "content-disposition", "cache-control"]) {
      const value = upstream.headers.get(name);
      if (value) out.set(name, value);
    }
    return new Response(upstream.body, { status: upstream.status, headers: out });
  } catch (error) {
    console.error("astrology proxy: service unreachable", target, error);
    return NextResponse.json(
      { detail: "The astrology service is not reachable right now. Please try again shortly." },
      { status: 502 },
    );
  }
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
