"use client";
import { formattePrice } from "@/lib/utils";
import { IProduct } from "@/src/Interfaces";
import { motion, Variants } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";

interface IProps {
  product: IProduct;
  index: number;
  action?: ReactNode;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      delay: i * 0.1,
    },
  }),
};

const CardProduct = ({ product, index, action }: IProps) => {
  const { basePrice, description, image, name } = product;
  const tCommon = useTranslations("common");
  const tMenu = useTranslations("menu");

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      whileHover={{
        y: -6,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground"
      style={{
        boxShadow:
          "0 2px 8px 0 oklch(0.62 0.2 50 / 0.06), 0 1px 2px 0 oklch(0.215 0.017 28 / 0.04)",
      }}
    >
      {/* ── Image hero ── */}
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={image || "/placeholder.png"}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-[1.04]"
          priority={index < 3}
        />

        {/* Bottom gradient — image melts into card body */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{
            background:
              "linear-gradient(to top, var(--color-card) 0%, transparent 100%)",
          }}
        />

        {/* Category badge */}
        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur-sm">
            {tCommon("menu")}
          </span>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-3">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          {name}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {description}
        </p>

        {/* Price row */}
        <div className="mt-4 mb-3 flex items-baseline gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            {tMenu("fromPrice")}
          </span>
          <span className="text-2xl font-bold tracking-tight text-primary">
            {formattePrice(basePrice)}
          </span>
        </div>

        {action}
      </div>
    </motion.div>
  );
};

export default CardProduct;
