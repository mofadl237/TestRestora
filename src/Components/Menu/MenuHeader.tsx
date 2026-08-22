"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export function MenuHeader() {
  const t = useTranslations("menu");
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <div className="flex items-center justify-between px-0 py-3">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {isArabic ? (
          <ArrowRight className="h-3.5 w-3.5" />
        ) : (
          <ArrowLeft className="h-3.5 w-3.5" />
        )}
        {t("back")}
      </Link>
      <h1 className="text-[15px] font-semibold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <div className="w-14" />
    </div>
  );
}
