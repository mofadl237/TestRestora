"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface IProps {
  initialValue: string;
}

export function MenuSearch({ initialValue }: IProps) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isArabic = locale === "ar";
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState(searchParams.get("q") ?? initialValue);
  const [focused, setFocused] = useState(false);

  // Debounced URL sync — native History API only, so this never triggers a
  // Next.js navigation/RSC refetch (the menu page re-executes its Prisma
  // queries on every router.replace since it's dynamically rendered).
  // Filtering itself is 100% client-side (see MenuPageClient's useMemo).
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const trimmed = value.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      window.history.replaceState(null, "", `${pathname}?${params.toString()}`);
    }, 250);
    return () => clearTimeout(timer);
  }, [value, pathname]);

  // "/" focuses the search box from anywhere on the page; Escape clears it.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === inputRef.current) {
        setValue("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const clear = useCallback(() => {
    setValue("");
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className={`flex items-center gap-2.5 rounded-[0.875rem] border bg-card/80 px-3.5 py-2.5 backdrop-blur-sm transition-all duration-150 ${
        focused
          ? "border-primary/40 ring-2 ring-primary/15"
          : "border-border/60"
      }`}
    >
      <Search className="h-[15px] w-[15px] shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={t("search.placeholder")}
        aria-label={t("search.placeholder")}
        dir={isArabic ? "rtl" : "ltr"}
        className="min-w-0 flex-1 bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            key="clear"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.1 }}
            onClick={clear}
            type="button"
            aria-label={t("search.clear")}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted-foreground/25 text-muted-foreground transition-colors hover:bg-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-2.5 w-2.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
