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

/**
 * Where the astrology API lives, in order of preference:
 *  1. ASTROLOGY_API_URL, when it points at a separate service (or a sub-path such as /api/astro);
 *  2. on Vercel, the Python function in this same project (api/astro.py), so no extra host or domain is needed;
 *  3. the local service on port 8765.
 * A value that is just this website (e.g. https://myloginn.com) is ignored: it would make the proxy call itself.
 */
function backendBase(req: Request) {
  const site = new URL(req.url);
  const configured = (process.env.ASTROLOGY_API_URL || "").trim().replace(/\/+$/, "");
  if (configured) {
    try {
      const target = new URL(configured);
      const isThisWebsite = target.host === site.host && target.pathname.replace(/\/+$/, "") === "";
      if (!isThisWebsite) return configured;
    } catch {
      console.error("astrology proxy: ASTROLOGY_API_URL is not a valid URL, ignoring it", configured);
    }
  }
  if (process.env.VERCEL) return `${site.origin}/api/astro`;
  return "http://127.0.0.1:8765";
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
  const base = backendBase(req);
  const target = `${base}/api/${joined}${url.search}`;
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
    // An HTML answer means something other than the astrology service replied (wrong address, proxy error page).
    const wantsHtml = url.searchParams.get("format") === "html"; // print-ready page for browsers, see astrology/backend services/pdf/web.py
    if (!wantsHtml && (upstream.headers.get("content-type") ?? "").includes("text/html")) {
      console.error("astrology proxy: upstream returned HTML instead of JSON", target, upstream.status);
      return NextResponse.json(
        { detail: "The astrology service returned an unexpected page. Check that ASTROLOGY_API_URL points to the running Python service." },
        { status: 502 },
      );
    }
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
