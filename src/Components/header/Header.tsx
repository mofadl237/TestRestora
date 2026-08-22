"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState, useRef } from "react";
import { FaPizzaSlice } from "react-icons/fa6";
import NavBar from "./NavBar";
import { ToggleMode } from "./ToggleMode";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CartButton } from "./CartButton";
import { Link } from "@/src/i18n/routing";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useTranslations } from "next-intl";
import { usePublicSettings } from "../Footer/data";

const Header = () => {
  const t = useTranslations("common");
  const publicSettings = usePublicSettings();
  const brandName = publicSettings?.restaurantName?.trim() || t("brandName");
  const [isScrolled, setIsScrolled] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > lastScrollY.current);
    lastScrollY.current = latest;
  });

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="sticky top-3 z-50 w-full"
    >
      <motion.div
        animate={
          isScrolled
            ? { scale: isDesktop ? 0.6 : 0.97 }
            : { scale: 1 }
        }
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={[
          "mx-auto flex items-center justify-between gap-2 rounded-full border px-3 py-2.5 backdrop-blur-xl transition-all duration-300 md:gap-4 md:px-5",
          isScrolled
            ? "border-border/80 bg-background/80 shadow-sm"
            : "border-border/70 bg-background/65 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.28)]",
        ].join(" ")}
      >
        <Link
          href="/"
          className="group inline-flex shrink-0 items-center gap-3 rounded-full px-1.5 py-1.5 text-foreground transition-colors duration-300 md:px-2"
          aria-label={t("homeAria")}
        >
          <motion.span
            whileHover={{ scale: 1.08, rotate: -6 }}
            transition={{ type: "spring", stiffness: 320, damping: 18 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm md:h-10 md:w-10"
          >
            <FaPizzaSlice className="text-base md:text-lg" />
          </motion.span>

          <span className="hidden font-heading text-md font-semibold tracking-[0.18em] text-foreground md:inline md:text-xl">
            {brandName}
          </span>
        </Link>

        <div className="flex items-center gap-1.5 md:gap-2">
          <NavBar />
          {/* Theme + language live inside the mobile sidebar — see NavBar */}
          <div className="hidden items-center gap-1.5 md:flex md:gap-2">
            <ToggleMode />
            <LanguageSwitcher />
          </div>
          <CartButton />
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Header;
