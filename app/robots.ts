import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/src/lib/seo/structuredData";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private, per-customer surfaces stay out of search indexes.
      disallow: ["/*/cart", "/*/orders/*", "/*/track-order"],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
