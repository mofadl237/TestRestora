"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const SECTION_EMOJIS: Record<string, string> = {
  featured: "⭐",
  "best-sellers": "🔥",
  "chef-recommendations": "👨\u200d🍳",
  "seasonal-specials": "🌿",
  "family-meals": "👨\u200d👩\u200d👧",
  "combo-meals": "🍱",
  "kids-meals": "🧒",
  "limited-offers": "🎁",
};

const IMAGE_FALLBACK = "/images/pizza1.png";

interface ICategoryTab {
  id: string;
  name: string;
  image?: string;
}

interface IProps {
  homeSections: Array<{ id: string; key: string; name: string }>;
  categories: ICategoryTab[];
  activeHomeSection: string;
  activeCategoryId: string;
  onCategoryClick: (id: string) => void;
}

export function MenuSectionTabs({
  homeSections,
  categories,
  activeHomeSection,
  activeCategoryId,
  onCategoryClick,
}: IProps) {
  const locale = useLocale();
  const t = useTranslations("menu.sections");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryRowRef = useRef<HTMLDivElement>(null);
  const isArabic = locale === "ar";

  const sectionItems = useMemo(
    () => [
      {
        id: "featured",
        key: "featured",
        name: t("featured"),
      },
      ...homeSections,
    ],
    [homeSections, t],
  );

  // Auto-scroll active category card into view
  useEffect(() => {
    const row = categoryRowRef.current;
    if (!row || !activeCategoryId) return;
    const chip = row.querySelector<HTMLElement>(
      `[data-cat-id="${activeCategoryId}"]`,
    );
    if (chip)
      chip.scrollIntoView({
        inline: "center",
        block: "nearest",
        behavior: "smooth",
      });
  }, [activeCategoryId]);

  const handleSectionClick = (key: string) => {
    // Native History API — avoids a Next.js navigation/RSC refetch (the menu
    // page is dynamically rendered, so router.replace would re-run every
    // Prisma query in MenuPage.getMenuData on each click).
    const params = new URLSearchParams(searchParams.toString());
    params.set("section", key);
    window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      {/* Section filter chips */}
      <div
        className="snap-x overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="flex w-max gap-1.5 px-0.5 pb-1">
          {sectionItems.map((section) => {
            const isActive = activeHomeSection === section.key;
            const emoji = SECTION_EMOJIS[section.key];
            return (
              <motion.button
                key={section.id}
                type="button"
                whileTap={{ scale: 0.93 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() => handleSectionClick(section.key)}
                aria-pressed={isActive}
                className={`relative snap-start overflow-hidden whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="menu-section-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1">
                  {emoji && <span className="text-[11px]">{emoji}</span>}
                  {section.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Category visual cards */}
      <div
        ref={categoryRowRef}
        className="snap-x overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="flex w-max gap-1.5 px-0.5 pb-1">
          {categories.map((category) => {
            const isActive = activeCategoryId === category.id;
            return (
              <motion.button
                key={category.id}
                type="button"
                data-cat-id={category.id}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onClick={() => onCategoryClick(category.id)}
                aria-pressed={isActive}
                className={`relative snap-start overflow-hidden whitespace-nowrap rounded-2xl border px-2 py-1.5 text-start transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  isActive
                    ? "border-primary/40"
                    : "border-border/60 bg-card hover:border-border hover:bg-muted/40"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="menu-category-pill"
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span
                    className={`h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-muted transition-colors duration-200 ${
                      isActive ? "border-primary/50" : "border-border/70"
                    }`}
                  >
                    <Image
                      src={category.image || IMAGE_FALLBACK}
                      alt=""
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </span>
                  <span className="max-w-[7rem] truncate text-[12px] font-semibold">
                    {category.name}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
