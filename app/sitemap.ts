import type { MetadataRoute } from "next";
import { routing } from "@/src/i18n/routing";
import { getSiteUrl } from "@/src/lib/seo/seo";

const API_URL = process.env.NEXT_PUBLIC_RESTORA_API_URL ?? "";
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTORA_RESTAURANT_ID ?? "";
const PUBLIC_ROOT = `${API_URL}/api/v1/public`;

/** Static public routes of the website template. */
const ROUTES = ["", "/menu", "/about", "/contact", "/reservations"] as const;

async function publicFetch<T>(
  path: string,
  locale: string,
): Promise<T | null> {
  if (!API_URL) return null;
  try {
    const params = new URLSearchParams({ locale });
    if (RESTAURANT_ID) params.set("restaurantId", RESTAURANT_ID);
    const res = await fetch(`${PUBLIC_ROOT}${path}?${params.toString()}`, {
      headers: RESTAURANT_ID
        ? { "x-restaurant-id": RESTAURANT_ID }
        : undefined,
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text) return null;
    const body = JSON.parse(text) as { success?: boolean; data?: T };
    if (!body?.success || !body.data) return null;
    return body.data;
  } catch {
    return null;
  }
}

interface SitemapCategory {
  id: string;
  name?: string;
}

interface SitemapProduct {
  id: string;
  name?: string;
  slug?: string;
}

/**
 * Sitemap with hreflang alternates for every locale x route.
 * Includes static routes + dynamic product/category pages from the API.
 * Dynamic pages (orders, deep links, cart, track-order) are excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const defaultLocale = routing.defaultLocale;

  // Static routes with locale alternates
  const staticEntries: MetadataRoute.Sitemap = ROUTES.map((route) => ({
    url: `${base}/${defaultLocale}${route}`,
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [
          locale,
          `${base}/${locale}${route}`,
        ]),
      ),
    },
  }));

  // Fetch products and categories for dynamic sitemap entries
  const [categories, menuPage] = await Promise.all([
    publicFetch<SitemapCategory[]>("/categories", defaultLocale),
    publicFetch<{ items: SitemapProduct[] }>("/products", defaultLocale),
  ]);

  // Category pages (indexable under /menu with category filter)
  const categoryEntries: MetadataRoute.Sitemap =
    categories?.map((cat) => ({
      url: `${base}/${defaultLocale}/menu?category=${encodeURIComponent(cat.id)}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((locale) => [
            locale,
            `${base}/${locale}/menu?category=${encodeURIComponent(cat.id)}`,
          ]),
        ),
      },
    })) ?? [];

  // Product pages (if the product has a slug or ID-based route)
  const productEntries: MetadataRoute.Sitemap =
    menuPage?.items?.map((product) => ({
      url: `${base}/${defaultLocale}/menu?product=${encodeURIComponent(product.id)}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((locale) => [
            locale,
            `${base}/${locale}/menu?product=${encodeURIComponent(product.id)}`,
          ]),
        ),
      },
    })) ?? [];

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
