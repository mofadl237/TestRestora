import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HomeClient } from "@/src/Components/Home/HomeClient";
import { TableResolver } from "@/src/Components/Table/TableResolver";
import { buildPageMetadata, getRestaurantForSeo } from "@/src/lib/seo/seo";

interface IHomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tableId?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [restaurant, t] = await Promise.all([
    getRestaurantForSeo(locale),
    getTranslations({ locale, namespace: "home.meta" }),
  ]);

  return buildPageMetadata(restaurant, locale, "", {
    title: t("title"),
    description: t("description"),
  });
}

export default async function Home({ searchParams }: IHomePageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <>
      <TableResolver tableId={resolvedSearchParams.tableId} />
      <HomeClient />
    </>
  );
}
