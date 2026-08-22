import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { FaAward } from "react-icons/fa";
import HeroController from "./HeroController";
import ShopButton from "./ShopButton";
import { textContainerVariants, getTextItemVariants } from "./sliderVariants";
import { Slide, SliderControlProps } from "@/src/Interfaces";

interface HeroContentProps extends SliderControlProps {
  activeSlide: Slide;
}

const HeroContent = ({ activeSlide, ...controlProps }: HeroContentProps) => {
  const t = useTranslations("hero");
  const isRTL = useLocale() === "ar";
  const textItemVariants = getTextItemVariants(isRTL);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="order-2 min-h-[200px] flex flex-col gap-6 text-center md:order-1 md:gap-8 md:text-start"
    >
      {/* --- Static Section --- */}
      <motion.div variants={textContainerVariants} custom={0}>
        <motion.div
          variants={textItemVariants}
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
        >
          <FaAward />
          <span>{t("badge")}</span>
        </motion.div>
      </motion.div>

      {/* --- Dynamic Section --- */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={activeSlide.id}
          variants={textContainerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          custom={0.2}
          className="space-y-4 min-h-[150px] "
        >
          <motion.p
            variants={textItemVariants}
            className="font-semibold uppercase tracking-[0.2em] text-primary"
          >
            {activeSlide.subtitle}
          </motion.p>
          <motion.h1
            variants={textItemVariants}
            className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            {activeSlide.title}
          </motion.h1>
          <motion.p
            variants={textItemVariants}
            className="mx-auto max-w-md text-lg text-muted-foreground md:mx-0"
          >
            {activeSlide.description}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      <ShopButton />
      <HeroController {...controlProps} />
    </motion.div>
  );
};

export default HeroContent;
