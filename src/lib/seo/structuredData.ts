import type { IApiBranch } from "@/src/store/api/types";

/**
 * Server-side SEO helpers (Phase: SEO).
 *
 * These fetch the Public API directly (server-to-server) to emit
 * structured data in the initial HTML — no client JS, no hydration cost.
 * Every call is failure-tolerant: SEO enrichment must NEVER break rendering.
 */

const API_URL = process.env.NEXT_PUBLIC_RESTORA_API_URL ?? "";
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTORA_RESTAURANT_ID ?? "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const PUBLIC_ROOT = `${API_URL}/api/v1/public`;

/** Absolute site origin used for canonical URLs, sitemap and JSON-LD. */
export function getSiteUrl(): string {
  if (SITE_URL) return SITE_URL.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

async function publicFetch<T>(
  path: string,
  locale: string,
  revalidate = 300,
): Promise<T | null> {
  if (!API_URL) return null;
  try {
    const params = new URLSearchParams({ locale });
    if (RESTAURANT_ID) params.set("restaurantId", RESTAURANT_ID);
    const res = await fetch(`${PUBLIC_ROOT}${path}?${params.toString()}`, {
      headers: RESTAURANT_ID ? { "x-restaurant-id": RESTAURANT_ID } : undefined,
      next: { revalidate },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { success?: boolean; data?: T };
    if (!body?.success || !body.data) return null;
    return body.data;
  } catch {
    return null;
  }
}

interface IPublicSettingsLite {
  restaurantName: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    googleMaps?: string;
  };
}

/**
 * Restaurant + LocalBusiness JSON-LD. When the tenant has multiple branches,
 * each real branch is emitted inside `department` (Google's recommended shape
 * for multi-location restaurants). No fake pages are generated.
 */
export async function getRestaurantJsonLd(locale: string): Promise<object | null> {
  const [settings, branches] = await Promise.all([
    publicFetch<IPublicSettingsLite>("/restaurant", locale),
    publicFetch<IApiBranch[]>("/branches", locale),
  ]);

  if (!settings) return null;

  const siteUrl = getSiteUrl();

  const addressFor = (b: {
    address?: string | null;
    city?: string | null;
  }) => ({
    "@type": "PostalAddress",
    ...(b.address ? { streetAddress: b.address } : {}),
    ...(b.city ? { addressLocality: b.city } : {}),
    // No fabricated country/region — only API-provided fields are emitted.
  });

  const branchNodes = (branches ?? [])
    .filter((b) => b.name)
    .map((b) => ({
      "@type": "Restaurant",
      name: b.name,
      ...(b.slug ? { url: `${siteUrl}/?branch=${encodeURIComponent(b.slug)}` } : {}),
      ...(b.phone ? { telephone: b.phone } : {}),
      ...(b.address || b.city ? { address: addressFor(b) } : {}),
      ...(b.latitude != null && b.longitude != null
        ? {
            geo: {
              "@type": "GeoCoordinates",
              latitude: b.latitude,
              longitude: b.longitude,
            },
          }
        : {}),
      ...(b.mapsUrl ? { hasMap: b.mapsUrl } : {}),
    }));

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": (branches?.length ?? 0) > 1 ? "RestaurantChain" : "Restaurant",
    name: settings.restaurantName,
    url: siteUrl,
    ...(settings.contact?.phone ? { telephone: settings.contact.phone } : {}),
    ...(settings.contact?.address
      ? { address: addressFor({ address: settings.contact.address }) }
      : {}),
    // Multi-branch: real departments only. Single-branch: plain Restaurant.
    ...((branches?.length ?? 0) > 1 ? { department: branchNodes } : {}),
  };

  return jsonLd;
}
