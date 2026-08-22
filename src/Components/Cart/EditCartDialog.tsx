"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, Variants } from "framer-motion";
import { useState } from "react";
import { Footer } from "@/src/Components/Product/AddToCartDialog/Footer";
import { OptionGroup } from "@/src/Components/Product/AddToCartDialog/OptionGroup";
import { ProductHeader } from "@/src/Components/Product/AddToCartDialog/ProductHeader";
import { VariantSelector } from "@/src/Components/Product/AddToCartDialog/VariantSelector";
import type {
  IProductWithOptions,
  IOptionGroup,
} from "@/src/Components/Product/AddToCartDialog/types";
import {
  addExtraToCart,
  calcTotalPriceFromOptions,
  calcTotalPriceFromVariant,
  calcTotalPriceOneProduct,
} from "@/lib/utils";
import { useDispatch } from "react-redux";
import { updateItem } from "@/src/store/features/CartSlice";
import type { ICartProduct } from "@/src/store/features/CartSlice";
import { useTranslations } from "next-intl";

interface IProps {
  cartItem: ICartProduct;
  product: IProductWithOptions;
  open: boolean;
  onClose: () => void;
}

const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.12 },
  },
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Edit Cart Dialog — reuses all AddToCartDialog sub-components.
 * Pre-fills the currently selected variant and extras from the cart item.
 * On save, dispatches updateItem to replace the existing cart entry in-place.
 */
export function EditCartDialog({ cartItem, product, open, onClose }: IProps) {
  const dispatch = useDispatch();
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");

  // Pre-fill variant from cart item
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    cartItem.variant?.id ?? product.variants[0]?.id ?? "",
  );

  // Pre-fill options from cart item
  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>(
    () => {
      const checked: Record<string, boolean> = {};
      (cartItem.options ?? []).forEach((o) => {
        checked[o.id] = true;
      });
      return checked;
    },
  );

  // Pre-fill quantity and note
  const [quantity, setQuantity] = useState<number>(cartItem.quantity);
  const [note, setNote] = useState<string>(cartItem.note ?? "");

  // Reset all state whenever the dialog opens with a (potentially different) cart item
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedVariantId(
        cartItem.variant?.id ?? product.variants[0]?.id ?? "",
      );
      const checked: Record<string, boolean> = {};
      (cartItem.options ?? []).forEach((o) => {
        checked[o.id] = true;
      });
      setCheckedOptions(checked);
      setQuantity(cartItem.quantity);
      setNote(cartItem.note ?? "");
    }
  }

  const toggleOption = (id: string) =>
    setCheckedOptions((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];

  const baseVariantPrice = product.variants[0]?.price ?? product.basePrice;

  const chosenExtras = product.optionGroups.flatMap((group) =>
    group.options.filter((option) => checkedOptions[option.id]),
  );

  const totalPrice = calcTotalPriceOneProduct(
    calcTotalPriceFromVariant(product.basePrice, selectedVariant?.price ?? 0),
    calcTotalPriceFromOptions(chosenExtras),
  );

  const handleSave = () => {
    const updatedItem: ICartProduct = {
      ...cartItem,
      basePrice: product.basePrice,
      quantity,
      note: note.trim() || undefined,
      variant: selectedVariant
        ? {
            id: selectedVariant.id,
            name: selectedVariant.name,
            price: selectedVariant.price,
          }
        : undefined,
      options: addExtraToCart(chosenExtras),
    };

    dispatch(updateItem(updatedItem));
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="fixed top-1/2 left-1/2 flex max-h-[min(90dvh,44rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-2xl border-border/60 bg-background p-0 shadow-2xl ring-1 ring-border/40">
        {/* Zone 1: Fixed header */}
        <ProductHeader product={product} />

        {/* Zone 2: Scrollable form */}
        <motion.form
          id="edit-cart-form"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-thin [scrollbar-color:var(--border)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80 [&::-webkit-scrollbar-track]:bg-transparent"
          variants={formVariants}
          initial="hidden"
          animate="visible"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="space-y-3.5 px-4 py-3 sm:space-y-4 sm:px-5 sm:py-3.5">
            <motion.div variants={sectionVariants}>
              <VariantSelector
                variants={product.variants}
                baseVariantPrice={baseVariantPrice}
                value={selectedVariantId}
                onValueChange={setSelectedVariantId}
              />
            </motion.div>

            {product.optionGroups.map((group: IOptionGroup) => (
              <motion.div key={group.id} variants={sectionVariants}>
                <OptionGroup
                  group={group}
                  checkedOptions={checkedOptions}
                  onToggle={toggleOption}
                />
              </motion.div>
            ))}

            {/* Quantity */}
            <motion.div
              variants={sectionVariants}
              className="flex items-center gap-3"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("quantity")}
              </span>
              <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 px-1 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={tCommon("decreaseQuantity")}
                >
                  <span className="text-base leading-none">−</span>
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={tCommon("increaseQuantity")}
                >
                  <span className="text-base leading-none">+</span>
                </button>
              </div>
            </motion.div>

            {/* Note */}
            <motion.div variants={sectionVariants}>
              <label
                htmlFor="edit-cart-note"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {t("specialInstructions")}
              </label>
              <textarea
                id="edit-cart-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("notePlaceholder")}
                className="w-full resize-none rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            </motion.div>
          </div>
        </motion.form>

        {/* Zone 3: Fixed footer — Save button */}
        <Footer
          basePrice={totalPrice * quantity}
          buttonLabel={t("updateItem")}
          formId="edit-cart-form"
        />
      </DialogContent>
    </Dialog>
  );
}
