"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FinalCta() {
  const t = useTranslations("home.cta");

  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-36">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10 bg-primary/[0.03]" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />
      </div>

      <div className="mx-auto max-w-3xl px-4 text-center md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="flex flex-col items-center gap-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            <span className="mr-2">&mdash;</span>
            {t("kicker")}
            <span className="ml-2">&mdash;</span>
          </p>

          <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {t("title")}
          </h2>

          <p className="max-w-lg text-lg text-muted-foreground">
            {t("description")}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row pt-4">
            <Link
              href="/menu"
              className={cn(
                buttonVariants({ size: "lg" }),
                "font-semibold px-8",
              )}
            >
              {t("viewMenu")}
            </Link>
            <Link
              href="/reservations"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "font-semibold px-8",
              )}
            >
              {t("bookTable")}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
