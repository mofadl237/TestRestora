import { getRestaurantJsonLd } from "@/src/lib/seo/structuredData";

/**
 * Emits Restaurant / LocalBusiness structured data in the initial HTML
 * (server-rendered, zero client JS). Branch departments are included for
 * multi-branch tenants — real data only, never fabricated pages.
 */
export default async function RestaurantJsonLd({ locale }: { locale: string }) {
  const jsonLd = await getRestaurantJsonLd(locale);
  if (!jsonLd) return null;

  return (
    <script
      type="application/ld+json"
      // Structured data payload — built from trusted API content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
