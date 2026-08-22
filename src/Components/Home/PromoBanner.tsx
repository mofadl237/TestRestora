"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useGetOffersQuery } from "@/src/store/api/publicApi";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Percent, Timer, ArrowRight, Check } from "lucide-react";
import type { IApiOffer } from "@/src/store/api/types";

function formatEndsAt(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

const EASE = [0.22, 1, 0.36, 1] as const;

export function PromoBanner() {
  const locale = useLocale();
  const t = useTranslations("home.promoBanner");
  const { data: offers = [] } = useGetOffersQuery({ locale });
  const [copied, setCopied] = useState(false);

  // Find the top order-level promo offer (percentage or fixed, no products).
  const promoOffer: IApiOffer | undefined = offers.find(
    (o) =>
      (o.type === "percentage" || o.type === "fixed") &&
      o.products.length === 0,
  );

  const hasCode = !!promoOffer?.name && /^[A-Z0-9]{3,}$/i.test(promoOffer.name);

  const handleCopy = useCallback(() => {
    if (!hasCode || !promoOffer) return;
    navigator.clipboard.writeText(promoOffer.name).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [hasCode, promoOffer]);

  if (!promoOffer) return null;

  const endsLabel = formatEndsAt(promoOffer.endsAt, locale);

  return (
    <section className="px-4 md:px-6 lg:px-12 py-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10"
      >
        {/* Background image if available */}
        {promoOffer.image && (
          <div className="absolute inset-0 opacity-15">
            <Image
              src={promoOffer.image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              priority={false}
            />
          </div>
        )}

        <div className="relative flex flex-col items-center gap-4 px-6 py-6 text-center sm:flex-row sm:text-start md:px-10 md:py-8">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Percent className="h-6 w-6 text-primary" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("eyebrow")}
            </p>
            <h3 className="font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {promoOffer.name}
            </h3>
            {promoOffer.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                {promoOffer.description}
              </p>
            )}
            {endsLabel && (
              <p className="mt-1.5 flex items-center justify-center gap-1 text-xs text-muted-foreground sm:justify-start">
                <Timer className="h-3 w-3" aria-hidden />
                Ends {endsLabel}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2.5">
            {hasCode && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-background/80 px-3.5 py-2 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-accent" />
                    {t("copied")}
                  </>
                ) : (
                  <>
                    <span className="font-mono tracking-wider">
                      {promoOffer.name}
                    </span>
                    {t("copyCode")}
                  </>
                )}
              </button>
            )}
            <Link
              href={`/${locale}/menu`}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              {t("shopNow")}
              <ArrowRight
                className="h-3.5 w-3.5 rtl:rotate-180"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
