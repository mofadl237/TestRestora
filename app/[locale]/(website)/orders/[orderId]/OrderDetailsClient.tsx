"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconBack } from "@/src/lib/i18n/DirectionalIcons";
import {
  containerVariants,
  itemVariants,
} from "@/src/Components/Order/OrderAnimations";
import { OrderHeader } from "@/src/Components/Order/OrderHeader";
import { OrderSuccessBanner } from "@/src/Components/Order/OrderSuccessBanner";
import { OrderTimeline } from "@/src/Components/Order/OrderTimeline";
import { OrderCustomerInfo } from "@/src/Components/Order/OrderCustomerInfo";
import { OrderItemsList } from "@/src/Components/Order/OrderItemsList";
import { OrderPriceSummary } from "@/src/Components/Order/OrderPriceSummary";
import type { IOrderDetail } from "@/src/Components/Order/types";
import { InvoiceDialog } from "@/src/Components/Documents/Invoice/InvoiceDialog";
import type {
  IInvoiceData,
  IInvoiceRestaurant,
} from "@/src/Components/Documents";

interface IProps {
  order: IOrderDetail;
  invoice: IInvoiceData;
  restaurant: IInvoiceRestaurant;
}

const OrderDetailsClient = ({ order, invoice, restaurant }: IProps) => {
  const t = useTranslations("common");
  const tDocs = useTranslations("documents");
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container marginSection"
    >
      {/* Back navigation */}
      <motion.div
        variants={itemVariants}
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        <Link
          href="/menu"
          className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconBack
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
            aria-hidden
          />
          {t("menu")}
        </Link>
        <span className="text-border">·</span>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <Home className="h-3.5 w-3.5" aria-hidden />
          {t("home")}
        </Link>
        <span className="ms-auto">
          <Button variant="outline" size="sm" onClick={() => setInvoiceOpen(true)}>
            <FileText className="size-3.5" aria-hidden="true" />
            {tDocs("viewInvoice")}
          </Button>
        </span>
      </motion.div>

      {/* Success banner */}
      <div className="mb-6">
        <OrderSuccessBanner
          customerName={order.customerName}
          orderNumber={order.orderNumber}
          status={order.status}
          orderType={order.orderType}
          tableNumber={order.tableNumber}
        />
      </div>

      {/* Order Header */}
      <div className="mb-6">
        <OrderHeader
          orderNumber={order.orderNumber}
          orderType={order.orderType}
          tableNumber={order.tableNumber}
          status={order.status}
          createdAt={order.createdAt}
          totalPrice={order.totalPrice}
          currencyCode={order.currencyCode}
        />
      </div>

      {/* Two-column grid: left = items + summary, right = timeline + customer info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px] lg:items-start xl:grid-cols-[1fr_400px]">
        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6">
          <OrderItemsList items={order.items} currencyCode={order.currencyCode} />
          <OrderPriceSummary
            subtotal={order.subtotal}
            deliveryFee={order.deliveryFee}
            tax={order.tax}
            discount={order.discount}
            totalPrice={order.totalPrice}
            deliveryZone={order.deliveryZone}
            currencyCode={order.currencyCode}
            orderType={order.orderType}
          />
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-6 lg:sticky lg:top-6">
          <OrderTimeline currentStatus={order.status} orderType={order.orderType} />
          <OrderCustomerInfo
            customerName={order.customerName}
            customerPhone={order.customerPhone}
            deliveryAddress={order.deliveryAddress}
            city={order.city}
            tableNumber={order.tableNumber}
            notes={order.notes}
            paymentMethod={order.paymentMethod}
            paymentStatus={order.paymentStatus}
            orderType={order.orderType}
          />
        </div>
      </div>

      <InvoiceDialog
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
        data={invoice}
        restaurant={restaurant}
      />
    </motion.div>
  );
};

export default OrderDetailsClient;
