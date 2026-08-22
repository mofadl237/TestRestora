"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  onCartLand,
  offCartLand,
  registerCartTarget,
  unregisterCartTarget,
} from "@/lib/cartAnimations";
import { Link } from "@/src/i18n/routing";
import { RootState } from "@/src/store/store";

export function CartButton() {
  const t = useTranslations("common");
  const items = useSelector((state: RootState) => state.cart.items);
  const offerGroups = useSelector((state: RootState) => state.cart.offerGroups);
  const count =
    items.reduce((sum, item) => sum + item.quantity, 0) +
    offerGroups.reduce((sum, og) => sum + og.quantity, 0);

  const linkRef = useRef<HTMLAnchorElement | null>(null);
  const [pulse, setPulse] = useState(0);
  const pulseRef = useRef(0);

  useEffect(() => {
    const el = linkRef.current;
    if (!el) return;
    registerCartTarget(el);
    return () => unregisterCartTarget();
  }, []);

  useEffect(() => {
    const handleLand = () => {
      pulseRef.current += 1;
      setPulse(pulseRef.current);
    };
    onCartLand(handleLand);
    return () => offCartLand(handleLand);
  }, []);

  return (
    <Link
      href="/cart"
      ref={linkRef}
      aria-label={t("openCart")}
      className="group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors duration-300 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <motion.span
        key={pulse}
        initial={pulse > 0 ? { scale: 0.9 } : false}
        animate={
          pulse > 0
            ? { scale: [0.9, 1.18, 1], rotate: [0, -7, 7, 0] }
            : { scale: 1 }
        }
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-center justify-center"
      >
        <ShoppingCart className="h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110" />
      </motion.span>

      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="cart-badge"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 24 }}
            className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center overflow-hidden rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground shadow-md ring-2 ring-background"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={count}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -16, opacity: 0 }}
                transition={{ type: "spring", stiffness: 520, damping: 32 }}
                className="tabular-nums"
              >
                {count}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        )}
      </AnimatePresence>

      {pulse > 0 && (
        <motion.span
          key={`cart-pulse-ring-${pulse}`}
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary/60"
          aria-hidden
        />
      )}
    </Link>
  );
}
