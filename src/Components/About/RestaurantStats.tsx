"use client";

import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";

interface Stat {
  value: string;
  label: string;
  description: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.08 },
  },
};

const statVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function RestaurantStats() {
  const t = useTranslations("about.stats");
  const stats = t.raw("items") as Stat[];

  return (
    <section className="marginSection">
      {/* Section label */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
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

      {/* Stats grid */}
      <motion.div
        className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={statVariants}
            whileHover={{
              y: -4,
              transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
            }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card px-5 py-8 text-center shadow-[0_2px_8px_0_oklch(0.493_0.128_33_/_0.05)]"
          >
            <span className="font-heading text-4xl font-bold text-primary sm:text-5xl">
              {stat.value}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {stat.label}
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              {stat.description}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
