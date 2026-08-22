"use client";

import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/currency";
import { useLocaleDirection } from "@/src/lib/i18n/useLocaleDirection";
import type { IInvoiceData, IInvoiceRestaurant } from "../types";

interface IProps {
  data: IInvoiceData;
  restaurant: IInvoiceRestaurant;
}

const formatPrice = (n: number, currencyCode?: string | null) =>
  formatMoney(n, currencyCode ?? undefined);

/**
 * Printable kitchen ticket (M14 — Document Center). Mirrors the live order
 * center's ticket but renders from the shared Document Engine DTO and carries
 * the restaurant branding header. Pure/presentational — safe for screen
 * preview, print and the PDF pipeline.
 */
export function KitchenTicketDocument({ data, restaurant }: IProps) {
  const t = useTranslations("documents");
  const tk = useTranslations("documents.kitchen");
  const locale = useLocale();
  const { isRTL } = useLocaleDirection();
  const isDineIn = data.orderType === "DINE_IN";

  const date = new Date(data.createdAt).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" },
  );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="mx-auto w-full max-w-3xl bg-white text-neutral-900"
    >
      <div className="flex items-start justify-between gap-4 border-b border-neutral-300 px-6 py-5">
        <div>
          <p className="text-xl font-bold tracking-tight">{restaurant.name}</p>
          <p className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase">
            {tk("title")}
          </p>
        </div>
        <div className="text-end">
          <p className="font-mono text-sm font-bold">{data.orderNumber}</p>
          {isDineIn && data.tableNumber && (
            <p className="text-xs font-bold text-neutral-700">
              {t("table")}: {data.tableNumber}
            </p>
          )}
          <p className="mt-0.5 text-xs text-neutral-500">{date}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-6 py-3 text-sm">
        <span className="font-semibold">{tk("customerInfo")}:</span>
        <span className="font-medium">{data.customerName}</span>
        <span dir="ltr" className="text-neutral-600">
          · {data.customerPhone}
        </span>
        {isDineIn && data.tableNumber && (
          <span className="ms-auto font-bold text-neutral-700">
            {t("table")}: {data.tableNumber}
          </span>
        )}
      </div>

      <div className="px-6 py-4">
        <ul className="flex flex-col">
          {data.lines.map((line, index) => (
            <li
              key={`${line.name}-${index}`}
              className="flex items-start gap-3 border-b border-neutral-100 py-2"
            >
              <span className="text-base font-bold">× {line.quantity}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{line.name}</p>
                {line.variantName && (
                  <p className="text-xs text-neutral-500">{line.variantName}</p>
                )}
                {line.notes && (
                  <p className="text-xs text-neutral-500">↳ {line.notes}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 px-6 pb-6">
        {!isDineIn && data.totals.deliveryFee > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">{t("deliveryFee")}</span>
            <span className="tabular-nums">{formatPrice(data.totals.deliveryFee, data.currencyCode)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-neutral-300 pt-2 text-sm">
          <span className="font-bold">{t("grandTotal")}</span>
          <span className="font-bold tabular-nums">{formatPrice(data.totals.total, data.currencyCode)}</span>
        </div>
      </div>
    </div>
  );
}
