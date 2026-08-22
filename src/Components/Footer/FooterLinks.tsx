"use client";

import { motion, Variants } from "framer-motion";
import { Link } from "@/src/i18n/routing";
import { dataNavBarWebsite } from "@/src/data";
import { useTranslations } from "next-intl";

export function FooterLinks({ variants }: { variants?: Variants }) {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");

  const companyLinks = dataNavBarWebsite
    .filter((link) => link.path !== "/cart")
    .map((link) => {
      let key = "";
      if (link.path === "/about") key = "about";
      else if (link.path === "/contact") key = "contact";
      else if (link.path === "/menu") key = "menu";
      else if (link.path === "/track-order") key = "trackOrder";
      return { label: key ? tCommon(key) : link.label, path: link.path };
    });
  companyLinks.push({ label: t("reservations"), path: "/reservations" });

  const legalLinks = [
    { label: t("privacyPolicy"), path: "#" },
    { label: t("termsOfService"), path: "#" },
    { label: t("cookiePolicy"), path: "#" },
    { label: t("allergenInfo"), path: "#" },
  ];

  return (
    <div className="grid grid-cols-2 gap-8 sm:gap-12">
      <motion.div variants={variants} className="flex flex-col gap-5">
        <h4 className="font-heading text-lg font-semibold tracking-wider text-foreground">
          {t("quickLinks")}
        </h4>
        <nav className="flex flex-col gap-3.5" aria-label={t("quickLinksAria")}>
          {companyLinks.map((link) => (
            <Link
              key={link.label}
              href={link.path}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </motion.div>

      <motion.div variants={variants} className="flex flex-col gap-5">
        <h4 className="font-heading text-lg font-semibold tracking-wider text-foreground">
          {t("legal")}
        </h4>
        <nav className="flex flex-col gap-3.5" aria-label={t("legalLinksAria")}>
          {legalLinks.map((link) => (
            <Link
              key={link.label}
              href={link.path}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </motion.div>
    </div>
  );
}
