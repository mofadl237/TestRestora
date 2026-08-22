"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Phone, Send } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { usePublicSettings } from "../Footer/data";
import { containerVariants, itemVariants } from "./animations";

export function ContactHero() {
  const t = useTranslations("contact.hero");
  const phone = usePublicSettings()?.contact?.phone?.trim();

  return (
    <section className="relative overflow-hidden pb-16 pt-14 md:pb-24 md:pt-20 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-2/3 w-2/3 rounded-full bg-primary/6 blur-[100px]" />
      </div>

      <motion.div
        className="flex flex-col items-center gap-7 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.span
          className="inline-flex items-center gap-2.5 rounded-full border border-border/70 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm ring-1 ring-foreground/5"
          variants={itemVariants}
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {t("badge")}
        </motion.span>

        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground"
          variants={itemVariants}
        >
          <span className="mr-2 text-primary">—</span>
          {t("kicker")}
          <span className="ml-2 text-primary">—</span>
        </motion.p>

        <motion.h1
          className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl"
          variants={itemVariants}
        >
          {t("titleStart")}{" "}
          <span className="text-primary">{t("titleHighlight")}</span>
        </motion.h1>

        <motion.p
          className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
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
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {t("callNow")}
          </Link>
          <Link
            href="#message"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-7 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors duration-300 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Send className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            {t("sendMessage")}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
