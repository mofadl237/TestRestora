import { PublicReservations } from "@/src/Components/Reservations/PublicReservations";
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
    getTranslations({ locale, namespace: "reservations.meta" }),
  ]);

  return buildPageMetadata(restaurant, locale, "/reservations", {
    title: t("title"),
    description: t("description"),
  });
}

export default function ReservationsPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <PublicReservations />
    </main>
  );
}
