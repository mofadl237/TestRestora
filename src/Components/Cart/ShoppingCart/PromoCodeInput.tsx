"use client";

import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslations } from "next-intl";
import { Check, Loader2, Tag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RootState } from "@/src/store/store";
import {
  setPromoCode,
  clearPromoCode,
} from "@/src/store/features/CartSlice";
import { useValidatePromoCodeMutation } from "@/src/store/api/publicApi";
import type { IPromoCodeStatus } from "@/src/store/api/types";
import { formattePrice } from "@/lib/utils";

/** Maps backend status codes to i18n keys. */
const STATUS_KEY: Record<IPromoCodeStatus, string> = {
  valid: "",
  invalid: "invalid",
  expired: "expired",
  not_started: "notStarted",
  disabled: "disabled",
  exhausted: "exhausted",
  already_used: "alreadyUsed",
  first_order_only: "firstOrderOnly",
  minimum_order_not_met: "minimumOrderNotMet",
};

const PromoCodeInput = ({ cartSubtotal }: { cartSubtotal: number }) => {
  const t = useTranslations("cart.promoCode");
  const dispatch = useDispatch();

  const promo = useSelector((state: RootState) => state.cart.promoCode);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [validate, { isLoading }] = useValidatePromoCodeMutation();

  const handleApply = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setError(null);

    try {
      const result = await validate({
        code: trimmed,
        cartSubtotal,
      }).unwrap();

      if (result.status === "valid" && result.offerId) {
        dispatch(
          setPromoCode({
            code: trimmed.toUpperCase(),
            offerId: result.offerId,
            offerName: result.offerName ?? trimmed.toUpperCase(),
            offerType: result.offerType ?? "promo",
            discountType: result.discountType ?? "percentage",
            discountValue: result.discountValue ?? 0,
            estimatedDiscount: result.estimatedDiscount ?? 0,
          }),
        );
        setCode("");
        setError(null);
      } else {
        const key = STATUS_KEY[result.status] ?? "invalid";
        let msg = t(key);
        if (result.status === "minimum_order_not_met" && result.minimumOrder) {
          msg = t(key, { amount: formattePrice(result.minimumOrder) });
        }
        setError(msg);
      }
    } catch {
      setError(t("error"));
    }
  }, [code, cartSubtotal, validate, dispatch, t]);

  const handleRemove = useCallback(() => {
    dispatch(clearPromoCode());
    setError(null);
    setCode("");
  }, [dispatch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleApply();
    },
    [handleApply],
  );

  // Applied state
  if (promo) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15">
              <Check className="h-3.5 w-3.5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {t("applied", { code: promo.code })}
              </p>
              <p className="text-xs text-muted-foreground">
                {promo.discountType === "percentage"
                  ? t("discountLabel", { type: `${promo.discountValue}%` })
                  : t("discountValue", {
                      amount: formattePrice(promo.estimatedDiscount),
                    })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={t("remove")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Input state
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-1.5 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20">
        <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("placeholder")}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          disabled={isLoading}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={!code.trim() || isLoading}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            t("apply")
          )}
        </button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-xs text-destructive"
          >
            <X className="h-3 w-3 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromoCodeInput;
