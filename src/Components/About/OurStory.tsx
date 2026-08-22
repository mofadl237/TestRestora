"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

const revealLeft: Variants = {
  hidden: { opacity: 0, x: -32, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 1.0, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function OurStory() {
  const t = useTranslations("about.story");

  return (
    <section className="marginSection">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Image */}
        <motion.div
          className="relative aspect-[4/3] overflow-hidden rounded-3xl"
          variants={revealLeft}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <Image
            src="/images/pizaa11.png"
            alt={t("imageAlt")}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
          {/* Overlay gradient */}
          <div
            className="pointer-events-none absolute inset-0 rounded-3xl"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklch, var(--primary) 12%, transparent) 0%, transparent 60%)",
            }}
          />
          {/* Year badge */}
          <div className="absolute bottom-5 left-5 flex flex-col rounded-2xl border border-border/60 bg-background/85 px-5 py-3.5 backdrop-blur-md">
            <span className="font-heading text-3xl font-bold text-primary leading-none">
              {t("foundedYear")}
            </span>
            <span className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("foundedLabel")}
            </span>
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          className="flex flex-col gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground"
            variants={fadeUp}
          >
            <span className="mr-2 text-primary">—</span>
            {t("kicker")}
          </motion.p>

          <motion.h2
            className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            variants={fadeUp}
          >
            {t("titleStart")}{" "}
            <span className="text-primary">{t("titleHighlight")}</span>
          </motion.h2>

          <motion.p
            className="text-base leading-relaxed text-muted-foreground"
            variants={fadeUp}
          >
            {t("paragraph1")}
          </motion.p>

          <motion.p
            className="text-base leading-relaxed text-muted-foreground"
            variants={fadeUp}
          >
            {t("paragraph2")}
          </motion.p>

          <motion.div
            className="mt-2 flex items-center gap-4"
            variants={fadeUp}
          >
            <div className="h-px flex-1 bg-border/60" />
            <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("brandLine")}
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
