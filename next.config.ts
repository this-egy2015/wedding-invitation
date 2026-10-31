import type { NextConfig } from "next";

const r2 = new URL(process.env.R2_PUBLIC_URL ?? "https://invalid.local");

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: r2.hostname === "127.0.0.1" || r2.hostname === "localhost",
    remotePatterns: [
      {
        protocol: r2.protocol.slice(0, -1) as "http" | "https",
        hostname: r2.hostname,
        port: r2.port,
        pathname: `${r2.pathname.replace(/\/$/, "")}/**`,
      },
    ],
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
