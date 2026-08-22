"use client";

import { motion, Variants } from "framer-motion";
import {
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaSnapchat,
  FaTiktok,
} from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { usePublicSettings } from "./data";

interface SocialEntry {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export function FooterBottom({ variants }: { variants?: Variants }) {
  const t = useTranslations("footer");
  const tCommon = useTranslations("common");
  const publicSettings = usePublicSettings();
  const currentYear = new Date().getFullYear();
  const brandName =
    publicSettings?.restaurantName?.trim() || tCommon("brandName");

  const social = publicSettings?.social;
  const socialLinks: SocialEntry[] = [
    {
      icon: FaFacebookF,
      label: t("social.facebook"),
      href: social?.facebook?.trim() ?? "",
    },
    {
      icon: FaInstagram,
      label: t("social.instagram"),
      href: social?.instagram?.trim() ?? "",
    },
    {
      icon: FaTiktok,
      label: t("social.tiktok"),
      href: social?.tiktok?.trim() ?? "",
    },
    {
      icon: FaSnapchat,
      label: t("social.snapchat"),
      href: social?.snapchat?.trim() ?? "",
    },
    {
      icon: FaGlobe,
      label: t("social.website"),
      href: social?.website?.trim() ?? "",
    },
  ].filter((entry) => Boolean(entry.href));

  const designedByEmail = publicSettings?.contact?.email?.trim();

  return (
    <motion.div
      variants={variants}
      className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border/40 pt-8 sm:flex-row"
    >
      <p className="text-sm font-medium text-muted-foreground">
        {t("rights", { year: currentYear, name: brandName })}
      </p>

      <div className="flex items-center gap-4">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            aria-label={social.label}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm ring-1 ring-border/50 transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-primary-foreground hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <social.icon className="text-sm" />
          </a>
        ))}
      </div>

      {designedByEmail && (
        <p className="text-sm font-medium text-muted-foreground">
          {t.rich("designedBy", {
            email: designedByEmail,
            highlight: (chunks) => (
              <span className="text-primary">{chunks}</span>
            ),
          })}
        </p>
      )}
    </motion.div>
  );
}
