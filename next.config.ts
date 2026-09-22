import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack's on-disk dev cache has been corrupting itself in this
    // environment (stale cached module-resolution paths surviving a moved/
    // renamed working directory), causing intermittent "Next.js package not
    // found" panics that leave the page blank until the whole server is
    // restarted with `.next` cleared. Disabling it trades a bit of rebuild
    // speed for not needing that manual recovery.
    turbopackFileSystemCacheForDev: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent a valid HTTPS certificate from being undermined if an
          // HTTP URL is accidentally introduced in a page or third-party
          // integration. Browsers upgrade those requests before loading them.
          { key: "Content-Security-Policy", value: "upgrade-insecure-requests" },
          // Remember that this domain (and www) must only be opened over HTTPS.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
