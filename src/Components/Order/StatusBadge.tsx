"use client";

import { useTranslations } from "next-intl";

interface IProps {
  status: string;
  size?: "sm" | "md";
}

const STATUS_CLASS: Record<string, string> = {
  PENDING: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  CONFIRMED: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
  PREPARING: "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  READY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  OUT_FOR_DELIVERY: "border-primary/30 bg-primary/10 text-primary",
  DELIVERED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  COMPLETED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  CANCELLED: "border-destructive/30 bg-destructive/10 text-destructive",
};

export function StatusBadge({ status, size = "md" }: IProps) {
  const t = useTranslations("order");
  const cfgKey = STATUS_CLASS[status] ? status : "PENDING";
  const sizeClass =
    size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider ${sizeClass} ${STATUS_CLASS[cfgKey]}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-80"
        aria-hidden
      />
      {t(`statuses.${cfgKey}`)}
    </span>
  );
}
