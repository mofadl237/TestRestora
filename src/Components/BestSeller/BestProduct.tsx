"use client";

import { useLocale } from "next-intl";
import { useGetHomeQuery } from "@/src/store/api/publicApi";
import { useActiveBranchId } from "@/src/store/features/BranchSlice";
import { AddToCartDialog } from "../Product/AddToCartDialog";
import CardProduct from "../Product/CardProduct";

const BestProduct = () => {
  const locale = useLocale();
  const branchId = useActiveBranchId();
  const { data: home } = useGetHomeQuery({ locale, branchId });
  const products = home?.bestSellers ?? [];

  return (
    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
      {products.map((product, index) => {
        return (
          <CardProduct
            key={product.id}
            product={product}
            index={index}
            action={<AddToCartDialog product={product} />}
          />
        );
      })}
    </div>
  );
};

export default BestProduct;
