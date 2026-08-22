import { PublicReservations } from "@/src/Components/Reservations/PublicReservations";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reservations.meta" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function ReservationsPage() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <PublicReservations />
    </main>
  );
}