"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, Phone } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { usePublicSettings } from "../Footer/data";
import { containerVariants, itemVariants } from "./animations";

export function ContactFooterCta() {
  const t = useTranslations("contact.cta");
  const publicSettings = usePublicSettings();
  const phone = publicSettings?.contact?.phone?.trim();

  return (
    <motion.section
      className="marginSection relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 sm:py-20"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />

      <motion.p
        className="text-xs font-semibold uppercase tracking-[0.28em] opacity-70"
        variants={itemVariants}
      >
        <span className="mx-2 text-primary-foreground/90">—</span>
        {t("kicker")}
        <span className="mx-2 text-primary-foreground/90">—</span>
      </motion.p>
      <motion.h2
        className="mx-auto mb-4 mt-4 max-w-2xl font-heading text-4xl font-semibold tracking-tight sm:text-5xl"
        variants={itemVariants}
      >
        {t("title")}
      </motion.h2>
      <motion.p
        className="mx-auto mb-8 max-w-xl text-sm leading-relaxed opacity-80 sm:text-base"
        variants={itemVariants}
      >
        {t("description")}
      </motion.p>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-3"
        variants={itemVariants}
      >
        <Link
          href={phone ? `tel:${phone}` : "tel:+15550148820"}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-foreground px-8 text-sm font-semibold uppercase tracking-widest text-primary transition-opacity duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {t("callNow")}
        </Link>
        <Link
          href="/menu"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-primary-foreground/40 bg-transparent px-8 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors duration-300 hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {t("viewMenu")}
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
        </Link>
      </motion.div>
    </motion.section>
  );
}
