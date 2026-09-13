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
};

export default nextConfig;
