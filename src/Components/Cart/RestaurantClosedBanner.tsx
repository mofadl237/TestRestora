"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Hourglass } from "lucide-react";

import {
  useGetAvailabilityQuery,
  useGetRestaurantQuery,
} from "@/src/store/api/publicApi";

interface IStatus {
  isOpenNow: boolean;
  status: string;
  nextOpeningAt: string | null;
  message: Record<string, string>;
  timeZone: string;
}

/**
 * Appears above the checkout when the restaurant is closed (per the Restora
 * schedule / closures / holidays exposed by the Public API). Deliberately
 * read-only — the order is also blocked server-side, this is the friendly
 * explanation.
 */
export function RestaurantClosedBanner({ onStatusChange }: { onStatusChange?: (open: boolean) => void }) {
  const locale = useLocale();
  const t = useTranslations("cart.closed");
  const { data: availability } = useGetAvailabilityQuery();
  const { data: settings } = useGetRestaurantQuery({ locale });

  const status: IStatus | null = availability
    ? {
        isOpenNow: availability.isOpenNow,
        status: availability.status,
        nextOpeningAt: availability.nextOpeningAt,
        message: availability.message,
        timeZone: settings?.timezone ?? "UTC",
      }
    : null;

  React.useEffect(() => {
    if (!availability) return;
    onStatusChange?.(availability.isOpenNow);
  }, [availability, onStatusChange]);

  const closed = status !== null && !status.isOpenNow;
  if (!closed) return null;

  const nextOpeningText = (() => {
    if (!status?.nextOpeningAt) return null;
    return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      timeZone: status.timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(status.nextOpeningAt));
  })();

  const customMessage = status?.message?.[locale]?.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      role="alert"
      className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400" aria-hidden="true">
          <Hourglass className="size-5" />
        </span>
        <div>
          <p className="font-heading text-sm font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400">
            {t("title")}
          </p>
          <p className="text-sm text-muted-foreground">
            {customMessage
              ? customMessage
              : nextOpeningText
                ? t("reopensAt", { time: nextOpeningText })
                : t("reopensLater")}
          </p>
        </div>
      </div>
      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
        {t("badge")}
      </span>
    </motion.div>
  );
}
