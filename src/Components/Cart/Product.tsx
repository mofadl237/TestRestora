"use client";

import { ICartProduct } from "@/src/store/features/CartSlice";
import Extra from "./Extra";
import {
  calcTotalPriceFromOptions,
  formattePrice,
} from "@/lib/utils";
import Image from "next/image";
import { Pencil, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface IProps {
  item: ICartProduct;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onIncrease?: (id: string) => void;
  onDecrease?: (id: string) => void;
  editLoading?: boolean;
}

const Product = ({
  item,
  onRemove,
  onEdit,
  onIncrease,
  onDecrease,
  editLoading = false,
}: IProps) => {
  const t = useTranslations("cart");
  const optionsTotal = calcTotalPriceFromOptions(item.options ?? []);
  const variantDelta = item.variant?.price ?? 0;
  const unitPrice =
    item.basePrice + variantDelta + optionsTotal;
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex gap-3.5">
      {/* Product image */}
      {item.productImage && (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      )}

      {/* Details */}
      <div className="min-w-0 flex-1">
        {/* Name + actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold tracking-tight text-foreground">
              {item.productName}
            </h4>
            {item.variant && (
              <span className="mt-0.5 inline-block rounded-full border border-border/60 bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {item.variant.name}
              </span>
            )}
          </div>

          {/* Edit / Remove buttons */}
          <div className="flex shrink-0 items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(item.id)}
                disabled={editLoading}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors duration-200 hover:border-primary/50 hover:bg-primary/8 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-50"
                aria-label={t("editItem", { name: item.productName })}
                type="button"
              >
                {editLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                )}
              </button>
            )}
            {onRemove && (
              <button
                onClick={() => onRemove(item.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors duration-200 hover:border-destructive/60 hover:bg-destructive/8 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={t("removeItem", { name: item.productName })}
                type="button"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            )}
          </div>
        </div>

        {/* Extras */}
        {item.options && item.options.length > 0 && (
          <div className="mt-2">
            <Extra item={item.options} />
          </div>
        )}

        {/* Bottom row: quantity controls + qty × unit price = line total */}
        <div className="mt-3 flex items-center justify-between gap-2">
          {/* Quantity stepper */}
          {onIncrease && onDecrease && (
            <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 px-1 py-1">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={() => onDecrease(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Decrease quantity of ${item.productName}`}
              >
                <Minus className="h-3 w-3" />
              </motion.button>

              <span className="min-w-[1.25rem] text-center text-sm font-bold tabular-nums text-foreground">
                {item.quantity}
              </span>

              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={() => onIncrease(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Increase quantity of ${item.productName}`}
              >
                <Plus className="h-3 w-3" />
              </motion.button>
            </div>
          )}

          {/* qty × unit price → line total */}
          <span className="ml-auto text-xs text-muted-foreground">
            {item.quantity} × {formattePrice(unitPrice)}
            <span className="mx-1.5">=</span>
            <span className="text-base font-bold text-primary">
              {formattePrice(lineTotal)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Product;
