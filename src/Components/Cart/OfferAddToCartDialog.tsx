"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ShoppingCart, Check, Flame, Tag, Gift, Package, UtensilsCrossed, Baby, Users } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { addOfferGroup, type ICartOfferGroup } from "@/src/store/features/CartSlice";
import type { IApiOffer } from "@/src/store/api/types";
import { toast } from "@/lib/toast";
import {
  calculateOfferPricing,
  formatOfferPrice,
  logOfferPricing,
  type OfferProductLine,
} from "@/src/lib/offerPricing";

const EASE = [0.22, 1, 0.36, 1] as const;

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

const ROLE_LABELS: Record<string, { en: string; ar: string }> = {
  trigger: { en: "TRIGGER", ar: "مُشغِّل" },
  reward: { en: "REWARD", ar: "مُكافأة" },
  included: { en: "INCLUDED", ar: "مشمول" },
};

interface OfferAddToCartDialogProps {
  offer: IApiOffer;
  open: boolean;
  onClose: () => void;
}

function ProductRow({
  line,
  locale,
}: {
  line: OfferProductLine;
  locale?: string;
}) {
  const tOffers = useTranslations("offers");
  const roleLabel =
    ROLE_LABELS[line.role]?.[locale === "ar" ? "ar" : "en"] ?? line.role.toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-3">
      {line.productImage ? (
        <Image
          src={line.productImage}
          alt={line.productName}
          width={44}
          height={44}
          unoptimized
          className="h-11 w-11 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="h-11 w-11 shrink-0 rounded-lg bg-muted" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {line.productName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {roleLabel}
          </span>
          {line.role === "reward" && line.discountAmount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold text-violet-500">
              <Flame className="h-2.5 w-2.5" />
              {tOffers("free")}
            </span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        {line.discountAmount > 0 ? (
          <>
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              {formatOfferPrice(line.basePrice)}
            </p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {line.finalPrice === 0
                ? tOffers("free")
                : formatOfferPrice(line.finalPrice)}
            </p>
          </>
        ) : (
          <p className="text-sm font-bold text-foreground tabular-nums">
            {formatOfferPrice(line.basePrice)}
          </p>
        )}
      </div>
    </div>
  );
}

export function OfferAddToCartDialog({
  offer,
  open,
  onClose,
}: OfferAddToCartDialogProps) {
  const dispatch = useDispatch();
  const t = useTranslations("offers");
  const tCommon = useTranslations("common");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const pricing = calculateOfferPricing(offer);
  logOfferPricing(offer, pricing);

  const TypeIcon = OFFER_TYPE_ICONS[offer.type] ?? Tag;
  const typeColor = OFFER_TYPE_COLORS[offer.type] ?? "text-primary";

  const handleAdd = () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const cartOfferGroup: ICartOfferGroup = {
        id: crypto.randomUUID(),
        offerId: offer.id,
        offerType: offer.type,
        offerName: offer.name,
        offerDescription: offer.description,
        offerImage: offer.image,
        products: pricing.breakdown.map((line) => ({
          productId: line.productId,
          productName: line.productName,
          productImage: line.productImage,
          basePrice: line.basePrice,
          role: line.role,
        })),
        originalPrice: pricing.originalTotal,
        discountAmount: pricing.discountAmount,
        finalPrice: pricing.finalTotal,
        quantity: 1,
        config: offer.config,
      };

      dispatch(addOfferGroup(cartOfferGroup));

      setSuccess(true);
      window.setTimeout(() => {
        onClose();
        toast.success(t("addedToCart", { name: offer.name }));
      }, 600);
    } catch {
      toast.error(tCommon("addedToCartError"));
    } finally {
      window.setTimeout(() => {
        setSubmitting(false);
        setSuccess(false);
      }, 800);
    }
  };

  const renderValueBadge = () => {
    switch (offer.type) {
      case "percentage":
        return (
          <span className="text-5xl font-black tracking-tighter text-amber-500">
            {offer.value}%
          </span>
        );
      case "fixed":
        return (
          <span className="text-5xl font-black tracking-tighter text-emerald-500">
            {offer.value}
          </span>
        );
      case "bogo": {
        const cfg = (offer.config ?? {}) as { buyQty?: number; getQty?: number };
        return (
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-muted-foreground">
              Buy {cfg.buyQty ?? 1}
            </span>
            <span className="text-2xl font-black text-violet-500">
              Get {cfg.getQty ?? 1}
            </span>
          </div>
        );
      }
      case "bundle":
      case "meal_deal":
      case "family_meal":
      case "kids_meal": {
        const cfg = (offer.config ?? {}) as { bundlePrice?: number };
        return cfg.bundlePrice ? (
          <span className="text-4xl font-black tracking-tight text-sky-500">
            {formatOfferPrice(cfg.bundlePrice)}
          </span>
        ) : null;
      }
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="fixed top-1/2 left-1/2 flex max-h-[min(90dvh,44rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-2xl border-border/60 bg-background p-0 shadow-2xl ring-1 ring-border/40">
        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm ${typeColor}`}>
              <TypeIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{offer.name}</h2>
              <span className={`text-xs font-semibold uppercase tracking-wider ${typeColor}`}>
                {offer.type.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <motion.form
          id="offer-add-form"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:var(--border)_transparent] scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80 [&::-webkit-scrollbar-track]:bg-transparent"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <div className="space-y-4 px-5 py-3">
            {/* Offer image */}
            {offer.image && (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
                }}
                className="relative overflow-hidden rounded-xl bg-muted"
              >
                <Image
                  src={offer.image}
                  alt={offer.name}
                  width={600}
                  height={180}
                  unoptimized
                  className="w-full object-cover"
                  style={{ maxHeight: "180px" }}
                />
              </motion.div>
            )}

            {/* Type-specific value badge */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
              }}
              className="flex items-center justify-center py-3"
            >
              {renderValueBadge()}
            </motion.div>

            {/* Description */}
            {offer.description && (
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 6 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
                }}
                className="text-sm leading-relaxed text-muted-foreground"
              >
                {offer.description}
              </motion.p>
            )}

            {/* Product breakdown */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
              }}
              className="space-y-2"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("includedProducts")}
              </p>
              {pricing.breakdown.map((line) => (
                <ProductRow key={line.productId} line={line} />
              ))}
            </motion.div>

            {/* Pricing breakdown — premium hierarchy */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
              }}
              className="rounded-xl border border-border/60 bg-card/50 p-4 space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("originalPrice")}</span>
                <span className="font-semibold text-muted-foreground line-through tabular-nums">
                  {formatOfferPrice(pricing.originalTotal)}
                </span>
              </div>
              {pricing.discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {t("youSave")}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                    −{formatOfferPrice(pricing.discountAmount)}
                  </span>
                </div>
              )}
              {pricing.savingsPercent > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground text-xs">{t("savingsPercent")}</span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {pricing.savingsPercent}%
                  </span>
                </div>
              )}
              <div className="border-t border-border/60 pt-2 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">{t("offerPrice")}</span>
                <span className="text-2xl font-black text-primary tabular-nums">
                  {formatOfferPrice(pricing.finalTotal)}
                </span>
              </div>
            </motion.div>
          </div>
        </motion.form>

        {/* Footer CTA */}
        <div className="border-t border-border/60 px-5 py-4">
          <button
            type="submit"
            form="offer-add-form"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
          >
            <AnimatePresence mode="wait" initial={false}>
              {success ? (
                <motion.span
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {t("added")}
                </motion.span>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t("addOfferToCart")}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
