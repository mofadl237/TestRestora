"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { dataNavBarWebsite } from "@/src/data";
import CustomLink from "./CustomLink";
import { ToggleMode } from "./ToggleMode";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations } from "next-intl";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations("common");

  // Re-map the labels locally to avoid changing IDataNavBar globally and to safely keep types intact.
  // The Cart link lives as a dedicated header icon (CartButton), so it's excluded from the nav.
  const localizedLinks = dataNavBarWebsite
    .filter((link) => link.path !== "/cart")
    .map((link) => {
      let key = "";
      if (link.path === "/about") key = "about";
      else if (link.path === "/contact") key = "contact";
      else if (link.path === "/menu") key = "menu";
      else if (link.path === "/track-order") key = "trackOrder";

      return {
        ...link,
        label: key ? t(key) : link.label,
      };
    });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav
        aria-label={t("primaryNavigation")}
        className="hidden items-center gap-1 rounded-full border border-border/70 bg-background/60 p-1 md:flex"
      >
        {localizedLinks.map((link, index) => (
          <CustomLink
            href={link.path}
            label={link.label}
            key={link.path}
            className="relative inline-flex items-center rounded-full px-3 py-2 text-sm font-medium tracking-[0.04em]"
            transitionDelay={index * 0.04}
          />
        ))}
      </nav>

      <button
        type="button"
        aria-label={isMenuOpen ? t("closeMenu") : t("openMenu")}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation-menu"
        onClick={() => setIsMenuOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground cursor-pointer transition-colors duration-300 hover:bg-secondary md:hidden"
      >
        <motion.span
          animate={{ rotate: isMenuOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
        >
          {isMenuOpen ? (
            <FiX className="text-lg" />
          ) : (
            <FiMenu className="text-lg cursor-pointer" />
          )}
        </motion.span>
      </button>

      <AnimatePresence>
        {isMenuOpen ? (
          <>
            <motion.button
              type="button"
              aria-label={t("closeMenu")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 bg-background/40 md:hidden"
            />

            <motion.div
              id="mobile-navigation-menu"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="fixed inset-x-4 top-20 z-50 rounded-[28px] border border-border bg-card/95 p-4 shadow-sm backdrop-blur-xl md:hidden"
            >
              <div className="space-y-2">
                {localizedLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <CustomLink
                      href={link.path}
                      label={link.label}
                      onNavigate={closeMenu}
                      className="flex w-full items-center rounded-2xl px-4 py-3 text-base font-medium"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Theme + language, relocated here on mobile */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3, ease: "easeOut" }}
                className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3"
              >
                <div className="flex items-center gap-2">
                  <ToggleMode />
                  <LanguageSwitcher />
                </div>
              </motion.div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
