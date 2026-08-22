"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import { itemVariants, EASE } from "./OrderAnimations";

interface IProps {
  customerName: string;
  orderNumber: string;
  status: string;
  orderType?: string;
  tableNumber?: string | null;
}

export function OrderSuccessBanner({
  customerName,
  orderNumber,
  status,
  orderType = "DELIVERY",
  tableNumber,
}: IProps) {
  const t = useTranslations("order");
  const isDineIn = orderType === "DINE_IN";

  const baseKey = `order.success.nextSteps.${status}`;
  const dineInKey = `order.success.dineInNextSteps.${status}`;
  const hasDineInOverride = isDineIn && t.has(dineInKey);
  const nextStep = t(hasDineInOverride ? dineInKey : baseKey);

  return (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/6 px-6 py-8 text-center sm:py-10"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in oklch, var(--primary) 8%, var(--card)) 0%, var(--card) 100%)",
      }}
    >
      {/* Blurred glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in oklch, var(--primary) 12%, transparent), transparent)",
        }}
      />

      {/* Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/12"
      >
        <CheckCircle2 className="h-8 w-8 text-primary" aria-hidden />
      </motion.div>

      {/* Heading */}
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("success.title", { name: customerName })}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {isDineIn ? t("success.dineInSubtitle") : t("success.subtitle")}
      </p>

      {/* Order number + table chip */}
      <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 font-mono text-lg font-bold tracking-tight text-primary">
        #{orderNumber}
        {isDineIn && tableNumber && (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
            <Utensils className="h-3.5 w-3.5" aria-hidden />
            {t("table", { number: tableNumber })}
          </span>
        )}
      </p>

      {/* Next step */}
      <div className="mt-5 flex items-start justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p>{nextStep}</p>
      </div>
    </motion.div>
  );
}
