import type { MetadataRoute } from "next";
import { routing } from "@/src/i18n/routing";
import { getSiteUrl } from "@/src/lib/seo/structuredData";

/** Static public routes of the website template (robots-disallowed pages excluded). */
const ROUTES = ["", "/menu", "/about", "/contact", "/reservations"] as const;

/**
 * Sitemap with hreflang alternates for every locale × route.
 * Dynamic pages (orders, deep links) are intentionally excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return ROUTES.map((route) => ({
    url: `${base}/${routing.defaultLocale}${route}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${base}/${locale}${route}`]),
      ),
    },
  }));
}
