"use client";

import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";


export function QuantitySelector() {
  const t = useTranslations("common");

  return (
    <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border/70 bg-card/90 px-1 py-1">
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("decreaseQuantity")}
      >
        <Minus className="h-3.5 w-3.5" />
      </motion.button>

      <span className="min-w-[1.5rem] text-center text-sm font-bold tabular-nums text-foreground">
        1
      </span>

      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t("increaseQuantity")}
      >
        <Plus className="h-3.5 w-3.5" />
      </motion.button>
    </div>
  );
}
