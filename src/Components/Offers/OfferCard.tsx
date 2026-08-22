"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Sparkles } from "lucide-react";

import type { IApiOffer } from "@/src/store/api/types";

type PublicOffer = IApiOffer;

const EASE = [0.22, 1, 0.36, 1] as const;

function formatEndsAt(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(date);
}

export function OfferCard({ offer, index }: { offer: PublicOffer; index: number }) {
  const t = useTranslations("offers");
  const locale = useLocale();
  const ends = formatEndsAt(offer.endsAt, locale);

  const cfg = (offer.config ?? {}) as { buyQty?: number; getQty?: number };
  const badge = t(`types.${offer.type}`, {
    value: String(offer.value),
    buy: String(cfg.buyQty ?? 1),
    get: String(cfg.getQty ?? 1),
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, ease: EASE, delay: Math.min(index * 0.08, 0.32) }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {offer.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={offer.image}
            alt={offer.name}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Sparkles className="size-10" aria-hidden="true" />
          </div>
        )}
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-xs font-semibold uppercase tracking-wider text-white">
          {badge}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-bold text-foreground">{offer.name}</h3>
        {offer.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
        )}
        {offer.products.length > 0 && (
          <p className="mt-auto pt-2 text-xs text-muted-foreground">
            {offer.products
              .slice(0, 3)
              .map((p) => p.product.name)
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {ends && (
          <p className="text-[11px] font-medium text-muted-foreground">
            {t("endsAt", { date: ends })}
          </p>
        )}
      </div>
    </motion.article>
  );
}
