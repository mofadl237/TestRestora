"use client";

import { motion } from "framer-motion";
import { MenuProductCard } from "./MenuProductCard";
import type { ICategory, IHomeProduct, IProduct } from "@/src/Interfaces";

interface CategoryGroup {
  category: ICategory;
  products: Array<IHomeProduct | IProduct>;
}

interface IProps {
  categoryGroups: CategoryGroup[];
}

export function MenuProductsGrid({ categoryGroups }: IProps) {
  return (
    <div className="space-y-5 pt-3">
      {categoryGroups.map(({ category, products }, groupIndex) => (
        <motion.section
          key={category.id}
          id={`cat-${category.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, delay: groupIndex * 0.04 }}
        >
          <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {category.name}
          </h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-2.5 lg:grid-cols-4 ">
            {products.map((product, index) => (
              <MenuProductCard
                key={product.id}
                product={product}
                index={groupIndex * 6 + index}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
