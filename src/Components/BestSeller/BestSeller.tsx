import React from "react";
import MainSection from "../MainSection";
import BestProduct from "./BestProduct";
import { useTranslations } from "next-intl";

const BestSeller = () => {
  const t = useTranslations();
  return (
    <section className="py-12 md:py-20 lg:py-28">
      <MainSection title={t("mainSection.bestSeller.title")} subTitle={t("mainSection.bestSeller.subTitle")} key={1} />
      <div className="container mx-auto px-4">
        <BestProduct />
      </div>
    </section>
  );
};

export default BestSeller;
