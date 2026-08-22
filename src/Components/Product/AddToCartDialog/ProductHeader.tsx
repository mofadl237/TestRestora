"use client";

import { DialogClose } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type { IProductWithOptions } from "./types";

interface IProps {
  product: IProductWithOptions;
}

export function ProductHeader({ product }: IProps) {
  const t = useTranslations("common");
  return (
    <div className="shrink-0 bg-card/95 backdrop-blur-xl">
      {/* ── Hero image ── */}
      <div className="relative h-[7.5rem] w-full overflow-hidden sm:h-40">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.06, opacity: 0, filter: "blur(6px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={product.image || "/images/pizza1.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Cinematic gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 18%, transparent) 0%, transparent 38%, transparent 55%, var(--color-card) 100%)",
          }}
        />

        {/* Close button */}
        <motion.div
          className="absolute right-3 top-3 sm:right-4 sm:top-4"
          initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.22, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <DialogClose>
            <motion.button
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground/75 shadow-sm backdrop-blur-md transition-colors duration-200 hover:border-border hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={t("closeDialog")}
            >
              <X className="h-4 w-4" aria-hidden />
            </motion.button>
          </DialogClose>
        </motion.div>
      </div>

      {/* ── Product info ── */}
      <motion.div
        initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="px-4 pb-3 pt-3 sm:px-5 sm:pb-4 sm:pt-3.5"
      >
        <div className="space-y-1 text-left">
          <h2 className="text-[1.05rem] font-semibold tracking-tight text-foreground sm:text-[1.2rem]">
            {product.name}
          </h2>
          <p className="line-clamp-2 text-[13px] leading-5 text-muted-foreground sm:text-sm">
            {product.description}
          </p>
        </div>
      </motion.div>

      <div className="h-px bg-border/70" />
    </div>
  );
}
