import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not advertise the framework in the X-Powered-By response header.
  poweredByHeader: false,
  // The LogiQuest SQL judge loads sql.js from node_modules by path inside a worker thread, which tracing cannot see.
  outputFileTracingIncludes: {
    "/api/logiquest/coding/[slug]/sql": ["./node_modules/sql.js/dist/sql-wasm.js", "./node_modules/sql.js/dist/sql-wasm.wasm"],
  },
  experimental: {
    // Turbopack's on-disk dev cache has been corrupting itself in this
    // environment (stale cached module-resolution paths surviving a moved/
    // renamed working directory), causing intermittent "Next.js package not
    // found" panics that leave the page blank until the whole server is
    // restarted with `.next` cleared. Disabling it trades a bit of rebuild
    // speed for not needing that manual recovery.
    turbopackFileSystemCacheForDev: false,
  },
  async redirects() {
    return [
      // One canonical host for search engines: the bare domain permanently redirects to www (matches siteUrl).
      { source: "/:path*", has: [{ type: "host", value: "myloginn.com" }], destination: "https://www.myloginn.com/:path*", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent a valid HTTPS certificate from being undermined if an
          // HTTP URL is accidentally introduced in a page or third-party
          // integration. Browsers upgrade those requests before loading them.
          {
            key: "Content-Security-Policy",
            // Safe subset: blocks plugin/object embeds, <base> tag injection and
            // clickjacking by other sites. A strict script-src is not set because it
            // needs a nonce rollout and would break Next.js inline scripts and Razorpay.
            value: "upgrade-insecure-requests; object-src 'none'; base-uri 'self'; frame-ancestors 'self'",
          },
          // Stop browsers from MIME-sniffing uploaded or served files into executable types.
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Camera is used by the avatar uploader, the microphone by Practice (interview, speaking, group discussion);
          // everything else sensitive stays off.
          { key: "Permissions-Policy", value: "camera=(self), microphone=(self), geolocation=(), payment=(self)" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // Remember that this domain (and www) must only be opened over HTTPS.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
      {
        // Admin-only CV downloads. Chrome's built-in PDF viewer is a plugin embed, so `object-src 'none'` would blank the
        // inline preview in the admin Careers screen. Everything else in the policy stays, and the route is nosniff + private.
        source: "/api/admin/careers/applications/:source/:id/resume",
        headers: [{ key: "Content-Security-Policy", value: "upgrade-insecure-requests; base-uri 'self'; frame-ancestors 'self'" }],
      },
    ];
  },
};

export default nextConfig;
