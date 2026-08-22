"use client";

import { useLocale, useTranslations } from "next-intl";
import { FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DocumentToolbar } from "../DocumentToolbar";
import { InvoiceDocument } from "./InvoiceDocument";
import type { IInvoiceData, IInvoiceRestaurant } from "../types";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: IInvoiceData;
  restaurant: IInvoiceRestaurant;
}

/** Dialog that previews an invoice and exposes print / copy actions. */
export function InvoiceDialog({ open, onOpenChange, data, restaurant }: IProps) {
  const t = useTranslations("documents");
  const locale = useLocale();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto gap-0 p-0 print:hidden sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4 text-primary" aria-hidden="true" />
            {t("invoice")} — {data.orderNumber}
          </DialogTitle>
          <DialogDescription>
            {t("invoiceDescription")} ({locale === "ar" ? "AR" : "EN"})
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 bg-muted/40 px-5 py-3">
          <DocumentToolbar
            data={data}
            restaurant={restaurant}
            onClose={() => onOpenChange(false)}
          />
        </div>

        <div className="bg-neutral-100/60 p-4 sm:p-6">
          <InvoiceDocument data={data} restaurant={restaurant} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
