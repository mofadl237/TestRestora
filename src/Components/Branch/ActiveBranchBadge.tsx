"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useBranchContext } from "./BranchGate";

/**
 * Small "ordering from <branch>" confirmation shown before final checkout
 * (and usable on other branch-scoped pages). Multi-branch only — single
 * branch restaurants render nothing.
 */
export function ActiveBranchBadge({ className }: { className?: string }) {
  const t = useTranslations("branches.checkout");
  const { activeBranch, isMultiBranch } = useBranchContext();

  if (!isMultiBranch || !activeBranch) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex items-center gap-2.5 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3",
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <MapPin className="size-4 text-primary" aria-hidden="true" />
      </span>
      <p className="text-sm leading-snug">
        <span className="text-muted-foreground">{t("label")} </span>
        <span className="font-semibold text-foreground">{activeBranch.name}</span>
      </p>
    </motion.div>
  );
}
