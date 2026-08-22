"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Trash2 } from "lucide-react";
import { sectionVariants } from "./CartAnimations";
import { useTranslations } from "next-intl";

interface IProps {
  itemCount: number;
  offerGroupCount?: number;
  onClearCart: () => void;
}

const CartHeader = ({ itemCount, offerGroupCount = 0, onClearCart }: IProps) => {
  const t = useTranslations("cart");
  const totalCount = itemCount + offerGroupCount;

  return (
    <motion.div
      variants={sectionVariants}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ShoppingBag className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t("yourOrder")}
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            {t("itemsInCart", { count: totalCount })}
          </p>
        </div>
      </div>

      {totalCount > 0 && (
        <button
          onClick={onClearCart}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border transition-colors duration-200 hover:border-destructive/60 hover:text-destructive hover:bg-destructive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={t("clearAllAria")}
          type="button"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
          {t("clearAll")}
        </button>
      )}
    </motion.div>
  );
};

export default CartHeader;
