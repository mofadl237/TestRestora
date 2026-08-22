"use client";

import { motion } from "framer-motion";
import { formattePrice } from "@/lib/utils";
import { summaryVariants } from "./CartAnimations";
import { Receipt, Truck, Tag, Percent, PercentCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { AnimatedPrice } from "@/src/Components/Shared/AnimatedPrice";
import type { ICartPromoCode } from "@/src/store/features/CartSlice";

interface IProps {
  subtotal: number;
  delivery: number;
  tax: number;
  discount: number;
  total: number;
  promoCode?: ICartPromoCode | null;
}

interface SummaryRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  valueClassName?: string;
  muted?: boolean;
}

const SummaryRow = ({
  label,
  value,
  icon,
  valueClassName = "",
  muted = false,
}: SummaryRowProps) => (
  <div
    className={`flex items-center justify-between py-2.5 ${muted ? "opacity-60" : ""}`}
  >
    <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {icon}
      {label}
    </span>
    <span className={`text-sm font-semibold text-foreground ${valueClassName}`}>
      {value}
    </span>
  </div>
);

const CartSummary = ({ subtotal, delivery, tax, discount, total, promoCode }: IProps) => {
  const t = useTranslations("cart");

  return (
    <motion.div
      variants={summaryVariants}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm"
      style={{
        boxShadow:
          "0 2px 12px 0 oklch(0.62 0.2 50 / 0.07), 0 1px 3px 0 oklch(0.215 0.017 28 / 0.04)",
      }}
    >
      {/* Header */}
      <div className="border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
          <Receipt className="h-4 w-4 text-primary" aria-hidden />
          {t("summary")}
        </h3>
      </div>

      {/* Rows */}
      <div className="px-5 py-1 divide-y divide-border/60">
        <SummaryRow
          label={t("subtotal")}
          value={<AnimatedPrice value={subtotal} format={formattePrice} />}
          icon={<span className="inline-block h-3.5 w-3.5" />}
        />
        <SummaryRow
          label={t("delivery")}
          value={
            delivery === 0 ? (
              t("free")
            ) : (
              <AnimatedPrice value={delivery} format={formattePrice} />
            )
          }
          icon={<Truck className="h-3.5 w-3.5" />}
          valueClassName={delivery === 0 ? "text-accent" : ""}
        />
        {tax > 0 && (
          <SummaryRow
            label={t("tax")}
            value={<AnimatedPrice value={tax} format={formattePrice} />}
            icon={<Percent className="h-3.5 w-3.5" />}
          />
        )}
        {discount > 0 && (
          <SummaryRow
            label={t("discount")}
            value={`−${formattePrice(discount)}`}
            icon={<Tag className="h-3.5 w-3.5" />}
            valueClassName="text-accent"
          />
        )}
        {promoCode && (
          <SummaryRow
            label={promoCode.code}
            value={
              promoCode.estimatedDiscount > 0
                ? `−${formattePrice(promoCode.estimatedDiscount)}`
                : t("promoCode.calculatedAtCheckout")
            }
            icon={<PercentCircle className="h-3.5 w-3.5" />}
            valueClassName="text-accent"
          />
        )}
      </div>

      {/* Grand Total */}
      <div className="mx-5 mb-5 mt-2 rounded-xl bg-primary/8 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            {t("grandTotal")}
          </span>
          <div className="text-end">
            <AnimatedPrice
              value={total}
              format={formattePrice}
              className="text-xl font-bold tracking-tight text-primary"
            />
            <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
              {t("vatIncluded")}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CartSummary;
