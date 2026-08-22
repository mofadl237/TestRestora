"use client";

import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";

interface Testimonial {
  quote: string;
  name: string;
  detail: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.06 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function MenuCta() {
  const t = useTranslations("about.testimonials");
  const tCta = useTranslations("about.cta");
  const testimonials = t.raw("items") as Testimonial[];

  return (
    <>
      {/* Customer testimonials */}
      <section className="marginSection">
        <motion.div
          className="mb-12 text-center"
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

        <motion.div
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
        >
          {testimonials.map((item) => (
            <motion.blockquote
              key={item.name}
              variants={cardVariants}
              whileHover={{
                y: -4,
                transition: {
                  duration: 0.25,
                  ease: [0.22, 1, 0.36, 1] as const,
                },
              }}
              className="flex flex-col gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_8px_0_oklch(0.493_0.128_33_/_0.05)]"
            >
              <span className="font-heading text-4xl leading-none text-primary">
                &quot;
              </span>
              <p className="flex-1 text-sm leading-relaxed text-foreground">
                {item.quote}
              </p>
              <footer>
                <p className="text-sm font-semibold text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </footer>
            </motion.blockquote>
          ))}
        </motion.div>
      </section>

      {/* CTA banner */}
      <motion.section
        className="marginSection relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:py-20"
        initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {/* Ambient blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] opacity-70">
          {tCta("kicker")}
        </p>
        <h2 className="mb-4 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          {tCta("title")}
        </h2>
        <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed opacity-80">
          {tCta("description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/menu"
            className="inline-flex h-11 items-center rounded-full bg-primary-foreground px-8 text-sm font-semibold uppercase tracking-widest text-primary transition-opacity duration-300 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {tCta("viewMenu")}
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center rounded-full border border-primary-foreground/40 bg-transparent px-8 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-colors duration-300 hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {tCta("bookTable")}
          </Link>
        </div>
      </motion.section>
    </>
  );
}
