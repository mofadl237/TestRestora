"use client";

import type { IHomeSection, IHomeProduct } from "@/src/Interfaces";
import { HorizontalProductRail } from "./HorizontalProductRail";
import { SectionHeader } from "./SectionHeader";

interface SectionData {
  key: string;
  products: IHomeProduct[];
}

const SECTION_EYEBROWS: Record<string, string> = {
  "best-sellers": "Most Popular",
  "chef-recommendations": "Chef's Pick",
  "family-meals": "For the Table",
  "new-items": "Just In",
  "kids-meals": "For Kids",
  "combo-meals": "Value Deals",
};

interface HomeSectionRendererProps {
  orderedSections: IHomeSection[];
  productSectionData: SectionData[];
}

export function HomeSectionRenderer({
  orderedSections,
  productSectionData,
}: HomeSectionRendererProps) {
  return (
    <>
      {orderedSections.map((section) => {
        const data = productSectionData.find((d) => d.key === section.key);
        if (!data || data.products.length === 0) return null;

        return (
          <section
            key={section.id}
            className="py-8 md:py-14 lg:py-20"
          >
            <div className="mx-auto max-w-7xl">
              <SectionHeader
                title={section.name}
                eyebrow={SECTION_EYEBROWS[section.key]}
              />
              <div className="mt-8">
                <HorizontalProductRail products={data.products} />
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
