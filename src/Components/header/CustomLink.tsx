"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/src/i18n/routing";

interface IProps {
  href: string;
  label: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  className?: string;
  onNavigate?: () => void;
  transitionDelay?: number;
}

const CustomLink = ({
  href,
  label,
  target,
  className,
  onNavigate,
  transitionDelay = 0,
}: IProps) => {
  const pathname = usePathname();
  const locale = useLocale();

  const normalizedHref = href.startsWith("/") ? href : `/${href}`;
  const normalizedPathname = pathname.startsWith(`/${locale}`)
    ? pathname.slice(locale.length + 1) || "/"
    : pathname;

  const isActive =
    normalizedPathname === normalizedHref ||
    (normalizedHref !== "/" && normalizedPathname.startsWith(normalizedHref));

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 24,
        delay: transitionDelay,
      }}
      className="relative"
    >
      {isActive ? (
        <motion.span
          layoutId="nav-indicator"
          className="absolute inset-0 rounded-full bg-secondary ring-1 ring-border/70"
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
        />
      ) : null}

      <Link
        href={href}
        target={target}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "relative z-10 inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors duration-300",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground",

          className,
        )}
      >
        {label}
      </Link>
    </motion.div>
  );
};

export default CustomLink;
