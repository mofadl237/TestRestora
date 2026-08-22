"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface ChefText {
  name: string;
  role: string;
  bio: string;
}

const chefImages = [
  "/images/pizza1.png",
  "/images/pizza8.png",
  "/images/pizza9.png",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function MeetChefs() {
  const t = useTranslations("about.chefs");
  const people = t.raw("people") as ChefText[];
  const chefs = people.map((person, index) => ({
    ...person,
    image: chefImages[index],
  }));

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

      {/* Chefs grid */}
      <motion.div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {chefs.map((chef) => (
          <motion.article
            key={chef.name}
            variants={cardVariants}
            whileHover={{
              y: -6,
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
            }}
            className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-[0_2px_8px_0_oklch(0.493_0.128_33_/_0.06)]"
          >
            {/* Image */}
            <div className="relative h-64 overflow-hidden">
              <Image
                src={chef.image}
                alt={chef.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {/* Bottom fade */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
                style={{
                  background:
                    "linear-gradient(to top, var(--color-card) 0%, transparent 100%)",
                }}
              />
            </div>

            {/* Info */}
            <div className="px-6 pb-7 pt-3">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {chef.name}
              </h3>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">
                {chef.role}
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {chef.bio}
              </p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
