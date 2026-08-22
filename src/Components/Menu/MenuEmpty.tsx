"use client";

import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";

export function MenuEmpty() {
  const t = useTranslations("menu");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className="relative mb-4"
      >
        <span className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl border border-border/60 bg-card shadow-sm">
          <SearchX className="h-6 w-6 text-muted-foreground" />
        </div>
      </motion.div>
      <h3 className="text-base font-semibold text-foreground">
        {t("empty.title")}
      </h3>
      <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-muted-foreground">
        {t("empty.description")}
      </p>
    </motion.div>
  );
}
