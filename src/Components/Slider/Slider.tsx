"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import HeroContent from "./HeroContent";
import HeroImage from "./HeroImage";
import { sliderData } from "@/src/data";
import { Slide, SlideContent } from "@/src/Interfaces";

const AUTOPLAY_DURATION = 4000; // 4 seconds

const Slider = () => {
  const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);
  const [autoplayKey, setAutoplayKey] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations("hero");

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
      setAutoplayKey((prev) => prev + 1);
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

        setAutoplayKey((k) => k + 1);

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
    <motion.div className="relative grid h-[90vh] min-h-175 w-full max-w-7xl grid-cols-1 items-center gap-8 overflow-hidden px-4 pt-24 md:h-screen md:min-h-200 md:grid-cols-2 md:pt-0">
      <HeroContent
        activeSlide={slides[activeIndex]}
        slides={slides}
        activeIndex={activeIndex}
        goToSlide={goToSlide}
        duration={AUTOPLAY_DURATION / 1000}
        autoplayKey={autoplayKey}
      />
      <HeroImage activeSlide={slides[activeIndex]} direction={direction} />
    </motion.div>
  );
};

export default Slider;
