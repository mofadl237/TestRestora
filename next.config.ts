import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  transpilePackages: ["next-themes"],
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
  // Proxy the Restora Public API through the Next.js server. The API host
  // sends no CORS headers, so direct browser fetches are blocked; routing the
  // same-origin /api/v1/public path here lets the server forward requests
  // (server-to-server, no CORS). publicApi.ts remains the only API client.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_RESTORA_API_URL;
    if (!apiUrl) return [];
    return [
      {
        source: "/api/v1/public/:path*",
        destination: `${apiUrl}/api/v1/public/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
