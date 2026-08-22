"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Printer, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/currency";
import { toast } from "@/lib/toast";
import type { IInvoiceData, IInvoiceRestaurant } from "./types";

interface IProps {
  data: IInvoiceData;
  restaurant: IInvoiceRestaurant;
  onClose?: () => void;
}

const formatPrice = (n: number, currencyCode?: string | null) =>
  formatMoney(n, currencyCode ?? undefined);

/**
 * Document actions bar: Print (native dialog) + Copy order summary. Hidden
 * from the printed output via `.print-hidden`.
 */
export function DocumentToolbar({ data, restaurant, onClose }: IProps) {
  const t = useTranslations("documents");
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    const itemRows = data.lines
      .map(
        (line) =>
          `${line.quantity}× ${line.name} — ${formatPrice(line.totalPrice, data.currencyCode)}`,
      )
      .join("\n");

    const text = [
      restaurant.name,
      `${t("orderNumber")}: ${data.orderNumber}`,
      "",
      itemRows,
      "",
      `${t("subtotal")}: ${formatPrice(data.totals.subtotal, data.currencyCode)}`,
      `${t("deliveryFee")}: ${formatPrice(data.totals.deliveryFee, data.currencyCode)}`,
      data.totals.tax > 0
        ? `${t("tax")}: ${formatPrice(data.totals.tax, data.currencyCode)}`
        : null,
      data.totals.discount > 0
        ? `${t("discount")}: −${formatPrice(data.totals.discount, data.currencyCode)}`
        : null,
      `${t("grandTotal")}: ${formatPrice(data.totals.total, data.currencyCode)}`,
      "",
      `${t("customer")}: ${data.customerName}`,
      `${t("phone")}: ${data.customerPhone}`,
      `${t("address")}: ${data.deliveryAddress}, ${data.city}`,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  return (
    <div className="print-hidden flex flex-wrap items-center gap-2">
      {onClose && (
        <Button variant="outline" size="icon-sm" onClick={onClose} aria-label={t("close")}>
          <X className="size-4" aria-hidden="true" />
        </Button>
      )}
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="size-3.5" aria-hidden="true" />
        {t("print")}
      </Button>
      <Button variant="outline" onClick={handleCopy}>
        {copied ? (
          <Check className="size-3.5 text-emerald-500" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        {copied ? t("copied") : t("copySummary")}
      </Button>
    </div>
  );
}
