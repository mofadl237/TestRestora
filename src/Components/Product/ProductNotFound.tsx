"use client";

import { PackageX } from "lucide-react";
import React from "react";
import { useTranslations } from "next-intl";

const ProductNotFound = () => {
  const t = useTranslations("product");

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center h-full p-8">
      <PackageX className="h-16 w-16 text-muted-foreground" strokeWidth={1.5} />
      <h3 className="text-2xl font-semibold tracking-tight text-foreground">
        {t("notFoundTitle")}
      </h3>
      <p className="text-muted-foreground">
        {t("notFoundDescription")}
      </p>
    </div>
  );
};

export default ProductNotFound;
