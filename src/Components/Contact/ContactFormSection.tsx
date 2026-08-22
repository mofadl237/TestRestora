"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ContactForm } from "./ContactForm";
import { ContactSocial } from "./ContactSocial";
import { OpeningHours } from "./OpeningHours";
import { containerVariants, itemVariants } from "./animations";

export function ContactFormSection() {
  const t = useTranslations("contact.form");

  return (
    <section id="message" className="marginSection scroll-mt-28">
      <motion.div
        className="mb-12 max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.p
          className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground"
          variants={itemVariants}
        >
          <span className="mr-2 text-primary">—</span>
          {t("kicker")}
          <span className="ml-2 text-primary">—</span>
        </motion.p>
        <motion.h2
          className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
          variants={itemVariants}
        >
          {t("title")}
        </motion.h2>
        <motion.p
          className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground"
          variants={itemVariants}
        >
          {t("description")}
        </motion.p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-6 lg:grid-cols-5"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div className="lg:col-span-3" variants={itemVariants}>
          <ContactForm />
        </motion.div>
        <div className="flex flex-col gap-6 lg:col-span-2">
          <OpeningHours />
          <ContactSocial />
        </div>
      </motion.div>
    </section>
  );
}
