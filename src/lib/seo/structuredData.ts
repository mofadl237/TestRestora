import type { IApiBranch } from "@/src/store/api/types";
import type { IPublicSettings } from "@/src/store/api/types";
import { fetchPublicRestaurant } from "./serverData";
import { getSiteUrl } from "./seo";

/**
 * JSON-LD structured data builder.
 *
 * Fetches restaurant + branches data from the Public API and emits
 * Schema.org Restaurant / RestaurantChain structured data.
 *
 * Every call is failure-tolerant: SEO enrichment must NEVER break rendering.
 */

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
      headers: RESTAURANT_ID
        ? { "x-restaurant-id": RESTAURANT_ID }
        : undefined,
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

// ---------------------------------------------------------------------------
// JSON-LD helpers
// ---------------------------------------------------------------------------

function addressFor(b: {
  address?: string | null;
  city?: string | null;
  country?: string | null;
}) {
  return {
    "@type": "PostalAddress",
    ...(b.address ? { streetAddress: b.address } : {}),
    ...(b.city ? { addressLocality: b.city } : {}),
    ...(b.country ? { addressCountry: b.country } : {}),
  };
}

function openingHoursFromBusinessHours(
  businessHours?: IPublicSettings["businessHours"],
): object[] | undefined {
  if (!businessHours?.length) return undefined;
  const dayMap = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  return businessHours
    .filter((d) => d.status === "open" && d.shifts?.length > 0)
    .map((d) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dayMap[d.day] ?? [],
      opens: d.shifts[0].open,
      closes: d.shifts[0].close,
    }));
}

function sameAsFromSocial(
  social?: IPublicSettings["social"],
): string[] | undefined {
  if (!social) return undefined;
  const links = [
    social.facebook,
    social.instagram,
    social.tiktok,
    social.snapchat,
  ].filter(Boolean) as string[];
  return links.length > 0 ? links : undefined;
}

/**
 * Restaurant / RestaurantChain JSON-LD.
 *
 * Single branch  -> @type "Restaurant"
 * Multi-branch   -> @type "RestaurantChain" with `department` entries
 *
 * Branch data is real API data; no fake pages are generated.
 */
export async function getRestaurantJsonLd(
  locale: string,
): Promise<object | null> {
  const [restaurant, branches] = await Promise.all([
    fetchPublicRestaurant(locale),
    publicFetch<IApiBranch[]>("/branches", locale),
  ]);

  if (!restaurant) return null;

  const siteUrl = getSiteUrl();
  const logo = restaurant.branding?.logo || null;
  const coverImage = restaurant.branding?.coverImage || null;
  const countryName = restaurant.country?.code ?? null;

  const branchNodes = (branches ?? [])
    .filter((b) => b.name)
    .map((b) => ({
      "@type": "Restaurant",
      name: b.name,
      ...(b.slug
        ? { url: `${siteUrl}/?branch=${encodeURIComponent(b.slug)}` }
        : {}),
      ...(b.phone ? { telephone: b.phone } : {}),
      ...(b.address || b.city
        ? { address: addressFor({ address: b.address, city: b.city }) }
        : {}),
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

  const hours = openingHoursFromBusinessHours(restaurant.businessHours);
  const socialLinks = sameAsFromSocial(restaurant.social);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":
      (branches?.length ?? 0) > 1 ? "RestaurantChain" : "Restaurant",
    name: restaurant.restaurantName,
    url: siteUrl,
    ...(logo ? { logo } : {}),
    ...(coverImage ? { image: coverImage } : {}),
    ...(restaurant.contact?.phone
      ? { telephone: restaurant.contact.phone }
      : {}),
    ...(restaurant.contact?.email ? { email: restaurant.contact.email } : {}),
    ...(restaurant.contact?.address
      ? {
          address: addressFor({
            address: restaurant.contact.address,
            country: countryName,
          }),
        }
      : {}),
    ...(countryName ? { areaServed: countryName } : {}),
    ...(hours ? { openingHoursSpecification: hours } : {}),
    ...(socialLinks ? { sameAs: socialLinks } : {}),
    ...((branches?.length ?? 0) > 1 ? { department: branchNodes } : {}),
  };

  return jsonLd;
}
