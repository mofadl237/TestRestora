import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/seo/seo";

/**
 * Robots.txt for the restaurant website clone.
 * Allows all public pages; blocks private surfaces and internal routes.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/*/cart",
        "/*/orders/*",
        "/*/track-order",
        "/dashboard",
        "/admin",
        "/api/",
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
