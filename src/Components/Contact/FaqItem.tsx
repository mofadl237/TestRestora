"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { EASE } from "./animations";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const buttonId = `${id}-button`;
  const panelId = `${id}-panel`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_2px_8px_0_oklch(0.493_0.128_33_/_0.05)]">
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-6 sm:py-5"
        >
          <span
            className={`text-base font-medium transition-colors duration-300 ${
              open ? "text-primary" : "text-foreground"
            }`}
          >
            {question}
          </span>
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
              open
                ? "rotate-45 border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
