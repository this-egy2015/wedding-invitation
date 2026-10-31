import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Private runtime data must never be copied into a deployment artifact.
  outputFileTracingExcludes: {
    "/*": ["./data/**/*", "./.env*", "./**/*.sqlite", "./**/*.sqlite-*", "./**/*.sqlite3", "./**/*.sqlite3-*", "./**/*.db", "./**/*.db-*"],
  },
  images: {
    localPatterns: [{ pathname: "/berubah/**", search: "" }, { pathname: "/_next/static/media/**", search: "" }],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        // Guest token lives in the query string; keep it out of Referer sent to Maps/R2/etc.
        source: "/:path*",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
};

export default nextConfig;
