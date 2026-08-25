"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/src/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetHomeQuery } from "@/src/store/api/publicApi";
import { useActiveBranchId } from "@/src/store/features/BranchSlice";
import { usePublicSettings } from "@/src/Components/Footer/data";
import { useLocale } from "next-intl";
import type { IHomeProduct } from "@/src/Interfaces";

const AUTOPLAY_DURATION = 6000;

const textItemVariants = {
  hidden: { y: 30, opacity: 0, filter: "blur(6px)" },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, stiffness: 80, damping: 18 },
  },
};

const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function getDisplayPrice(product: IHomeProduct): {
  from: boolean;
  price: number;
  originalPrice?: number;
} {
  const variants = product.variants ?? [];
  if (variants.length > 0) {
    const prices = variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { from: true, price: min, originalPrice: max > min ? max : undefined };
  }
  return { from: false, price: product.basePrice };
}

export function Hero() {
  const locale = useLocale();
  const branchId = useActiveBranchId();
  const t = useTranslations("hero");
  const settings = usePublicSettings();
  const coverImage = settings?.branding?.coverImage || null;

  const { data: home } = useGetHomeQuery({ locale, branchId });

  // Collect all products from all sections (excluding offers)
  const products: IHomeProduct[] = [];
  if (home) {
    const sectionArrays: IHomeProduct[][] = [
      home.bestSellers ?? [],
      home.chefRecommendations ?? [],
      home.familyMeals ?? [],
      home.newItems ?? [],
      home.kidsMeals ?? [],
      home.comboMeals ?? [],
    ];
    for (const sectionProducts of sectionArrays) {
      for (const p of sectionProducts) {
        if (!products.some((ep) => ep.id === p.id)) {
          products.push(p);
        }
      }
    }
  }

  const slides = products.slice(0, 12); // Cap at 12 for performance

  const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const paginate = useCallback(
    (newDirection: number) => {
      if (slides.length === 0) return;
      setActiveIndex(([prevIndex]) => [
        (prevIndex + newDirection + slides.length) % slides.length,
        newDirection,
      ]);
    },
    [slides.length],
  );

  const goToSlide = useCallback(
    (newIndex: number) => {
      resetTimeout();
      setActiveIndex(([prevIndex]) => {
        if (prevIndex === newIndex) return [prevIndex, 0];
        return [newIndex, newIndex > prevIndex ? 1 : -1];
      });
    },
    [resetTimeout],
  );

  useEffect(() => {
    resetTimeout();
    if (slides.length > 0) {
      timeoutRef.current = setTimeout(() => paginate(1), AUTOPLAY_DURATION);
    }
    return () => resetTimeout();
  }, [activeIndex, paginate, resetTimeout, slides.length]);

  // While products are loading, show a minimal branded hero
  if (slides.length === 0) {
    return (
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-background md:min-h-[85vh]">
        {coverImage && (
          <Image
            src={coverImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-15"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <div className="relative z-10 text-center">
          <p className="text-lg text-muted-foreground">{t("badge")}</p>
        </div>
      </section>
    );
  }

  const activeProduct = slides[activeIndex];
  const displayPrice = getDisplayPrice(activeProduct);
  const categoryName = activeProduct.category?.name ?? "";

  return (
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-background md:min-h-screen">
      {/* Background product image with crossfade */}
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={activeProduct.id + "-" + activeIndex}
          custom={direction}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {activeProduct.image ? (
            <Image
              src={activeProduct.image}
              alt={activeProduct.name}
              fill
              priority={activeIndex === 0}
              className="object-cover"
              sizes="100vw"
            />
          ) : coverImage ? (
            <Image
              src={coverImage}
              alt=""
              fill
              priority={activeIndex === 0}
              className="object-cover"
              sizes="100vw"
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to top, var(--color-background) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 md:flex-row md:items-center md:gap-12">
        {/* Left: product image (visible on md+) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProduct.id + "-img"}
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden w-full max-w-md flex-shrink-0 md:block lg:max-w-lg"
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl shadow-2xl">
              {activeProduct.image ? (
                <Image
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  fill
                  sizes="(min-width: 768px) 33vw, 0"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10">
                  <span className="font-heading text-6xl text-primary/30">
                    {activeProduct.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Right: text content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeProduct.id + "-text"}
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex flex-1 flex-col items-center text-center md:items-start md:text-left"
          >
            {categoryName && (
              <motion.p
                variants={textItemVariants}
                className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-primary"
              >
                {categoryName}
              </motion.p>
            )}

            <motion.h1
              variants={textItemVariants}
              className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl"
            >
              {activeProduct.name}
            </motion.h1>

            {activeProduct.description && (
              <motion.p
                variants={textItemVariants}
                className="mx-auto mt-4 max-w-md text-base text-white/65 md:mx-0 lg:text-lg"
              >
                {activeProduct.description.length > 140
                  ? activeProduct.description.slice(0, 140) + "..."
                  : activeProduct.description}
              </motion.p>
            )}

            <motion.div
              variants={textItemVariants}
              className="mt-6 flex items-baseline gap-3"
            >
              <span className="font-heading text-3xl font-bold text-white lg:text-4xl">
                {displayPrice.from && (
                  <span className="mr-1 text-sm font-normal text-white/50">
                    {t("from") ?? "From"}
                  </span>
                )}
                {formatPrice(displayPrice.price)}
              </span>
              {displayPrice.originalPrice != null && (
                <span className="text-lg text-white/40 line-through">
                  {formatPrice(displayPrice.originalPrice)}
                </span>
              )}
            </motion.div>

            <motion.div
              variants={textItemVariants}
              className="mt-8 flex items-center gap-4"
            >
              <Link
                href="/menu"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "font-semibold px-8 bg-primary hover:bg-primary/90",
                )}
              >
                {t("shopNow")}
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2"
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  isActive
                    ? "w-8 bg-primary"
                    : "w-2 bg-white/30 hover:bg-white/50",
                )}
                aria-label={`${slide.name} ${index + 1}`}
                type="button"
              />
            );
          })}
        </motion.div>
      )}
    </section>
  );
}
