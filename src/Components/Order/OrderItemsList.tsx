"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { formatMoney } from "@/lib/currency";
import { itemVariants, EASE } from "./OrderAnimations";
import type { IOrderItem } from "./types";

interface IProps {
  items: IOrderItem[];
  currencyCode?: string | null;
}

const formatPrice = (n: number, currencyCode?: string | null) =>
  formatMoney(n, currencyCode ?? undefined);

const itemRowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: EASE, delay: i * 0.06 },
  }),
};

interface OrderedItemProps {
  item: IOrderItem;
  index: number;
  currencyCode?: string | null;
}

function OrderedItem({ item, index, currencyCode }: OrderedItemProps) {
  return (
    <motion.div
      custom={index}
      variants={itemRowVariants}
      initial="hidden"
      animate="visible"
      className="flex gap-3.5 py-4"
    >
      {/* Product image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted sm:h-20 sm:w-20">
        <Image
          src={item.productImage}
          alt={item.productName}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              {item.productName}
            </p>
            {item.variantName && (
              <span className="mt-0.5 inline-block rounded-full border border-border/60 bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.variantName}
              </span>
            )}
          </div>
          {/* Line total */}
          <p className="shrink-0 text-sm font-bold text-primary">
            {formatPrice(item.totalPrice, currencyCode)}
          </p>
        </div>

        {/* Extras */}
        {item.options.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {item.options.map((opt) => (
              <span
                key={opt.id}
                className="rounded-md border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                +{opt.name}
                {opt.price > 0 && ` (+${formatPrice(opt.price, currencyCode)})`}
              </span>
            ))}
          </div>
        )}

        {/* Qty × unit price row */}
        <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            Qty: <strong className="text-foreground">{item.quantity}</strong>
          </span>
          <span className="opacity-40">·</span>
          <span>
            Unit:{" "}
            <strong className="text-foreground">
              {formatPrice(item.unitPrice, currencyCode)}
            </strong>
          </span>
        </div>

        {/* Per-item note */}
        {item.notes && (
          <p className="mt-1 text-[11px] italic text-muted-foreground">
            Note: {item.notes}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function OrderItemsList({ items, currencyCode }: IProps) {
  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          Ordered Items{" "}
          <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {items.length}
          </span>
        </h3>
      </div>

      <div className="divide-y divide-border/60 px-5">
        {items.map((item, i) => (
          <OrderedItem key={item.id} item={item} index={i} currencyCode={currencyCode} />
        ))}
      </div>
    </motion.div>
  );
}
