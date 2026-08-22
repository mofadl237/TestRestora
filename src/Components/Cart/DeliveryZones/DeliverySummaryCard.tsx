"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Gift, MapPin, ShoppingBasket, Timer, Truck } from "lucide-react";

import { formattePrice } from "@/lib/utils";
import {
  deliverySummaryVariants,
  freeBadgeVariants,
  summaryRowVariants,
  summaryRowsVariants,
} from "./DeliveryZonesAnimations";
import type { IDeliveryZoneCardData } from "./types";

interface IProps {
  zone: IDeliveryZoneCardData;
  freeDelivery: boolean;
  freeDeliveryThreshold?: number;
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const Row = ({ icon, label, value }: RowProps) => (
  <motion.div
    variants={summaryRowVariants}
    className="flex items-center justify-between gap-3 px-5 py-3"
  >
    <dt className="flex min-w-0 items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
      <span className="text-primary" aria-hidden="true">
        {icon}
      </span>
      {label}
    </dt>
    <dd className="min-w-0 shrink-0 text-end text-sm font-bold text-foreground">
      {value}
    </dd>
  </motion.div>
);

/**
 * "Delivering to …" summary card shown right after a zone is selected.
 * Crossfades smoothly when the selection changes.
 */
export function DeliverySummaryCard({
  zone,
  freeDelivery,
  freeDeliveryThreshold = 0,
}: IProps) {
  const t = useTranslations("cart");

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={zone.id}
        variants={deliverySummaryVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="overflow-hidden rounded-2xl border border-primary/20 bg-primary/5"
      >
        <div className="flex items-center gap-3 px-5 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Truck className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              {t("deliveringTo")}
            </p>
            <p className="truncate font-heading text-sm font-bold text-foreground">
              {zone.name}
            </p>
          </div>
        </div>

        <motion.dl
          variants={summaryRowsVariants}
          initial="hidden"
          animate="visible"
          className="divide-y divide-primary/10 border-t border-primary/10"
        >
          <Row
            icon={<MapPin className="size-3.5" />}
            label={t("deliveryZone")}
            value={zone.name}
          />

          <Row
            icon={<Truck className="size-3.5" />}
            label={t("deliveryFee")}
            value={
              <AnimatePresence mode="wait" initial={false}>
                {freeDelivery ? (
                  <motion.span
                    key="free"
                    variants={freeBadgeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="font-bold text-accent"
                  >
                    {t("freeDeliveryNow")}
                  </motion.span>
                ) : (
                  <motion.span
                    key="price"
                    variants={freeBadgeVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="font-bold text-foreground"
                  >
                    {formattePrice(zone.deliveryPrice)}
                  </motion.span>
                )}
              </AnimatePresence>
            }
          />

          <Row
            icon={<Timer className="size-3.5" />}
            label={t("estimatedTime")}
            value={t("estimatedTimeRange", {
              min: zone.estimatedTimeMin,
              max: zone.estimatedTimeMax,
            })}
          />

          {zone.minimumOrder > 0 && (
            <Row
              icon={<ShoppingBasket className="size-3.5" />}
              label={t("minimumOrderLabel")}
              value={formattePrice(zone.minimumOrder)}
            />
          )}
        </motion.dl>

        {freeDeliveryThreshold > 0 && (
          <motion.div
            variants={summaryRowVariants}
            className="flex items-center justify-center gap-2 border-t border-primary/10 bg-primary/10 px-5 py-3"
          >
            <Gift className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate text-xs font-semibold text-foreground">
              {t("freeDeliveryOver", {
                amount: formattePrice(freeDeliveryThreshold),
              })}
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
