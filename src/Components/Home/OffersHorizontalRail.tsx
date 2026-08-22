"use client";

import { useRef, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGetOffersQuery } from "@/src/store/api/publicApi";
import { PremiumOfferCard } from "./OfferCard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface OffersHorizontalRailProps {
  sectionName: string;
  sectionSubtitle?: string;
}

export function OffersHorizontalRail({
  sectionName,
  sectionSubtitle,
}: OffersHorizontalRailProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { data: offers = [] } = useGetOffersQuery({ locale });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile || !containerRef.current || !railRef.current || offers.length === 0) {
      return;
    }

    const container = containerRef.current;
    const rail = railRef.current;

    const setupAnimation = () => {
      const totalScrollWidth = rail.scrollWidth - rail.clientWidth;
      if (totalScrollWidth <= 0) return;

      container.style.height = `${container.offsetHeight + totalScrollWidth}px`;

      triggerRef.current = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${totalScrollWidth}`,
        scrub: 0.5,
        pin: rail,
        anticipatePin: 1,
        animation: gsap.to(rail, {
          x: isRTL ? totalScrollWidth : -totalScrollWidth,
          ease: "none",
        }),
        invalidateOnRefresh: true,
      });
    };

    const timer = setTimeout(setupAnimation, 100);

    return () => {
      clearTimeout(timer);
      triggerRef.current?.kill();
      triggerRef.current = null;
      container.style.height = "";
      gsap.set(rail, { x: 0 });
    };
  }, [isMobile, offers.length, isRTL]);

  if (offers.length === 0) return null;

  return (
    <section ref={containerRef} className="relative">
      {/* Section Header */}
      <div className="px-4 pt-12 pb-6 md:px-6 lg:px-12">
        <div className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <span className="mr-2 text-primary">&mdash;</span>
            {sectionSubtitle || "Deals and bundles available right now"}
            <span className="ml-2 text-primary">&mdash;</span>
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {sectionName}
          </h2>
          <div
            className="mx-auto mt-5 h-px w-16"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--color-primary), transparent)",
            }}
          />
        </div>
      </div>

      {/* Mobile: simple horizontal scroll */}
      {isMobile ? (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-8 pt-2 touch-pan-x [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {offers.map((offer, i) => (
            <PremiumOfferCard key={offer.id} offer={offer} index={i} />
          ))}
        </div>
      ) : (
        /* Desktop: GSAP scroll-driven horizontal rail */
        <div className="relative overflow-hidden px-6 lg:px-12 pb-8">
          <div
            ref={railRef}
            dir={isRTL ? "rtl" : "ltr"}
            className="flex gap-5 snap-x snap-mandatory pt-2"
          >
            {offers.map((offer, i) => (
              <PremiumOfferCard key={offer.id} offer={offer} index={i} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
