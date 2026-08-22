"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Flame, Trash2, Minus, Plus, Tag, Gift, Package, UtensilsCrossed, Baby, Users } from "lucide-react";
import { type ICartOfferGroup } from "@/src/store/features/CartSlice";
import { formatOfferPrice } from "@/src/lib/offerPricing";

const OFFER_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  percentage: Tag,
  fixed: Tag,
  bogo: Gift,
  bundle: Package,
  meal_deal: UtensilsCrossed,
  family_meal: Users,
  kids_meal: Baby,
};

const OFFER_TYPE_COLORS: Record<string, string> = {
  percentage: "text-amber-500",
  fixed: "text-emerald-500",
  bogo: "text-violet-500",
  bundle: "text-sky-500",
  meal_deal: "text-rose-500",
  family_meal: "text-orange-500",
  kids_meal: "text-cyan-500",
};

interface CartOfferGroupProps {
  group: ICartOfferGroup;
  onRemove: (id: string) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
}

export function CartOfferGroup({
  group,
  onRemove,
  onIncrease,
  onDecrease,
}: CartOfferGroupProps) {
  const t = useTranslations("cart");
  const tOffers = useTranslations("offers");

  const TypeIcon = OFFER_TYPE_ICONS[group.offerType] ?? Tag;
  const typeColor = OFFER_TYPE_COLORS[group.offerType] ?? "text-primary";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"
      style={{
        boxShadow:
          "0 1px 6px 0 oklch(0.62 0.2 50 / 0.06), 0 1px 2px 0 oklch(0.215 0.017 28 / 0.03)",
      }}
    >
      {/* Accent bar */}
      <div
        className="absolute start-0 top-0 h-full w-0.5 rounded-e-full bg-primary/30"
        aria-hidden
      />

      <div className="p-4 ps-5">
        {/* Offer header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Icon */}
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ${typeColor}`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              {/* Offer name + type badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-foreground truncate">
                  {group.offerName}
                </h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeColor} bg-background/80 border border-current/10`}>
                  {group.offerType.replace("_", " ")}
                </span>
              </div>
              {/* Products list */}
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {group.products
                  .map((p) => p.productName)
                  .filter(Boolean)
                  .join(" + ")}
              </p>
            </div>
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(group.id)}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t("removeItem", { name: group.offerName })}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Products with images */}
        <div className="mt-3 flex gap-2">
          {group.products.map((product) => (
            <div
              key={product.productId}
              className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-2 py-1.5"
            >
              {product.productImage ? (
                <Image
                  src={product.productImage}
                  alt={product.productName}
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8 rounded-md object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-md bg-muted" />
              )}
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate max-w-[100px]">
                  {product.productName}
                </p>
                {product.role === "reward" ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-violet-500">
                    <Flame className="h-2.5 w-2.5" />
                    {tOffers("free")}
                  </span>
                ) : (
                  <p className="text-[10px] font-semibold text-muted-foreground tabular-nums">
                    {formatOfferPrice(product.basePrice)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing breakdown — premium hierarchy */}
        <div className="mt-3 rounded-xl border border-border/50 bg-background/50 p-3 space-y-1">
          {group.originalPrice > group.finalPrice && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{tOffers("originalPrice")}</span>
              <span className="text-muted-foreground line-through tabular-nums">
                {formatOfferPrice(group.originalPrice)}
              </span>
            </div>
          )}
          {group.discountAmount > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {tOffers("youSave")}
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                −{formatOfferPrice(group.discountAmount)}
              </span>
            </div>
          )}
          <div className="border-t border-border/50 pt-1 flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">{tOffers("offerPrice")}</span>
            <span className="text-lg font-black text-primary tabular-nums">
              {formatOfferPrice(group.finalPrice)}
            </span>
          </div>
        </div>

        {/* Quantity controls */}
        <div className="mt-3 flex items-center justify-end">
          <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 px-1 py-1">
            <button
              onClick={() => onDecrease(group.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("decreaseItemQuantity", { name: group.offerName })}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums text-foreground">
              {group.quantity}
            </span>
            <button
              onClick={() => onIncrease(group.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("increaseItemQuantity", { name: group.offerName })}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
