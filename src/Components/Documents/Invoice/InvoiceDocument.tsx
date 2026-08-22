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
 * Printable invoice document. Rendered inside a `.print-area` so the global
 * print stylesheet prints only this document. Kept pure/presentational — no
 * business logic — ready to be reused by a future PDF/PNG pipeline.
 */
export function InvoiceDocument({ data, restaurant }: IProps) {
  const t = useTranslations("documents");
  const locale = useLocale();
  const { isRTL } = useLocaleDirection();
  const isDineIn = data.orderType === "DINE_IN";

  const date = new Date(data.createdAt).toLocaleDateString(
    locale === "ar" ? "ar-EG" : "en-US",
    { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" },
  );

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="print-area mx-auto w-full max-w-3xl bg-white text-neutral-900"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-6">
        <div>
          <p className="text-xl font-bold tracking-tight">{restaurant.name}</p>
          {restaurant.address && (
            <p className="mt-1 text-xs text-neutral-500">{restaurant.address}</p>
          )}
          <div className="mt-1 flex flex-col gap-0.5 text-xs text-neutral-500">
            {restaurant.phone && <span>{restaurant.phone}</span>}
            {restaurant.email && <span>{restaurant.email}</span>}
          </div>
        </div>
        <div className="text-end">
          <p className="text-2xl font-bold tracking-tight uppercase">
            {t("invoice")}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            {t("orderNumber")}: <span className="font-mono font-semibold">{data.orderNumber}</span>
          </p>
          {isDineIn && data.tableNumber && (
            <p className="text-xs text-neutral-500">
              {t("table")}: <span className="font-mono font-semibold">{data.tableNumber}</span>
            </p>
          )}
          <p className="text-xs text-neutral-500">
            {t("date")}: {date}
          </p>
        </div>
      </div>

      {/* Bill to + delivery / dine-in */}
      <div className="grid grid-cols-1 gap-6 px-6 py-6 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            {t("billTo")}
          </p>
          <div className="mt-2 space-y-0.5 text-sm">
            <p className="font-semibold">{data.customerName}</p>
            <p className="text-neutral-600">{data.customerPhone}</p>
            {!isDineIn && (
              <p className="text-neutral-600">
                {data.deliveryAddress}, {data.city}
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
            {isDineIn ? t("orderType") : t("delivery")}
          </p>
          <div className="mt-2 space-y-0.5 text-sm">
            {isDineIn ? (
              <>
                <p className="font-semibold">{t("orderType")}: {t("table")} {data.tableNumber ?? "—"}</p>
              </>
            ) : (
              <>
                {data.deliveryZone && (
                  <p className="font-semibold">{data.deliveryZone.name}</p>
                )}
                {data.deliveryZone?.estimatedTimeMin != null &&
                  data.deliveryZone.estimatedTimeMax != null && (
                    <p className="text-neutral-600">
                      {t("eta")}: {data.deliveryZone.estimatedTimeMin}–
                      {data.deliveryZone.estimatedTimeMax} {t("minutes")}
                    </p>
                  )}
              </>
            )}
            {data.paymentMethod && (
              <p className="text-neutral-600">
                {t("payment")}: {data.paymentMethod}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items table */}
      <div className="px-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-300 text-[10px] uppercase tracking-widest text-neutral-400">
              <th className="py-2 text-start font-semibold">{t("items")}</th>
              <th className="py-2 text-center font-semibold">{t("qty")}</th>
              <th className="py-2 text-end font-semibold">{t("price")}</th>
              <th className="py-2 text-end font-semibold">{t("total")}</th>
            </tr>
          </thead>
          <tbody>
            {data.lines.map((line, index) => (
              <tr
                key={`${line.name}-${index}`}
                className="border-b border-neutral-100"
              >
                <td className="py-3 pe-3">
                  <p className="font-medium">{line.name}</p>
                  {line.variantName && (
                    <p className="text-xs text-neutral-500">{line.variantName}</p>
                  )}
                  {line.notes && (
                    <p className="mt-0.5 text-xs text-neutral-400">{line.notes}</p>
                  )}
                </td>
                <td className="py-3 text-center tabular-nums">{line.quantity}</td>
                <td className="py-3 text-end tabular-nums">
                  {formatPrice(line.unitPrice, data.currencyCode)}
                </td>
                <td className="py-3 text-end font-semibold tabular-nums">
                  {formatPrice(line.totalPrice, data.currencyCode)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end px-6 py-6">
        <div className="w-full max-w-xs space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500">{t("subtotal")}</span>
            <span className="tabular-nums">{formatPrice(data.totals.subtotal, data.currencyCode)}</span>
          </div>
          {!isDineIn && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">{t("deliveryFee")}</span>
              <span className="tabular-nums">{formatPrice(data.totals.deliveryFee, data.currencyCode)}</span>
            </div>
          )}
          {data.totals.tax > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">{t("tax")}</span>
              <span className="tabular-nums">{formatPrice(data.totals.tax, data.currencyCode)}</span>
            </div>
          )}
          {data.totals.discount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-neutral-500">{t("discount")}</span>
              <span className="tabular-nums text-emerald-600">
                −{formatPrice(data.totals.discount, data.currencyCode)}
              </span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-neutral-300 pt-3">
            <span className="text-base font-bold">{t("grandTotal")}</span>
            <span className="text-lg font-bold tabular-nums">
              {formatPrice(data.totals.total, data.currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-200 px-6 py-4 text-center">
        <p className="text-xs text-neutral-500">
          {t("vatIncluded")} · {t("thankYou")}
        </p>
      </div>
    </div>
  );
}
