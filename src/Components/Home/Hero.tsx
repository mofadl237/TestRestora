"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/src/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sliderData } from "@/src/data";
import type { Slide, SlideContent } from "@/src/Interfaces";

const AUTOPLAY_DURATION = 5000;

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
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

export function Hero() {
  const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations("hero");
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heroImageY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroImageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const slides: Slide[] = useMemo(() => {
    const translatedSlides = t.raw("slides") as SlideContent[];
    return sliderData.map((media, index) => ({
      ...media,
      ...translatedSlides[index],
    }));
  }, [t]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const paginate = useCallback(
    (newDirection: number) => {
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
    timeoutRef.current = setTimeout(() => paginate(1), AUTOPLAY_DURATION);
    return () => resetTimeout();
  }, [activeIndex, paginate, resetTimeout]);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[85vh] items-center justify-center overflow-hidden bg-background md:min-h-screen"
    >
      {/* Background food image with parallax */}
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={activeIndex}
          custom={direction}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <motion.div
            style={{ y: heroImageY, scale: heroImageScale }}
            className="absolute inset-0"
          >
            <Image
              src={slides[activeIndex].image}
              alt={slides[activeIndex].title}
              fill
              priority={activeIndex === 0}
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Bottom gradient fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(to top, var(--color-background) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        {/* Badge */}
        <motion.div variants={textContainerVariants} initial="hidden" animate="visible">
          <motion.div
            variants={textItemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {t("badge")}
          </motion.div>
        </motion.div>

        {/* Dynamic slide content */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={activeIndex}
            variants={textContainerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="space-y-5"
          >
            <motion.p
              variants={textItemVariants}
              className="font-semibold uppercase tracking-[0.2em] text-primary"
            >
              {slides[activeIndex].subtitle}
            </motion.p>
            <motion.h1
              variants={textItemVariants}
              className="font-heading text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl"
            >
              {slides[activeIndex].title}
            </motion.h1>
            <motion.p
              variants={textItemVariants}
              className="mx-auto max-w-lg text-lg text-white/70"
            >
              {slides[activeIndex].description}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8"
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

        {/* Slide indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10 flex items-center justify-center gap-2"
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  isActive ? "w-8 bg-primary" : "w-2 bg-white/30 hover:bg-white/50",
                )}
                aria-label={t("goToSlide", { number: index + 1 })}
                type="button"
              />
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
