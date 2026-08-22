import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";
import { getPizzaVariants } from "./sliderVariants";
import { Slide } from "@/src/Interfaces";

interface IProps {
  activeSlide: Slide;
  direction: number;
}

const HeroImage = ({ activeSlide, direction }: IProps) => {
  const isRTL = useLocale() === "ar";
  const pizzaVariants = getPizzaVariants(isRTL);

  return (
    <div className="pointer-events-none relative order-1 flex h-full w-full items-center justify-center md:order-2">
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={activeSlide.id}
          custom={direction}
          variants={pizzaVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute flex items-center justify-center"
        >
          {/* Floating Layer */}
          <motion.div
            animate={{
              y: [0, -8, 0],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: 1.4,
            }}
          >
            {/* Rotation Layer */}
            <motion.div
              animate={{
                rotate: [-2.5, 2.5, -2.5],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: 1.4,
              }}
              className="
                relative
                h-[240px] w-[240px]
                sm:h-[320px] sm:w-[320px]
                md:h-[380px] md:w-[380px]
                lg:h-[460px] lg:w-[460px]
                xl:h-[520px] xl:w-[520px]
                2xl:h-[560px] 2xl:w-[560px]
                drop-shadow-[0_40px_80px_rgba(0,0,0,.25)]
              "
            >
              <Image
                src={activeSlide.image}
                alt={activeSlide.title}
                fill
                priority={activeSlide.id === 1}
                className="object-contain select-none"
                draggable={false}
                sizes="(max-width:768px) 80vw,
                       (max-width:1200px) 45vw,
                       520px"
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default HeroImage;
