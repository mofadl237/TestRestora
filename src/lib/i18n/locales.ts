export interface ILocaleInfo {
  code: string;
  label: string;
  dir: "ltr" | "rtl";
}

/**
 * Locales editable from the dashboard translation editors. Single source of
 * truth for the dynamic Translation Manager UI — never hardcode "en"/"ar" in
 * forms; always iterate these entries. Adding a language here (plus its
 * next-intl messages file and a routing.ts entry) extends every editor
 * without further code changes.
 */
export const DASHBOARD_LOCALES: readonly ILocaleInfo[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
] as const;

export function localeLabel(code: string): string {
  return DASHBOARD_LOCALES.find((l) => l.code === code)?.label ?? code;
}

export function localeDir(code: string): "ltr" | "rtl" {
  return DASHBOARD_LOCALES.find((l) => l.code === code)?.dir ?? "ltr";
}
