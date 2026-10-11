/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Separate build folder when needed (e.g. a test build while `next dev` runs):
  // NEXT_DIST_DIR=.next-audit next build. Default unchanged.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
