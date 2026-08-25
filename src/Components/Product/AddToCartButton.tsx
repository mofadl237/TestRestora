"use client";

import { useLocale } from "next-intl";
import { useGetProductByIdQuery } from "@/src/store/api/publicApi";
import { useActiveBranchId } from "@/src/store/features/BranchSlice";
import ProductNotFound from "./ProductNotFound";
import { AddToCartDialog } from "./AddToCartDialog";

interface IProps {
  id: string;
}

export function AddToCartButton({ id }: IProps) {
  const locale = useLocale();
  const branchId = useActiveBranchId();
  const { data: product, isError } = useGetProductByIdQuery({ id, locale, branchId });

  if (isError) return <ProductNotFound />;
  if (!product) return null;

  return <AddToCartDialog product={product} />;
}
