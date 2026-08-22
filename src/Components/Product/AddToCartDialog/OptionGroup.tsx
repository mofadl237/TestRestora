"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { formattePrice } from "@/lib/utils";
import type { IOptionGroup } from "./types";

interface IProps {
  group: IOptionGroup;
  checkedOptions: Record<string, boolean>;
  onToggle: (optionId: string) => void;
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

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

function formatOptionPrice(price: number, t: (key: string) => string): string {
  if (price <= 0) return t("free");
  return `+${formattePrice(price)}`;
}

/* ── Animation variants ───────────────────────────────────────────────── */

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 5, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ── Component ─────────────────────────────────────────────────────────── */

export function OptionGroup({ group, checkedOptions, onToggle }: IProps) {
  const t = useTranslations("cart");

  return (
    <div>
      <SectionLabel>{group.name}</SectionLabel>
      <motion.div
        className="flex flex-col gap-2"
        variants={listVariants}
        initial="hidden"
        animate="visible"
      >
        {group.options.map((option) => {
          const isChecked = !!checkedOptions[option.id];
          return (
            <motion.div key={option.id} variants={cardVariants}>
              <motion.div
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onClick={() => onToggle(option.id)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    onToggle(option.id);
                  }
                }}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
                animate={{
                  borderColor: isChecked ? "var(--primary)" : "var(--border)",
                  backgroundColor: isChecked
                    ? "color-mix(in oklch, var(--primary) 5%, var(--card))"
                    : "var(--card)",
                }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex cursor-pointer select-none items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{
                  boxShadow: isChecked
                    ? "inset 0 0 0 1px var(--primary)"
                    : "none",
                }}
              >
                <span className="text-sm font-semibold text-foreground">
                  {option.name}
                </span>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">
                    {formatOptionPrice(option.price, t)}
                  </span>
                  <Checkbox
                    id={option.id}
                    name={`option-${option.id}`}
                    checked={isChecked}
                    onCheckedChange={() => onToggle(option.id)}
                    className="pointer-events-none h-4 w-4 shrink-0"
                    tabIndex={-1}
                    aria-hidden
                  />
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
