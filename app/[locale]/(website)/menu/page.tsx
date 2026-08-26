import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  getRestaurantForSeo,
  buildPageMetadata,
} from "@/src/lib/seo/seo";
import MenuPage from "@/src/Components/Menu/MenuPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [restaurant, t] = await Promise.all([
    getRestaurantForSeo(locale),
    getTranslations({ locale, namespace: "menu.meta" }),
  ]);

  return buildPageMetadata(restaurant, locale, "/menu", {
    title: t("title"),
    description: t("description"),
  });
}

export default function MenuRoute() {
  return <MenuPage />;
}
