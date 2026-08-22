"use client";

import { useLocale, useTranslations } from "next-intl";

import { useGetOffersQuery } from "@/src/store/api/publicApi";
import { OfferCard } from "./OfferCard";

/**
 * Public Offers section — shown on the restaurant home page.
 *
 * Fetches only active, visible and currently-valid offers (expired,
 * disabled and scheduled-future offers never appear — filtered at the
 * server layer by the Public API). The section renders nothing when
 * there are no live offers, so the home page stays clean.
 */
export function PublicOffers() {
  const locale = useLocale();
  const t = useTranslations("mainSection.offers");
  const { data: offers = [] } = useGetOffersQuery({ locale });

  if (offers.length === 0) return null;

  return (
    <section className="py-12 md:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            <span className="mr-2 text-primary">—</span>
            {t("subTitle")}
            <span className="ml-2 text-primary">—</span>
          </p>
          <h2 className="font-bold tracking-tight text-foreground text-4xl sm:text-5xl md:text-6xl">
            {t("title")}
          </h2>
          <div
            className="mx-auto mt-5 h-px w-16"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--color-primary), transparent)",
            }}
          />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, index) => (
            <OfferCard key={offer.id} offer={offer} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
