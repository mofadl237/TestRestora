"use client";

import { useLocale } from "next-intl";
import {
  useGetCategoriesQuery,
  useGetHomeQuery,
  useGetMenuPageQuery,
} from "@/src/store/api/publicApi";
import { MenuPageClient } from "./MenuPageClient";

export default function MenuPage() {
  const locale = useLocale();

  const { data: home } = useGetHomeQuery({ locale });
  const { data: categories = [] } = useGetCategoriesQuery({ locale });
  const { data: menuPage } = useGetMenuPageQuery({ locale, page: 1, limit: 100 });

  const homeSections = (home?.sections ?? []).map((section) => ({
    id: section.id,
    key: section.key,
    name: section.name,
  }));
  const products = menuPage?.items ?? [];

  return (
    <MenuPageClient
      homeSections={homeSections}
      categories={categories}
      products={products}
      initialSection="featured"
      initialCategory="all"
      initialQuery=""
    />
  );
}
