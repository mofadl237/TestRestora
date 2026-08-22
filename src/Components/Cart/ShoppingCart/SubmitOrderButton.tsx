"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { buttonHoverVariants } from "./CartAnimations";
import { formattePrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { IconChevronNext } from "@/src/lib/i18n/DirectionalIcons";

interface IProps {
  total: number;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const SubmitOrderButton = ({
  total,
  loading,
  disabled = false,
  onClick,
}: IProps) => {
  const t = useTranslations("cart");

  return (
    <motion.button
      variants={buttonHoverVariants}
      initial="rest"
      whileHover={!disabled && !loading ? "hover" : "rest"}
      whileTap={!disabled && !loading ? "tap" : "rest"}
      onClick={onClick}
      disabled={disabled || loading}
      type="button"
      id="submit-order-btn"
      className="relative w-full overflow-hidden rounded-2xl bg-primary px-6 py-4 text-base font-bold text-primary-foreground shadow-lg transition-[filter,opacity] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 hover:brightness-110"
      style={{
        boxShadow:
          "0 4px 20px 0 oklch(0.62 0.2 50 / 0.35), 0 1px 4px 0 oklch(0.62 0.2 50 / 0.18)",
      }}
      aria-label={t("submitAria", { price: formattePrice(total) })}
    >
      {/* Shimmer overlay */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        aria-hidden
      />

      {loading ? (
        <span className="flex items-center justify-center gap-2.5">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          {t("placingOrder")}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2.5">
          <span className="flex-1 text-center">
            {t("submitOrder")}
            <span className="mx-2 opacity-60">•</span>
            {formattePrice(total)}
          </span>
          <IconChevronNext
            className="h-4 w-4 shrink-0 opacity-70"
            aria-hidden
          />
        </span>
      )}
    </motion.button>
  );
};

export default SubmitOrderButton;
