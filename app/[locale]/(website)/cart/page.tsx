import { getTranslations } from "next-intl/server";
import Cart from "@/src/Components/Cart/Cart";
import MainSection from "@/src/Components/MainSection";

const page = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart.page" });

  return (
    <main>
      <MainSection subTitle={t("subtitle")} title={t("title")} />
      <Cart />
    </main>
  );
};

export default page;
