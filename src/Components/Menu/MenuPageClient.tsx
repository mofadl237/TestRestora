"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MenuHeader } from "./MenuHeader";
import { MenuSearch } from "./MenuSearch";
import { MenuSectionTabs } from "./MenuSectionTabs";
import { MenuProductsGrid } from "./MenuProductsGrid";
import { MenuEmpty } from "./MenuEmpty";
import type { ICategory, IHomeProduct, IProduct } from "@/src/Interfaces";

interface IProps {
  homeSections: Array<{ id: string; key: string; name: string }>;
  categories: ICategory[];
  products: Array<IHomeProduct | IProduct>;
  initialSection: string;
  initialCategory: string;
  initialQuery: string;
}

export function MenuPageClient({
  homeSections,
  categories,
  products,
  initialSection,
  initialQuery,
}: IProps) {
  const searchParams = useSearchParams();
  const activeSection = searchParams.get("section") ?? initialSection;
  const query = searchParams.get("q") ?? initialQuery;

  // Active category tracked by IntersectionObserver — not a URL param
  const [ioCategoryId, setIoCategoryId] = useState("");

  // Representative thumbnail per category (first product image) so the
  // category rail stays stable regardless of the current filter.
  const categoryImages = useMemo(() => {
    const map = new Map<string, string>();
    products.forEach((product) => {
      const id = product.category?.id ?? product.categoryId;
      if (id && !map.has(id)) map.set(id, product.image);
    });
    return map;
  }, [products]);

  // Filter by section + search query. Search matches the localized name,
  // description, category name and home-section names (served as keywords).
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (q) {
        const categoryName = product.category?.name ?? "";
        const sectionNames =
          "homeSections" in product
            ? product.homeSections.map((s) => s.name)
            : [];
        const haystack = [
          product.name,
          product.description,
          categoryName,
          ...sectionNames,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeSection !== "featured") {
        return (
          "homeSections" in product &&
          product.homeSections.some((s) => s.key === activeSection)
        );
      }
      return true;
    });
  }, [products, query, activeSection]);

  // Group products by category in server-defined display order
  const categoryGroups = useMemo(() => {
    const map = new Map(
      categories.map((cat) => [
        cat.id,
        { category: cat, products: [] as typeof filteredProducts },
      ]),
    );
    filteredProducts.forEach((product) => {
      const id = product.category?.id ?? product.categoryId;
      map.get(id)?.products.push(product);
    });
    return Array.from(map.values()).filter((g) => g.products.length > 0);
  }, [filteredProducts, categories]);

  const categoryIds = useMemo(
    () => categoryGroups.map((g) => g.category.id),
    [categoryGroups],
  );

  // Derived: use IO-tracked category if still in view, else first visible category
  const activeCategoryId =
    ioCategoryId && categoryIds.includes(ioCategoryId)
      ? ioCategoryId
      : (categoryIds[0] ?? "");

  // IntersectionObserver — keeps active category chip in sync while scrolling
  useEffect(() => {
    if (!categoryIds.length) return;
    const observers = categoryIds.map((id) => {
      const el = document.getElementById(`cat-${id}`);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIoCategoryId(id);
        },
        { rootMargin: "-80px 0px -55% 0px", threshold: 0 },
      );
      observer.observe(el);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [categoryIds]);

  // Smooth scroll to a category section, accounting for sticky header heights
  const scrollToCategory = useCallback((id: string) => {
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 210;
    window.scrollTo({ top, behavior: "smooth" });
    setIoCategoryId(id);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Non-sticky compact page header */}
      <MenuHeader />

      {/* Sticky filter bar — full-width via negative margin technique */}
      <div className="sticky top-[4.75rem] z-30 -mx-4 border-b border-border/40 bg-background/95 px-4 pb-2.5 pt-2 backdrop-blur-md md:-mx-6 md:px-6 lg:-mx-12 lg:px-12">
        <MenuSearch initialValue={initialQuery} />
        <div className="mt-2">
          <MenuSectionTabs
            homeSections={homeSections}
            categories={categories.map((category) => ({
              id: category.id,
              name: category.name,
              image: categoryImages.get(category.id),
            }))}
            activeHomeSection={activeSection}
            activeCategoryId={activeCategoryId}
            onCategoryClick={scrollToCategory}
          />
        </div>
      </div>

      {/* Product catalog */}
      <div className="pb-12">
        {categoryGroups.length > 0 ? (
          <MenuProductsGrid categoryGroups={categoryGroups} />
        ) : (
          <MenuEmpty />
        )}
      </div>
    </div>
  );
}
