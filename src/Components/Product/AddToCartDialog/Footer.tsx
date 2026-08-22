"use client";

import { motion, Variants } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formattePrice } from "@/lib/utils";

interface IProps {
  basePrice: number;
  /** Label for the primary CTA button. Defaults to the localized "Add to Cart". */
  buttonLabel?: string;
  /** The form id the submit button is linked to. Defaults to "add-to-cart-form". */
  formId?: string;
  /** Triggers a short shake on the CTA — used to signal a failed add. */
  shake?: boolean;
  /** Prevents repeated submits while processing. */
  disabled?: boolean;
  /** Briefly swaps the CTA to a success state before the dialog closes. */
  success?: boolean;
}

const footerVariants: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: 0.28 },
  },
};

const successIconVariants: Variants = {
  hidden: { scale: 0, opacity: 0, rotate: -30 },
  visible: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 500, damping: 24 },
  },
};

export function Footer({
  basePrice,
  buttonLabel,
  formId = "add-to-cart-form",
  shake = false,
  disabled = false,
  success = false,
}: IProps) {
  const locale = useLocale();
  const t = useTranslations("cart");
  const tMenu = useTranslations("menu");
  const isRtl = locale === "ar";
  const shakeOffsets = isRtl ? [0, 7, -7, 5, -5, 0] : [0, -7, 7, -5, 5, 0];
  const resolvedButtonLabel = buttonLabel ?? t("addToCart");

  return (
    <div
      className="shrink-0 border-t border-border/80 bg-card/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <motion.div
        variants={footerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-nowrap items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5"
      >
        {/* Price */}
        <div className="shrink-0 leading-none">
          <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {tMenu("fromPrice")}
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            {formattePrice(basePrice)}
          </span>
        </div>

        {/* Add to Cart CTA */}
        <motion.button
          id="add-to-cart-submit"
          type="submit"
          form={formId}
          disabled={disabled}
          whileHover={{ y: -1, filter: "brightness(1.08)" }}
          whileTap={{ scale: 0.97, filter: "brightness(0.96)" }}
          animate={shake ? { x: shakeOffsets } : { x: 0 }}
          transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className={`group relative flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-3 text-sm font-semibold shadow-[0_1px_2px_color-mix(in_oklch,var(--foreground)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${
            success
              ? "bg-accent text-accent-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {success ? (
            <motion.span
              key="success"
              variants={successIconVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-2"
            >
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              {t("added")}
            </motion.span>
          ) : (
            <>
              <ShoppingCart
                className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
              {resolvedButtonLabel}
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
