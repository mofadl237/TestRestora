/**
 * Currency helpers (Phase 1 architecture).
 *
 * Money is always stored as a plain number (Float). Display formatting must go
 * through `formatMoney` so currency codes/symbols never leak into JSX.
 *
 * The currency derives from the restaurant's country (Restaurant → Country),
 * never from the UI language. Phase 1 falls back to the platform default
 * currency (EGP) until tenant currency resolution is threaded server-side in
 * Phase 2. This module is pure and safe to import from client components.
 */

export const DEFAULT_CURRENCY_CODE = "EGP";

const CURRENCY_LOCALES: Record<string, string> = {
  EGP: "ar-EG",
  SAR: "ar-SA",
  KWD: "ar-KW",
  QAR: "ar-QA",
  AED: "ar-AE",
  JOD: "ar-JO",
};

/**
 * Format a number as money for the given currency.
 *
 * @param value      amount to format
 * @param currency   ISO 4217 code; defaults to the platform currency
 * @param locale     override locale (e.g. "ar", "en-US"); when omitted a
 *                   currency-appropriate locale is chosen
 */
export function formatMoney(
  value: number,
  currency: string = DEFAULT_CURRENCY_CODE,
  locale?: string,
): string {
  const usedLocale = locale ?? CURRENCY_LOCALES[currency] ?? "en-US";
  return new Intl.NumberFormat(usedLocale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Map a short app locale ("en" | "ar") to a formatting locale. */
export function localeFor(locale?: string): string | undefined {
  return locale === "ar" ? "ar-EG" : locale === "en" ? "en-US" : locale;
}
