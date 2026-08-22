"use client";

import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { ChevronUp, UtensilsCrossed } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/src/i18n/routing";

const ATTENTION_INTERVAL = 9000;

const baseShadow =
  "0 10px 30px -8px oklch(0.215 0.017 28 / 0.3), 0 2px 8px -2px oklch(0.215 0.017 28 / 0.18)";

export function FloatingMenuCta() {
  const t = useTranslations("menu");
  const common = useTranslations("common");
  const locale = useLocale();
  const isArabic = locale === "ar";

  const controls = useAnimationControls();
  const [paused, setPaused] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);
  const [showTop, setShowTop] = useState(() =>
    typeof window !== "undefined" ? window.scrollY > 400 : false,
  );

  // Width-expansion attention pulse every ~9s, paused while the user
  // hovers/focuses/touches so it never competes with real interaction.
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      controls.start({
        scaleX: [1, 1.06, 1],
        filter: ["brightness(1)", "brightness(1.08)", "brightness(1)"],
        transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
      });
    }, ATTENTION_INTERVAL);
    return () => window.clearInterval(id);
  }, [paused, controls]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <div className="fixed bottom-6 end-4 z-[90] flex flex-col items-end gap-2.5 sm:end-6">
      {/* Scroll-to-top — stacked above the CTA, appears on scroll */}
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            onClick={scrollToTop}
            aria-label={common("backToTop")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-sm backdrop-blur-xl transition-colors duration-300 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ChevronUp className="h-[18px] w-[18px]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Floating glass Menu CTA */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.3 }}
        className="relative"
        onHoverStart={pause}
        onHoverEnd={resume}
        onFocus={pause}
        onBlur={resume}
        onPointerDown={pause}
        onPointerUp={resume}
      >
        <Link
          href="/menu"
          aria-label={t("browseMenu")}
          onPointerDown={() => setRippleKey((current) => current + 1)}
          className="group relative flex items-center gap-2 rounded-full border border-border/60 bg-background/85 py-2.5 pe-4 ps-3 text-foreground shadow-sm outline-none backdrop-blur-xl transition-colors duration-300 hover:bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{
            boxShadow: baseShadow,
            transformOrigin: isArabic ? "right" : "left",
          }}
        >
          {/* Attention pulse ring */}
          <AnimatePresence>
            {rippleKey > 0 && (
              <motion.span
                key={`cta-ripple-${rippleKey}`}
                initial={{ scale: 1, opacity: 0.45 }}
                animate={{ scale: 2.1, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 rounded-full bg-primary/25"
                aria-hidden
              />
            )}
          </AnimatePresence>

          {/* Width-expansion control target */}
          <motion.span
            animate={controls}
            className="flex items-center gap-2"
          >
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-semibold tracking-[0.02em]">
              {t("browseMenu")}
            </span>
          </motion.span>
        </Link>
      </motion.div>
    </div>
  );
}
