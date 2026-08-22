import { useLocale } from "next-intl";

export function useLocaleDirection() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const direction = isRTL ? "rtl" : "ltr";

  // Tailwind handles mapping these logically if we use standard utility classes
  // However, returning raw values can be useful for inline styles or libraries
  const start = isRTL ? "right" : "left";
  const end = isRTL ? "left" : "right";

  return {
    locale,
    isRTL,
    direction,
    start,
    end,
  };
}
