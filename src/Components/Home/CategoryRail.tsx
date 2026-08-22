"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { IconChevronBack, IconChevronNext } from "@/src/lib/i18n/DirectionalIcons";
import type { ICategory } from "@/src/Interfaces";

const IMAGE_FALLBACK = "/images/pizza1.png";

interface CategoryRailProps {
  categories: ICategory[];
}

export function CategoryRail({ categories }: CategoryRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRTL = useLocale() === "ar";
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 10);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, categories.length]);

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>("button")?.offsetWidth ?? 180;
    const amount = cardWidth + 12;
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <div className="group/rail relative">
      <div
        ref={scrollRef}
        dir={isRTL ? "rtl" : "ltr"}
        className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4 pt-1 touch-pan-x [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {categories.map((category) => (
          <a
            key={category.id}
            href={`/menu?category=${category.id}`}
            className="group/card flex snap-start items-center gap-3 overflow-hidden rounded-2xl border border-border/50 bg-card px-3 py-2.5 transition-[border-color,box-shadow] duration-300 hover:border-primary/30 hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.2)] min-w-[180px]"
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border/60 bg-muted">
              <Image
                src={category.products?.[0]?.image || IMAGE_FALLBACK}
                alt={category.name}
                fill
                sizes="48px"
                className="object-cover transition-transform duration-300 group-hover/card:scale-110"
                loading="lazy"
              />
            </span>
            <span className="line-clamp-1 text-sm font-semibold text-foreground">
              {category.name}
            </span>
          </a>
        ))}
      </div>

      {canScrollPrev && (
        <button
          onClick={() => scroll("prev")}
          className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition-opacity duration-200 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-0 group-hover/rail:opacity-100"
          aria-label="Scroll left"
          type="button"
        >
          <IconChevronBack className="h-4 w-4" />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={() => scroll("next")}
          className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition-opacity duration-200 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-0 group-hover/rail:opacity-100"
          aria-label="Scroll right"
          type="button"
        >
          <IconChevronNext className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
