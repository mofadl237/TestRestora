"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPin, Timer } from "lucide-react";
import { formatMoney } from "@/lib/currency";
import { itemVariants } from "./OrderAnimations";
import type { IDeliveryZoneSnapshot } from "./types";

interface IProps {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalPrice: number;
  deliveryZone: IDeliveryZoneSnapshot | null;
  currencyCode?: string | null;
  orderType?: string;
}

const formatPrice = (n: number, currencyCode?: string | null) =>
  formatMoney(n, currencyCode ?? undefined);

interface LineProps {
  label: string;
  value: string;
  muted?: boolean;
  highlight?: boolean;
  negative?: boolean;
}

function Line({ label, value, muted, highlight, negative }: LineProps) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${muted ? "opacity-70" : ""}`}
    >
      <span
        className={`text-sm ${highlight ? "font-bold text-foreground" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-semibold tabular-nums ${
          highlight
            ? "text-xl font-bold text-primary"
            : negative
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function OrderPriceSummary({
  subtotal,
  deliveryFee,
  tax,
  discount,
  totalPrice,
  deliveryZone,
  currencyCode,
  orderType = "DELIVERY",
}: IProps) {
  const t = useTranslations("order");
  const isDineIn = orderType === "DINE_IN";

  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          {t("priceSummary")}
        </h3>
      </div>

      <div className="divide-y divide-border/40 px-5">
        <Line label={t("subtotal")} value={formatPrice(subtotal, currencyCode)} />

        {!isDineIn && deliveryZone && (
          <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 opacity-80">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {t("deliveryZone")}
            </span>
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {deliveryZone.name}
              {deliveryZone.estimatedTimeMin != null &&
                deliveryZone.estimatedTimeMax != null && (
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Timer className="h-3 w-3" aria-hidden="true" />
                    {deliveryZone.estimatedTimeMin}–
                    {deliveryZone.estimatedTimeMax}
                    {t("etaMin")}
                  </span>
                )}
            </span>
          </div>
        )}

        {!isDineIn && (
          <Line
            label={t("deliveryFee")}
            value={formatPrice(deliveryFee, currencyCode)}
          />
        )}
        {tax > 0 && <Line label={t("tax")} value={formatPrice(tax, currencyCode)} />}
        {discount > 0 && (
          <Line
            label={t("discount")}
            value={`−${formatPrice(discount, currencyCode)}`}
            negative
          />
        )}
      </div>

      {/* Grand total */}
      <div className="border-t border-border bg-primary/4 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-foreground">
            {t("grandTotal")}
          </span>
          <span className="text-2xl font-bold tracking-tight text-primary">
            {formatPrice(totalPrice, currencyCode)}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {t("vatIncluded")}
        </p>
      </div>
    </motion.div>
  );
}
