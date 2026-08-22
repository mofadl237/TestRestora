"use client";

import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function AboutHero() {
  const t = useTranslations("about.hero");

  return (
    <section className="relative overflow-hidden py-24 md:py-36 lg:py-44">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-2/3 w-2/3 rounded-full bg-primary/6 blur-[100px]" />
      </div>

      <motion.div
        className="flex flex-col items-center gap-6 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground"
          variants={itemVariants}
        >
          <span className="mr-2 text-primary">—</span>
          {t("kicker")}
          <span className="ml-2 text-primary">—</span>
        </motion.p>

        <motion.h1
          className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
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
            href="/menu"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("exploreMenu")}
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-7 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors duration-300 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t("reserveTable")}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
