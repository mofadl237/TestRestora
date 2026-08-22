import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTextItemVariants } from "./sliderVariants";

const ShopButton = () => {
  const t = useTranslations("hero");
  const isRTL = useLocale() === "ar";

  return (
    <motion.div
      variants={getTextItemVariants(isRTL)}
      className="flex justify-center md:justify-start"
    >
      <Link
        href="/menu"
        className={cn(
          buttonVariants({ size: "lg" }),
          "font-semibold w-full sm:w-auto",
        )}
      >
        {t("shopNow")}
      </Link>
    </motion.div>
  );
};

export default ShopButton;
