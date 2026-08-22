/**
 * Locale-resolution helpers shared by every server query that reads a
 * Translation table (CategoryTranslation, ProductTranslation, etc).
 * Centralised here so translation-picking logic is never duplicated.
 */

/** Locale used when a translation is missing for the requested locale. */
export const DEFAULT_LOCALE = "en";

/**
 * Locales to fetch from the database for a given request: the requested
 * locale plus the fallback, deduplicated. Keeps translation queries narrow —
 * never fetch every locale, only what can possibly be rendered.
 */
export function localesToFetch(locale: string): string[] {
  return Array.from(new Set([locale, DEFAULT_LOCALE]));
}

/**
 * Pick the best-matching translation row for a locale, falling back to
 * English, then to whatever translation happens to be present.
 */
export function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: string,
): T | undefined {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === DEFAULT_LOCALE) ??
    translations[0]
  );
}
