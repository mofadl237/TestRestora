"use client";

import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";

interface Reason {
  icon: string;
  title: string;
  description: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function WhyChooseUs() {
  const t = useTranslations("about.whyChooseUs");
  const reasons = t.raw("reasons") as Reason[];

  return (
    <section className="marginSection">
      {/* Header */}
      <motion.div
        className="mb-12 text-center md:mb-16"
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
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

      {/* Grid */}
      <motion.div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
      >
        {reasons.map((reason) => (
          <motion.div
            key={reason.title}
            variants={itemVariants}
            whileHover={{
              y: -4,
              transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
            }}
            className="flex gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-[0_1px_4px_0_oklch(0.493_0.128_33_/_0.04)]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background text-xl">
              {reason.icon}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-foreground">
                {reason.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {reason.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
