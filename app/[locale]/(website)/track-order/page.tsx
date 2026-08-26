import TrackOrderClient from "@/src/Components/TrackOrder/TrackOrderClient";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildPageMetadata, getRestaurantForSeo } from "@/src/lib/seo/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [restaurant, t] = await Promise.all([
    getRestaurantForSeo(locale),
    getTranslations({ locale, namespace: "trackOrder.meta" }),
  ]);

  return buildPageMetadata(restaurant, locale, "/track-order", {
    title: t("title"),
    description: t("description"),
    noindex: true,
  });
}

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}
