"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaSnapchat,
  FaTiktok,
} from "react-icons/fa6";
import { usePublicSettings } from "../Footer/data";
import { itemVariants } from "./animations";

interface SocialLink {
  key: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ContactSocial() {
  const t = useTranslations("contact.social");
  const publicSettings = usePublicSettings();
  const social = publicSettings?.social;

  const links: SocialLink[] = [
    {
      key: "instagram",
      href: social?.instagram?.trim() ?? "",
      icon: FaInstagram,
    },
    {
      key: "facebook",
      href: social?.facebook?.trim() ?? "",
      icon: FaFacebookF,
    },
    {
      key: "tiktok",
      href: social?.tiktok?.trim() ?? "",
      icon: FaTiktok,
    },
    {
      key: "snapchat",
      href: social?.snapchat?.trim() ?? "",
      icon: FaSnapchat,
    },
    {
      key: "website",
      href: social?.website?.trim() ?? "",
      icon: FaGlobe,
    },
  ].filter((link) => Boolean(link.href));

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_8px_0_oklch(0.493_0.128_33_/_0.05)]"
    >
      <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        {t("title")}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>

      <div className="mt-5 flex items-center gap-3">
        {links.map(({ key, href, icon: Icon }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={t(key)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </motion.div>
  );
}
