"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/src/i18n/routing";
import { routing } from "@/src/i18n/routing";
import { useSearchParams } from "next/navigation";
import { usePublicSettings } from "@/src/Components/Footer";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const publicSettings = usePublicSettings();

  const supportedLanguages = publicSettings?.localization.supportedLanguages;
  const localeOptions = routing.locales.filter(
    (code) =>
      code === "it" ||
      !supportedLanguages ||
      supportedLanguages.includes(code),
  );

  if (localeOptions.length < 2) {
    return null;
  }

  const handleLanguageChange = (nextLocale: string) => {
    if (nextLocale !== locale) {
      const query = searchParams.toString();

      router.replace(query ? `${pathname}?${query}` : pathname, {
        locale: nextLocale,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="rounded-full cursor-pointer shrink-0"
          />
        }
      >
        <Globe className="h-[18px] w-[18px]" />
        <span className="sr-only">{t("language")}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {t("currentLanguage")}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {localeOptions.map((code) => (
            <DropdownMenuItem
              key={code}
              className={
                locale === code
                  ? "font-bold text-primary data-[highlighted]:bg-primary/10"
                  : "font-medium"
              }
              onClick={() => handleLanguageChange(code)}
            >
              {t(`languages.${code}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
