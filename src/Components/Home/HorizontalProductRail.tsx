"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import Image from "next/image";
import { formattePrice, calcMinDisplayPrice } from "@/lib/utils";
import { AddToCartDialog } from "@/src/Components/Product/AddToCartDialog";
import { IconChevronBack, IconChevronNext } from "@/src/lib/i18n/DirectionalIcons";
import type { IHomeProduct } from "@/src/Interfaces";

interface HorizontalProductRailProps {
  products: IHomeProduct[];
}

const IMAGE_FALLBACK = "/images/pizza1.png";

export function HorizontalProductRail({ products }: HorizontalProductRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRTL = useLocale() === "ar";
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const dir = isRTL ? "rtl" : "ltr";
    if (dir === "rtl") {
      setCanScrollPrev(el.scrollLeft < -10);
      setCanScrollNext(el.scrollLeft > -(el.scrollWidth - el.clientWidth - 10));
    } else {
      setCanScrollPrev(el.scrollLeft > 10);
      setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  }, [isRTL]);

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
  }, [checkScroll, products.length]);

  const scroll = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector<HTMLElement>("article")?.offsetWidth ?? 280;
    const gap = 16;
    const amount = (cardWidth + gap) * (isRTL ? -1 : 1);
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <div className="group/rail relative">
      <div
        ref={scrollRef}
        dir={isRTL ? "rtl" : "ltr"}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-4 pt-1 touch-pan-x [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {products.map((product, i) => {
          const hasVariants = !!product.variants?.length;
          const variantDeltas = product.variants?.map((v) => v.price) ?? [];
          const startingPrice = hasVariants
            ? calcMinDisplayPrice(product.basePrice, variantDeltas)
            : product.basePrice;

          return (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.6,
                ease: EASE,
                delay: Math.min(i * 0.06, 0.3),
              }}
              className="group/card relative flex w-[260px] min-w-[260px] snap-start flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-[border-color,box-shadow] duration-300 hover:border-border hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.25)] sm:w-[280px] sm:min-w-[280px]"
            >
              <div
                className="relative aspect-[4/3] w-full overflow-hidden bg-muted"
                data-cart-source-image={product.id}
              >
                <Image
                  src={product.image || IMAGE_FALLBACK}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 260px, 280px"
                  className="object-cover transition-transform duration-500 group-hover/card:scale-[1.05]"
                  loading="lazy"
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
                  style={{
                    background:
                      "linear-gradient(to top, var(--color-card) 0%, transparent 100%)",
                  }}
                />
              </div>

              <div className="flex flex-1 flex-col gap-1 px-4 pb-4 pt-2">
                <h3 className="line-clamp-1 text-sm font-bold tracking-tight text-foreground">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                )}
                <div className="mt-auto flex items-baseline gap-1 pt-2">
                  {hasVariants && (
                    <span className="text-[11px] font-medium text-muted-foreground">
                      From
                    </span>
                  )}
                  <span className="text-lg font-bold tracking-tight text-primary">
                    {formattePrice(startingPrice)}
                  </span>
                </div>
              </div>

              <div className="px-4 pb-4">
                <AddToCartDialog product={product} />
              </div>
            </motion.article>
          );
        })}
      </div>

      {canScrollPrev && (
        <button
          onClick={() => scroll("prev")}
          className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition-opacity duration-200 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-0 group-hover/rail:opacity-100"
          aria-label="Scroll left"
          type="button"
        >
          <IconChevronBack className="h-5 w-5" />
        </button>
      )}
      {canScrollNext && (
        <button
          onClick={() => scroll("next")}
          className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground shadow-lg backdrop-blur-sm transition-opacity duration-200 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring opacity-0 group-hover/rail:opacity-100"
          aria-label="Scroll right"
          type="button"
        >
          <IconChevronNext className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

const EASE = [0.22, 1, 0.36, 1] as const;
