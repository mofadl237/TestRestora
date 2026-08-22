"use client";

import { motion } from "framer-motion";
import { Calendar, Hash, Utensils } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/currency";
import { itemVariants } from "./OrderAnimations";
import { StatusBadge } from "./StatusBadge";

interface IProps {
  orderNumber: string;
  orderType?: string;
  tableNumber?: string | null;
  status: string;
  createdAt: string;
  totalPrice: number;
  currencyCode?: string | null;
}

const formatDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatPrice = (n: number, currencyCode?: string | null) =>
  formatMoney(n, currencyCode ?? undefined);

export function OrderHeader({
  orderNumber,
  orderType = "DELIVERY",
  tableNumber,
  status,
  createdAt,
  totalPrice,
  currencyCode,
}: IProps) {
  const t = useTranslations("order");
  const locale = useLocale();
  const isDineIn = orderType === "DINE_IN";

  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      style={{
        boxShadow:
          "0 2px 16px 0 oklch(0.62 0.2 50 / 0.07), 0 1px 3px 0 oklch(0.215 0.017 28 / 0.04)",
      }}
    >
      {/* Top accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-primary/20" />

      <div className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left — order number + date */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Hash className="h-4 w-4 text-primary" aria-hidden />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("orderNumber")}
            </p>
            {isDineIn ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Utensils className="h-3 w-3" aria-hidden />
                {t("typeDineIn")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                {t("typeDelivery")}
              </span>
            )}
          </div>
          <h1 className="mt-0.5 font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {orderNumber}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {formatDate(createdAt, locale)}
            </span>
            {isDineIn && tableNumber && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-semibold text-foreground">
                <Utensils className="h-3 w-3" aria-hidden />
                {t("table", { number: tableNumber })}
              </span>
            )}
          </div>
        </div>

        {/* Right — status + total */}
        <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-end">
          <StatusBadge status={status} />
          <div className={locale === "ar" ? "text-left" : "text-right"}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("grandTotal")}
            </p>
            <p className="text-2xl font-bold tracking-tight text-primary">
              {formatPrice(totalPrice, currencyCode)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
