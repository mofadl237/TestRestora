"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { ShoppingBag } from "lucide-react";
import { IconNext } from "@/src/lib/i18n/DirectionalIcons";
import { emptyCartVariants } from "./CartAnimations";

const EmptyCart = () => {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");

  return (
    <motion.div
      variants={emptyCartVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {/* Illustration container */}
      <div className="relative mb-8">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 -z-10 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* Main icon ring */}
        <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-border bg-card shadow-inner">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShoppingBag className="h-8 w-8 text-primary" aria-hidden />
          </div>
        </div>

        {/* Decorative dots */}
        <div
          className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-primary/20"
          aria-hidden
        />
        <div
          className="absolute -bottom-1 -left-3 h-3 w-3 rounded-full bg-primary/15"
          aria-hidden
        />
        <div
          className="absolute right-4 bottom-0 h-2 w-2 rounded-full bg-primary/10"
          aria-hidden
        />
      </div>

      {/* Text */}
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        {t("emptyTitle")}
      </h2>
      <p className="mb-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
        {t("emptyDescription")}
      </p>

      {/* CTA */}
      <Link
        href="/menu"
        id="empty-cart-browse-menu"
        className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {tCommon("menu")}
        <IconNext
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
          aria-hidden
        />
      </Link>
    </motion.div>
  );
};

export default EmptyCart;
