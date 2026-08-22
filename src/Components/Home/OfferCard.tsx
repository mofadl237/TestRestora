"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import {
  Percent,
  Tag,
  Gift,
  Package,
  UtensilsCrossed,
  Baby,
  Users,
} from "lucide-react";
import type { IApiOffer } from "@/src/store/api/types";
import { OfferAddToCartDialog } from "@/src/Components/Cart/OfferAddToCartDialog";
import {
  calculateOfferPricing,
  formatOfferPrice,
  logOfferPricing,
} from "@/src/lib/offerPricing";

const EASE = [0.22, 1, 0.36, 1] as const;

function formatEndsAt(iso: string | null, locale: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

const OFFER_TYPE_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    accentColor: string;
  }
> = {
  percentage: {
    icon: Percent,
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    accentColor: "text-amber-500",
  },
  fixed: {
    icon: Tag,
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    accentColor: "text-emerald-500",
  },
  bogo: {
    icon: Gift,
    gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
    accentColor: "text-violet-500",
  },
  bundle: {
    icon: Package,
    gradient: "from-sky-500/20 via-blue-500/10 to-transparent",
    accentColor: "text-sky-500",
  },
  meal_deal: {
    icon: UtensilsCrossed,
    gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
    accentColor: "text-rose-500",
  },
  family_meal: {
    icon: Users,
    gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
    accentColor: "text-orange-500",
  },
  kids_meal: {
    icon: Baby,
    gradient: "from-cyan-500/20 via-teal-500/10 to-transparent",
    accentColor: "text-cyan-500",
  },
};

interface OfferCardProps {
  offer: IApiOffer;
  index: number;
}

export function PremiumOfferCard({ offer, index }: OfferCardProps) {
  const t = useTranslations("offers");
  const locale = useLocale();
  const ends = formatEndsAt(offer.endsAt, locale);

  const [dialogOpen, setDialogOpen] = useState(false);

  const typeConfig = OFFER_TYPE_CONFIG[offer.type] ?? OFFER_TYPE_CONFIG.percentage;
  const TypeIcon = typeConfig.icon;

  const pricing = calculateOfferPricing(offer);
  logOfferPricing(offer, pricing);

  const cfg = (offer.config ?? {}) as {
    buyQty?: number;
    getQty?: number;
    bundlePrice?: number;
  };

  const renderValueDisplay = () => {
    switch (offer.type) {
      case "percentage":
        return (
          <div className="flex flex-col items-center justify-center">
            <span className={`text-4xl font-black tracking-tighter ${typeConfig.accentColor}`}>
              {offer.value}%
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
              off
            </span>
          </div>
        );
      case "fixed":
        return (
          <div className="flex flex-col items-center justify-center">
            <span className={`text-4xl font-black tracking-tighter ${typeConfig.accentColor}`}>
              {offer.value}
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
              off
            </span>
          </div>
        );
      case "bogo":
        return (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-muted-foreground">Buy {cfg.buyQty ?? 1}</span>
              <span className={`text-lg font-black ${typeConfig.accentColor}`}>Get {cfg.getQty ?? 1}</span>
            </div>
          </div>
        );
      case "bundle":
      case "meal_deal":
      case "family_meal":
      case "kids_meal":
        return (
          <div className="flex flex-col items-center justify-center">
            {cfg.bundlePrice && (
              <span className={`text-2xl font-black tracking-tight ${typeConfig.accentColor}`}>
                {cfg.bundlePrice}
              </span>
            )}
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground/70">
              {offer.type === "bundle" ? "bundle price" : offer.type.replace("_", " ")}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: 0.9,
          ease: EASE,
          delay: Math.min(index * 0.08, 0.32),
        }}
        onClick={() => setDialogOpen(true)}
        className="group relative flex w-[300px] min-w-[300px] snap-start flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-[border-color,box-shadow] duration-300 hover:border-border hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.25)] sm:w-[320px] sm:min-w-[320px] cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setDialogOpen(true);
          }
        }}
        aria-label={t("view")}
      >
        {/* Top accent gradient */}
        <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${typeConfig.gradient}`} />

        {/* Header area with value display */}
        <div className="relative flex items-center justify-center px-5 pt-6 pb-4">
          {/* Background decoration */}
          <div className={`absolute inset-0 bg-gradient-to-b ${typeConfig.gradient} opacity-30`} />

          {/* Type icon */}
          <div className="absolute right-4 top-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm ${typeConfig.accentColor}`}>
              <TypeIcon className="h-4 w-4" />
            </div>
          </div>

          {/* Value display */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            {renderValueDisplay()}
          </div>
        </div>

        {/* Image */}
        {offer.image && (
          <div className="relative mx-4 -mt-1 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
            <Image
              src={offer.image}
              alt={offer.name}
              width={600}
              height={338}
              unoptimized
              className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, var(--color-card) 0%, transparent 40%)",
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold leading-tight text-foreground">
              {offer.name}
            </h3>
            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeConfig.accentColor} bg-background/80 border border-current/10`}>
              {offer.type.replace("_", " ")}
            </span>
          </div>

          {offer.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {offer.description}
            </p>
          )}

          {/* Pricing block — premium hierarchy */}
          <div className="mt-auto rounded-xl border border-border/50 bg-background/50 p-3 space-y-1.5">
            {pricing.discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("originalPrice")}</span>
                <span className="text-muted-foreground line-through tabular-nums">
                  {formatOfferPrice(pricing.originalTotal)}
                </span>
              </div>
            )}
            {pricing.discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{t("youSave")}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                  −{formatOfferPrice(pricing.discountAmount)}
                </span>
              </div>
            )}
            <div className="border-t border-border/50 pt-1.5 flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">{t("offerPrice")}</span>
              <span className="text-lg font-black text-primary tabular-nums">
                {formatOfferPrice(pricing.finalTotal)}
              </span>
            </div>
          </div>

          {/* Products list */}
          {offer.products.length > 0 && (
            <div className="pt-1">
              <p className="text-xs font-medium text-muted-foreground">
                {offer.products
                  .slice(0, 3)
                  .map((p) => p.product.name)
                  .filter(Boolean)
                  .join(" · ")}
                {offer.products.length > 3 && (
                  <span className="text-muted-foreground/60">
                    {" "}+{offer.products.length - 3} more
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Ends at */}
          {ends && (
            <p className="text-[11px] font-medium text-muted-foreground">
              {t("endsAt", { date: ends })}
            </p>
          )}

          {/* View offer CTA */}
          <button
            type="button"
            className="mt-1 w-full rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary transition-[background-color] duration-200 hover:bg-primary/20"
          >
            {t("view")}
          </button>
        </div>
      </motion.article>

      {/* Offer Details + Add to Cart Dialog */}
      <OfferAddToCartDialog
        offer={offer}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
