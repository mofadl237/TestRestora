import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Cart from "@/src/Components/Cart/Cart";
import MainSection from "@/src/Components/MainSection";
import {
  getRestaurantForSeo,
  buildPageMetadata,
} from "@/src/lib/seo/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [restaurant, t] = await Promise.all([
    getRestaurantForSeo(locale),
    getTranslations({ locale, namespace: "cart.meta" }),
  ]);

  return buildPageMetadata(restaurant, locale, "/cart", {
    title: t("title"),
    description: t("description"),
    noindex: true,
  });
}

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart.page" });

  return (
    <main>
      <MainSection subTitle={t("subtitle")} title={t("title")} />
      <Cart />
    </main>
  );
};

export default page;
