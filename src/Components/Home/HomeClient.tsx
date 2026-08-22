"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  useGetHomeQuery,
  useGetCategoriesQuery,
} from "@/src/store/api/publicApi";
import { Hero } from "@/src/Components/Home/Hero";
import { PromoBanner } from "@/src/Components/Home/PromoBanner";
import { CategoryRail } from "@/src/Components/Home/CategoryRail";
import { OffersHorizontalRail } from "@/src/Components/Home/OffersHorizontalRail";
import { HomeSectionRenderer } from "@/src/Components/Home/HomeSectionRenderer";
import { StorySection } from "@/src/Components/Home/StorySection";
import { FinalCta } from "@/src/Components/Home/FinalCta";
import { FloatingMenuCta } from "@/src/Components/Shared/FloatingMenuCta";
import type { IHomeProduct } from "@/src/Interfaces";

const OFFER_SECTION_KEY = "offers";

const sectionDataMap: Record<string, (home: ReturnType<typeof useGetHomeQuery>["data"]) => IHomeProduct[]> = {
  "best-sellers": (home) => home?.bestSellers ?? [],
  "chef-recommendations": (home) => home?.chefRecommendations ?? [],
  "family-meals": (home) => home?.familyMeals ?? [],
  "new-items": (home) => home?.newItems ?? [],
  "kids-meals": (home) => home?.kidsMeals ?? [],
  "combo-meals": (home) => home?.comboMeals ?? [],
};

export function HomeClient() {
  const locale = useLocale();
  const tHome = useTranslations("home.categories");

  const { data: home } = useGetHomeQuery({ locale });
  const { data: categories = [] } = useGetCategoriesQuery({ locale });

  const orderedSections = (home?.sections ?? [])
    .filter((section) => section.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const productSections = orderedSections.filter(
    (s) => s.key !== OFFER_SECTION_KEY,
  );
  const sectionData = productSections.map((section) => ({
    key: section.key,
    products: sectionDataMap[section.key]?.(home) ?? [],
  }));

  const offerSection = orderedSections.find(
    (s) => s.key === OFFER_SECTION_KEY,
  );

  const hasCategories = categories.length > 0;

  return (
    <main className="flex min-h-screen w-full flex-col">
      <Hero />

      <PromoBanner />

      {hasCategories && (
        <section className="py-8 md:py-12 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <div className="px-4 md:px-6 lg:px-0">
              <div className="text-center mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  <span className="mr-2 text-primary">&mdash;</span>
                  {tHome("eyebrow")}
                  <span className="ml-2 text-primary">&mdash;</span>
                </p>
                <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {tHome("title")}
                </h2>
                <div
                  className="mx-auto mt-4 h-px w-16"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, var(--color-primary), transparent)",
                  }}
                />
              </div>
            </div>
            <CategoryRail categories={categories} />
          </div>
        </section>
      )}

      <HomeSectionRenderer
        orderedSections={orderedSections}
        productSectionData={sectionData}
        offerNode={
          offerSection ? (
            <OffersHorizontalRail
              sectionName={offerSection.name}
              sectionSubtitle="Deals and bundles available right now"
            />
          ) : undefined
        }
      />

      <StorySection />
      <FinalCta />
      <FloatingMenuCta />
    </main>
  );
}
