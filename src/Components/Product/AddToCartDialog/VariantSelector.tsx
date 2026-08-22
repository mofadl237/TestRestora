"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { motion, Variants } from "framer-motion";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { formattePrice } from "@/lib/utils";
import type { IProductVariant } from "./types";

interface IProps {
  variants: IProductVariant[];
  baseVariantPrice: number;
  value: string;
  onValueChange: (id: string) => void;
}

function formatVariantPrice(
  price: number,
  basePrice: number,
  t: (key: string) => string,
): string {
  const diff = price - basePrice;
  if (diff <= 0) return t("included");
  return `+${formattePrice(diff)}`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2.5">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/70">
        {children}
      </span>
      <div className="h-px flex-1 bg-border/80" />
    </div>
  );
}

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 5, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function VariantSelector({
  variants,
  baseVariantPrice,
  value,
  onValueChange,
}: IProps) {
  const t = useTranslations("cart");

  if (!variants.length) return null;

  return (
    <div>
      <SectionLabel>{t("chooseSize")}</SectionLabel>

      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        name="variantId"
        className="flex flex-col gap-2"
      >
        <motion.div
          className="contents"
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {variants.map((variant) => {
            const selected = value === variant.id;

            return (
              <motion.div
                key={variant.id}
                variants={cardVariants}
                animate={{
                  scale: selected ? 1.02 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <RadioGroupItem
                  value={variant.id}
                  id={`variant-${variant.id}`}
                  className="sr-only"
                />

                <Label
                  htmlFor={`variant-${variant.id}`}
                  className={cn(
                    "relative flex cursor-pointer items-center justify-between overflow-hidden rounded-2xl border p-3 transition-all duration-300",
                    selected
                      ? "border-primary bg-primary/10 shadow-[0_0_0_1px_hsl(var(--primary))]"
                      : "border-border bg-card hover:border-primary/40 hover:bg-accent/40"
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-2">
  <span
    className={cn(
      "text-sm font-semibold transition-colors",
      selected ? "text-primary" : "text-foreground"
    )}
  >
    {variant.name}
  </span>

  <span
    className={cn(
      "text-sm font-medium whitespace-nowrap transition-colors",
      selected ? "text-primary" : "text-muted-foreground"
    )}
  >
    {formatVariantPrice(variant.price, baseVariantPrice, t)}
  </span>
</div>

                  <motion.div
                    animate={{
                      scale: selected ? 1 : 0.8,
                      opacity: selected ? 1 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                </Label>
              </motion.div>
            );
          })}
        </motion.div>
      </RadioGroup>
    </div>
  );
}