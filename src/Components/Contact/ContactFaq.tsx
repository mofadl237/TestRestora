"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageCircle, Phone } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { usePublicSettings } from "../Footer/data";
import { FaqItem } from "./FaqItem";
import { containerVariants, itemVariants } from "./animations";

interface Faq {
  q: string;
  a: string;
}

export function ContactFaq() {
  const t = useTranslations("contact.faq");
  const faqs = t.raw("items") as Faq[];
  const publicSettings = usePublicSettings();
  const contact = publicSettings?.contact;
  const phone = contact?.phone?.trim();
  const whatsapp = contact?.whatsapp?.trim();

  return (
    <section className="marginSection">
      <motion.div
        className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center"
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
          className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
          variants={itemVariants}
        >
          {t("title")}
        </motion.h2>
        <motion.p
          className="max-w-xl text-base leading-relaxed text-muted-foreground"
          variants={itemVariants}
        >
          {t("description")}
        </motion.p>
      </motion.div>

      <motion.div
        className="mx-auto max-w-3xl space-y-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {faqs.map((faq, index) => (
          <motion.div key={index} variants={itemVariants}>
            <FaqItem question={faq.q} answer={faq.a} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-5 rounded-2xl border border-border/70 bg-card p-6 text-center shadow-[0_2px_8px_0_oklch(0.493_0.128_33_/_0.05)] sm:flex-row sm:justify-between sm:px-8 sm:text-left"
        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h3 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
            {t("stillTitle")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("stillText")}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={phone ? `tel:${phone}` : "tel:+15550148820"}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            {t("call")}
          </Link>
          <Link
            href={
              whatsapp
                ? `https://wa.me/${whatsapp.replace(/^\+/, "")}`
                : "https://wa.me/15550148820"
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-card px-7 text-sm font-semibold uppercase tracking-widest text-foreground transition-colors duration-300 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <MessageCircle className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
            {t("whatsapp")}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
