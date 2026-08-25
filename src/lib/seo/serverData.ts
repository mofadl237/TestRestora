/**
 * Server-only data helpers for metadata generation and structured data.
 *
 * These fetch the Public API directly (server-to-server) so that
 * generateMetadata and JSON-LD can read restaurant settings without
 * client-side RTK Query. Every call is failure-tolerant — SEO
 * enrichment must NEVER break page rendering.
 */

import type { IPublicSettings } from "@/src/store/api/types";

const API_URL = process.env.NEXT_PUBLIC_RESTORA_API_URL ?? "";
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTORA_RESTAURANT_ID ?? "";

const PUBLIC_ROOT = `${API_URL}/api/v1/public`;

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
    const text = await res.text();
    if (!text) return null;
    const body = JSON.parse(text) as { success?: boolean; data?: T };
    if (!body?.success || !body.data) return null;
    return body.data;
  } catch {
    return null;
  }
}

/**
 * Fetch restaurant settings server-side. Used by generateMetadata and
 * structured data. Returns null on any failure (rendering continues
 * with defaults).
 */
export async function fetchPublicRestaurant(
  locale: string,
): Promise<IPublicSettings | null> {
  return publicFetch<IPublicSettings>("/restaurant", locale);
}
