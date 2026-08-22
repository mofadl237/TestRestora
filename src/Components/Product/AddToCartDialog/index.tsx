"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { motion, Variants } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Footer } from "./Footer";
import { OptionGroup } from "./OptionGroup";
import { ProductHeader } from "./ProductHeader";
import { VariantSelector } from "./VariantSelector";
import type { IOptionGroup, IProductWithOptions } from "./types";
import {
  addExtraToCart,
  calcTotalPriceFromOptions,
  calcTotalPriceFromVariant,
  calcTotalPriceOneProduct,
} from "@/lib/utils";
import { useDispatch } from "react-redux";
import { addItem, updateItem } from "@/src/store/features/CartSlice";
import type { ICartProduct } from "@/src/store/features/CartSlice";
import { flyToCart } from "@/lib/cartAnimations";
import { toast } from "@/lib/toast";
import { useTranslations } from "next-intl";

interface IProps {
  product: IProductWithOptions;
  mode?: "create" | "edit";
  cartItem?: ICartProduct;
  open?: boolean;
  onClose?: () => void;
}

/* ── Animation variants ─────────────────────────────────────────────── */

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

/* ── Component ─────────────────────────────────────────────────────── */

export function AddToCartDialog({
  product,
  mode = "create",
  cartItem,
  open,
  onClose,
}: IProps) {
  const dispatch = useDispatch();
  const t = useTranslations("common");
  const tCart = useTranslations("cart");
  const isEdit = mode === "edit" && !!cartItem;

  // Manage open state internally for "create" mode (uncontrolled trigger)
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;

  const handleOpenChange = (val: boolean) => {
    if (open === undefined) {
      setInternalOpen(val);
    }
    if (!val && onClose) {
      onClose();
    }
  };

  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>(
    {},
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // Reset selection whenever the dialog opens for a (potentially different) product
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen) {
      setSubmitting(false);
      setSuccess(false);
      setShake(false);
      setSelectedVariantId(
        isEdit
          ? (cartItem.variant?.id ?? product.variants[0]?.id ?? "")
          : (product.variants[0]?.id ?? ""),
      );

      const checked: Record<string, boolean> = {};
      if (isEdit) {
        (cartItem.options ?? []).forEach((o) => {
          checked[o.id] = true;
        });
      }
      setCheckedOptions(checked);

      setQuantity(isEdit ? cartItem.quantity : 1);
      setNote(isEdit ? (cartItem.note ?? "") : "");
    }
  }

  const toggleOption = (id: string) =>
    setCheckedOptions((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectedVariant =
    product.variants.find((v) => v.id === selectedVariantId) ??
    product.variants[0];

  const selectedVariantPrice = selectedVariant?.price ?? product.basePrice;
  const baseVariantPrice = product.variants[0]?.price ?? product.basePrice;

  const ChooseExtra = product.optionGroups.flatMap((group) => {
    return group.options.filter((option) => checkedOptions[option.id]);
  });

  const allPrice = calcTotalPriceOneProduct(
    calcTotalPriceFromVariant(product.basePrice, selectedVariantPrice),
    calcTotalPriceFromOptions(ChooseExtra),
  );

  const handleSave = () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (isEdit && cartItem) {
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
          options: addExtraToCart(ChooseExtra),
        };
        dispatch(updateItem(updatedItem));
        handleOpenChange(false);
        window.setTimeout(() => setSubmitting(false), 700);
        return;
      }

      dispatch(
        addItem({
          id: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          quantity,
          basePrice: product.basePrice,
          variant: selectedVariant
            ? {
                id: selectedVariant.id,
                name: selectedVariant.name,
                price: selectedVariant.price,
              }
            : undefined,
          options: addExtraToCart(ChooseExtra),
          note: note.trim() || undefined,
        }),
      );

      // One connected interaction: a brief success on the CTA, then the dialog
      // closes, then the product flies from its original card into the cart.
      // Only after the flight lands does the cart spring and the toast appear.
      setSuccess(true);
      window.setTimeout(() => {
        handleOpenChange(false);

        window.setTimeout(() => {
          const sourceEl = document.querySelector<HTMLElement>(
            `[data-cart-source-image="${product.id}"]`,
          );
          const sourceRect = sourceEl?.getBoundingClientRect();
          flyToCart(
            sourceRect
              ? {
                  x: sourceRect.left,
                  y: sourceRect.top,
                  w: sourceRect.width,
                  h: sourceRect.height,
                }
              : null,
            product.image || "/placeholder.png",
            () => {
              toast.success(
                t("itemAdded", { name: product.name, count: quantity }),
                product.id,
              );
            },
          );
        }, 180);
      }, 120);

      window.setTimeout(() => setSubmitting(false), 700);
    } catch {
      toast.error(t("addedToCartError"));
      setShake(true);
      setSuccess(false);
      window.setTimeout(() => setShake(false), 600);
      window.setTimeout(() => setSubmitting(false), 700);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {mode === "create" && (
        <DialogTrigger>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            type="button"
          >
            <ShoppingCart
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
            {tCart("addToCart")}
          </motion.button>
        </DialogTrigger>
      )}

      <DialogContent className="fixed top-1/2 left-1/2 flex max-h-[min(90dvh,44rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-2xl border-border/60 bg-background p-0 shadow-2xl ring-1 ring-border/40">
        <ProductHeader product={product} />

        <motion.form
          id="configurator-form"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-color:var(--border)_transparent] scrollbar-thin [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border/80 [&::-webkit-scrollbar-track]:bg-transparent"
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

            {isEdit && (
              <>
                {/* Quantity */}
                <motion.div
                  variants={sectionVariants}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {tCart("quantity")}
                  </span>
                  <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 px-1 py-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={t("decreaseQuantity")}
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
                      aria-label={t("increaseQuantity")}
                    >
                      <span className="text-base leading-none">+</span>
                    </button>
                  </div>
                </motion.div>

                {/* Note */}
                <motion.div variants={sectionVariants}>
                  <label
                    htmlFor="configurator-note"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {tCart("specialInstructions")}
                  </label>
                  <textarea
                    id="configurator-note"
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={tCart("notePlaceholder")}
                    className="w-full resize-none rounded-xl border border-border bg-muted/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </motion.div>
              </>
            )}
          </div>
        </motion.form>

        <Footer
          basePrice={allPrice * quantity}
          buttonLabel={isEdit ? tCart("updateItem") : tCart("addToCart")}
          formId="configurator-form"
          shake={shake}
          disabled={submitting && !success}
          success={success}
        />
      </DialogContent>
    </Dialog>
  );
}
