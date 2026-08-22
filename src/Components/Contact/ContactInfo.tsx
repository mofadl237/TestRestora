"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Link } from "@/src/i18n/routing";
import { usePublicSettings } from "../Footer/data";
import { containerVariants, itemVariants } from "./animations";

interface InfoCard {
  label: string;
  value: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function ContactInfo() {
  const t = useTranslations("contact.info");
  const publicSettings = usePublicSettings();
  const contact = publicSettings?.contact;

  const cards: InfoCard[] = [
    {
      label: t("addressLabel"),
      value: contact?.address?.trim() || t("addressValue"),
      href: contact?.googleMaps?.trim() || undefined,
      icon: MapPin,
    },
    {
      label: t("phoneLabel"),
      value: contact?.phone?.trim() || t("phoneValue"),
      href: contact?.phone ? `tel:${contact.phone.trim()}` : undefined,
      icon: Phone,
    },
    {
      label: t("whatsappLabel"),
      value: contact?.whatsapp?.trim() || t("whatsappValue"),
      href: contact?.whatsapp
        ? `https://wa.me/${contact.whatsapp.replace(/^\+/, "")}`
        : undefined,
      icon: MessageCircle,
    },
    {
      label: t("emailLabel"),
      value: contact?.email?.trim() || t("emailValue"),
      href: contact?.email ? `mailto:${contact.email.trim()}` : undefined,
      icon: Mail,
    },
  ];

  return (
    <motion.section
      className="marginSection"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div
        className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-4 text-center"
        variants={containerVariants}
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
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        variants={containerVariants}
      >
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {card.label}
                {card.href && (
                  <ArrowUpRight
                    className="h-3.5 w-3.5 text-primary rtl:-scale-x-100"
                    aria-hidden="true"
                  />
                )}
              </p>
              <p className="mt-2 break-words text-base font-medium text-foreground">
                {card.value}
              </p>
            </>
          );

          return (
            <motion.div key={card.label} variants={itemVariants}>
              {card.href ? (
                <Link
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noreferrer" : undefined}
                  className="group flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_8px_0_oklch(0.62_0.2_50_/_0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_45px_-20px_oklch(0.62_0.2_50_/_0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_8px_0_oklch(0.62_0.2_50_/_0.05)]">
                  {content}
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
