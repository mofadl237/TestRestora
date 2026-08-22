"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/src/i18n/routing";
import {
  ChevronRight,
  Calendar,
  Hash,
  ShoppingBag,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import type { IOrderSummaryRow as OrderSummary } from "@/src/store/api/types";
import { formattePrice } from "@/lib/utils";
import { StatusBadge } from "../Order/StatusBadge";
import { itemVariants } from "../Order/OrderAnimations";

interface IProps {
  order: OrderSummary;
  isCompleted?: boolean;
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function OrderCard({ order, isCompleted }: IProps) {
  const t = useTranslations("trackOrder");
  // Extract a short address (e.g., first segment before comma, or first 20 chars)
  const shortAddress = order.deliveryAddress.split(",")[0].substring(0, 25);

  return (
    <motion.div
      variants={itemVariants}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md ${
        isCompleted
          ? "border-emerald-500/20 bg-muted/30 opacity-95 hover:border-emerald-500/40"
          : "border-border hover:border-primary/40"
      }`}
      style={{
        boxShadow:
          "0 1px 6px 0 oklch(0.62 0.2 50 / 0.05), 0 1px 2px 0 oklch(0.215 0.017 28 / 0.02)",
      }}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
          isCompleted
            ? "bg-emerald-500/60"
            : "bg-gradient-to-b from-primary via-primary/60 to-primary/20"
        }`}
      />

      <div className="flex-1 p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest ${
                isCompleted
                  ? "text-emerald-600/70 dark:text-emerald-400/70"
                  : "text-muted-foreground"
              }`}
            >
              <Hash
                className={`h-3 w-3 ${isCompleted ? "text-emerald-500" : "text-primary"}`}
              />
              {t("order")}
            </div>
            <p className="mt-1 font-mono text-lg font-bold tracking-tight text-foreground">
              {order.orderNumber}
            </p>
          </div>
          {isCompleted ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("completed")}
            </span>
          ) : (
            <StatusBadge status={order.status} size="sm" />
          )}
        </div>

        <div className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border/50 py-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {t("date")}
            </div>
            <p className="text-sm font-medium text-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {t("address")}
            </div>
            <p
              className="truncate text-sm font-medium text-foreground"
              title={order.deliveryAddress}
            >
              {shortAddress}
            </p>
          </div>
          <div className="col-span-2">
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShoppingBag className="h-3.5 w-3.5" />
              {t("items")}
            </div>
            <p className="text-sm font-medium text-foreground">
              {t("itemCount", { count: order.itemCount })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="mt-0.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("total")}
          </p>
          <p className="text-lg font-bold text-primary">
            {formattePrice(order.totalPrice)}
          </p>
        </div>
      </div>

      <div className="border-t border-border bg-muted/20 p-3">
        <Link
          href={`/orders/${order.id}`}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-semibold text-foreground shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isCompleted
              ? "hover:border-emerald-500 hover:bg-emerald-500 hover:text-white"
              : "hover:border-primary hover:bg-primary hover:text-primary-foreground"
          }`}
        >
          {t("viewDetails")}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
