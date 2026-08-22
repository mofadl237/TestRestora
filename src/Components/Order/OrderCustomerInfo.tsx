"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  User,
  Phone,
  MapPin,
  StickyNote,
  CreditCard,
  Wallet,
  Utensils,
} from "lucide-react";
import { itemVariants } from "./OrderAnimations";

interface IProps {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  tableNumber?: string | null;
  notes: string | null;
  paymentMethod: string | null;
  paymentStatus: string;
  orderType?: string;
}

interface RowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function Row({ icon, label, value }: RowProps) {
  return (
    <div className="flex gap-3 py-3.5">
      <div className="mt-0.5 shrink-0 text-primary">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function OrderCustomerInfo({
  customerName,
  customerPhone,
  deliveryAddress,
  city,
  tableNumber,
  notes,
  paymentMethod,
  paymentStatus,
  orderType = "DELIVERY",
}: IProps) {
  const t = useTranslations("order.customerInfo");
  const isDineIn = orderType === "DINE_IN";

  const PAYMENT_METHOD_LABEL: Record<string, string> = {
    CASH: t("paymentMethods.CASH"),
    CARD: t("paymentMethods.CARD"),
    ONLINE: t("paymentMethods.ONLINE"),
    WALLET: t("paymentMethods.WALLET"),
  };

  const PAYMENT_STATUS_LABEL: Record<string, string> = {
    PENDING: t("paymentStatuses.PENDING"),
    PAID: t("paymentStatuses.PAID"),
    FAILED: t("paymentStatuses.FAILED"),
    REFUNDED: t("paymentStatuses.REFUNDED"),
    PARTIALLY_REFUNDED: t("paymentStatuses.PARTIALLY_REFUNDED"),
  };

  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          {isDineIn ? t("dineInTitle") : t("deliveryTitle")}
        </h3>
      </div>

      <div className="divide-y divide-border/60 px-5">
        <Row
          icon={<User className="h-4 w-4" />}
          label={t("customerName")}
          value={customerName}
        />
        <Row
          icon={<Phone className="h-4 w-4" />}
          label={t("phoneNumber")}
          value={customerPhone}
        />
        {isDineIn && tableNumber ? (
          <Row
            icon={<Utensils className="h-4 w-4" />}
            label={t("tableNumber")}
            value={tableNumber}
          />
        ) : (
          <Row
            icon={<MapPin className="h-4 w-4" />}
            label={t("deliveryAddress")}
            value={`${deliveryAddress}, ${city}`}
          />
        )}
        <Row
          icon={<CreditCard className="h-4 w-4" />}
          label={t("paymentMethod")}
          value={
            paymentMethod
              ? (PAYMENT_METHOD_LABEL[paymentMethod] ?? paymentMethod)
              : t("notSpecified")
          }
        />
        <Row
          icon={<Wallet className="h-4 w-4" />}
          label={t("paymentStatus")}
          value={PAYMENT_STATUS_LABEL[paymentStatus] ?? paymentStatus}
        />
        {notes && (
          <Row
            icon={<StickyNote className="h-4 w-4" />}
            label={t("orderNotes")}
            value={notes}
          />
        )}
      </div>
    </motion.div>
  );
}
