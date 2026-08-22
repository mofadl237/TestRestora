import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import ProgressBar from "./ProgressBar";
import ProgressRing from "./ProgressRing";
import { getTextItemVariants } from "./sliderVariants";
import { SliderControlProps } from "@/src/Interfaces";
import { cn } from "@/lib/utils";

const HeroController = (props: SliderControlProps) => {
  const { slides, activeIndex, goToSlide, duration, autoplayKey } = props;
  const t = useTranslations("hero");
  const isRTL = useLocale() === "ar";
  const textItemVariants = getTextItemVariants(isRTL);

  return (
    <motion.div variants={textItemVariants} className="w-full">
      {/* Mobile Dots */}
      <div className="flex justify-center gap-3 md:hidden">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <motion.button
              key={slide.id}
              onClick={() => goToSlide(index)}
              animate={{
                width: isActive ? 30 : 12,
              }}
              transition={{
                duration: 0.3,
              }}
              className="

relative
h-3
overflow-hidden
rounded-full
bg-primary/30
"
              aria-label={t("goToSlide", { number: index + 1 })}
            >
              {isActive && (
                <ProgressBar
                  {...props}
                  className="absolute left-0 top-0 h-full w-full rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Desktop Image Controllers */}
      <div className="hidden justify-start md:flex">
        <div className="flex flex-nowrap gap-4">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            return (
              <div
                key={slide.id}
                className="relative flex flex-col items-center"
              >
                <motion.button
                  onClick={() => goToSlide(index)}
                  whileHover={{
                    scale: 1.05,
                    y: -4,
                  }}
                  animate={{
                    scale: isActive ? 1 : 0.82,
                    opacity: isActive ? 1 : 0.45,
                    filter: isActive ? "blur(0px)" : "blur(1px)",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "relative h-16 w-16 cursor-pointer rounded-full lg:h-[68px] lg:w-[68px]",
                    isActive
                      ? "shadow-[0_0_28px_-6px_color-mix(in_oklch,var(--primary)_55%,transparent)]"
                      : "border border-white/10",
                  )}
                  aria-label={t("goToNamedSlide", { title: slide.title })}
                >
                  {isActive && (
                    <ProgressRing
                      duration={duration}
                      autoplayKey={autoplayKey}
                      activeIndex={activeIndex}
                    />
                  )}
                  <span
                    className={cn(
                      "relative block h-full w-full overflow-hidden rounded-full",
                      isActive && "progress-ring-float",
                    )}
                    style={
                      isActive
                        ? {
                            animation:
                              "progress-ring-float 5s ease-in-out infinite",
                          }
                        : undefined
                    }
                  >
                    <Image
                      src={slide.thumbnail}
                      alt={slide.title}
                      fill
                      className="rounded-full object-cover"
                      sizes="80px"
                    />
                  </span>
                </motion.button>
                <div className="absolute -bottom-3 left-0 right-0 h-1.5 overflow-hidden rounded-full bg-white/10">
                  {isActive && <ProgressBar {...props} className="h-full" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default HeroController;
