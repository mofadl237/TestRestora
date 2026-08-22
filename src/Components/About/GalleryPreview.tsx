"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";

const imageSrcs = [
  "/images/pizza1.png",
  "/images/pizza8.png",
  "/images/pizza9.png",
  "/images/pizza10.png",
  "/images/pizza2.png",
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.06, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function GalleryPreview() {
  const t = useTranslations("about.gallery");
  const alts = t.raw("imageAlts") as string[];
  const images = imageSrcs.map((src, index) => ({ src, alt: alts[index] }));

  return (
    <section className="marginSection">
      {/* Header */}
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] as const }}
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
        className="grid auto-rows-[200px] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {images.map((img, i) => (
          <motion.div
            key={img.src}
            variants={imageVariants}
            whileHover={{ scale: 1.02, transition: { duration: 0.35 } }}
            className={[
              "group relative overflow-hidden rounded-2xl",
              i === 0 ? "col-span-2 row-span-2" : "",
            ]
              .join(" ")
              .trim()}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(to top, color-mix(in oklch, var(--primary) 30%, transparent) 0%, transparent 60%)",
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
