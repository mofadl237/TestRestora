"use client";

import { useLocale } from "next-intl";
import {
  useGetCategoriesQuery,
  useGetHomeQuery,
  useGetMenuPageQuery,
} from "@/src/store/api/publicApi";
import { useActiveBranchId } from "@/src/store/features/BranchSlice";
import { MenuPageClient } from "./MenuPageClient";
import { MenuSkeleton } from "./MenuSkeleton";

export default function MenuPage() {
  const locale = useLocale();
  const branchId = useActiveBranchId();

  // Branch-scoped catalog: availability, prices and configuration come from
  // the active location; products stay restaurant-level entities.
  const { data: home, isLoading: homeLoading } = useGetHomeQuery({ locale, branchId });
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery({ locale, branchId });
  const { data: menuPage, isLoading: menuLoading } = useGetMenuPageQuery({ locale, page: 1, limit: 100, branchId });

  // Show a layout-matching skeleton on the first load so the user never sees
  // empty or placeholder data while the real catalog is being fetched.
  const isInitialLoading = homeLoading || categoriesLoading || menuLoading;
  if (isInitialLoading) {
    return <MenuSkeleton />;
  }

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
