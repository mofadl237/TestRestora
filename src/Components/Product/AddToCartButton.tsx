"use client";

import { useLocale } from "next-intl";
import { useGetProductByIdQuery } from "@/src/store/api/publicApi";
import ProductNotFound from "./ProductNotFound";
import { AddToCartDialog } from "./AddToCartDialog";

interface IProps {
  id: string;
}

export function AddToCartButton({ id }: IProps) {
  const locale = useLocale();
  const { data: product, isError } = useGetProductByIdQuery({ id, locale });

  if (isError) return <ProductNotFound />;
  if (!product) return null;

  return <AddToCartDialog product={product} />;
}
