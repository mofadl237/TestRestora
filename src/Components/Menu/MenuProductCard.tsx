"use client";

import { AddToCartDialog } from "@/src/Components/Product/AddToCartDialog";
import { formattePrice, calcMinDisplayPrice } from "@/lib/utils";
import type { IHomeProduct, IProduct } from "@/src/Interfaces";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { memo, useState } from "react";

const IMAGE_FALLBACK = "/images/pizza1.png";

interface IProps {
  product: IHomeProduct | IProduct;
  index: number;
}

export const MenuProductCard = memo(function MenuProductCard({
  product,
  index,
}: IProps) {
  const t = useTranslations("menu");
  const [open, setOpen] = useState(false);

  const variants = "variants" in product ? product.variants : undefined;
  const hasVariants = !!variants?.length;
  const startingPrice = hasVariants
    ? calcMinDisplayPrice(
        product.basePrice,
        variants.map((variant) => variant.price),
      )
    : product.basePrice;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.18,
          delay: Math.min(index * 0.02, 0.24),
          ease: "easeOut",
        }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-[border-color,box-shadow] duration-300 hover:border-border hover:shadow-[0_6px_20px_-6px_rgba(0,0,0,0.25)] focus-visible:outline-none"
      >
        {/* Product image */}
        <div
          className="relative aspect-[4/3] w-full overflow-hidden bg-muted"
          data-cart-source-image={product.id}
        >
          <Image
            src={product.image || IMAGE_FALLBACK}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            loading="lazy"
          />
        </div>

        {/* Name + starting price */}
        <div className="flex flex-1 flex-col justify-between gap-1 px-2.5 pb-2.5 pt-2">
          <p className="line-clamp-1 text-[12.5px] font-semibold leading-snug text-foreground">
            {product.name}
          </p>
          <p className="flex items-baseline gap-1 text-[12px]">
            {hasVariants && (
              <span className="font-medium text-muted-foreground">
                {t("fromPrice")}
              </span>
            )}
            <span className="font-semibold text-primary">
              {formattePrice(startingPrice)}
            </span>
          </p>
        </div>
      </motion.article>

      {/* Dialog is portaled to body — the hidden wrapper only hides the trigger button */}
      <div className="hidden">
        <AddToCartDialog
          product={product as never}
          open={open}
          onClose={() => setOpen(false)}
        />
      </div>
    </>
  );
});
