/**
 * Lightweight Egyptian mobile-number validation used by the website template.
 * The canonical normalization lives in the Restora server; this helper is
 * client-side UX only and accepts the same formats.
 */

export function isValidEgyptianPhone(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;
  const digits = value.replace(/\D/g, "");
  if (/^0(10|11|12|15)\d{8}$/.test(digits)) return true;
  if (/^20(10|11|12|15)\d{8}$/.test(digits)) return true;
  return false;
}
