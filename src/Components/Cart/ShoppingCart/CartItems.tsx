"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ICartProduct } from "@/src/store/features/CartSlice";
import Product from "../Product";
import { cartItemVariants, pageVariants } from "./CartAnimations";

interface IProps {
  items: ICartProduct[];
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  editLoading?: boolean;
}

const CartItems = ({
  items,
  onRemove,
  onEdit,
  onIncrease,
  onDecrease,
  editLoading = false,
}: IProps) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div
            key={item.id}
            variants={cartItemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md"
            style={{
              boxShadow:
                "0 1px 6px 0 oklch(0.62 0.2 50 / 0.06), 0 1px 2px 0 oklch(0.215 0.017 28 / 0.03)",
            }}
            whileHover={{
              y: -2,
              transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
            }}
          >
            {/* Subtle start accent bar */}
            <div
              className="absolute start-0 top-0 h-full w-0.5 rounded-e-full bg-primary/30"
              aria-hidden
            />

            <div className="p-4 ps-5">
              <Product
                item={item}
                onRemove={onRemove}
                onEdit={onEdit}
                onIncrease={onIncrease}
                onDecrease={onDecrease}
                editLoading={editLoading}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default CartItems;
