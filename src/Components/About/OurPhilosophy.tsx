"use client";

import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";

interface PhilosophyPillar {
  number: string;
  title: string;
  description: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function OurPhilosophy() {
  const t = useTranslations("about.philosophy");
  const pillars = t.raw("pillars") as PhilosophyPillar[];

  return (
    <section className="marginSection relative overflow-hidden">
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="h-full w-full rounded-3xl bg-card/60" />
      </div>

      {/* Header */}
      <motion.div
        className="mb-12 text-center md:mb-16"
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const }}
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          <span className="mr-2 text-primary">—</span>
          {t("kicker")}
          <span className="ml-2 text-primary">—</span>
        </p>
        <h2 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("title")}
        </h2>
      </motion.div>

      {/* Pillars grid */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {pillars.map((pillar) => (
          <motion.div
            key={pillar.number}
            variants={cardVariants}
            whileHover={{
              y: -4,
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
            }}
            className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-background p-6 shadow-[0_2px_8px_0_oklch(0.493_0.128_33_/_0.05)]"
          >
            <span className="font-heading text-4xl font-bold text-primary/25 leading-none">
              {pillar.number}
            </span>
            <div className="h-px w-8 bg-primary/40" />
            <h3 className="text-base font-semibold text-foreground">
              {pillar.title}
            </h3>
            <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
              {pillar.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
