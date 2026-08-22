import type { Variants } from "framer-motion";

export const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.4 + delay },
  }),
};

/**
 * Text entrance variant. Content slides in from the reading-start side:
 * left-to-right in LTR locales, right-to-left in RTL locales.
 */
export const getTextItemVariants = (isRTL: boolean): Variants => ({
  hidden: { x: isRTL ? 24 : -24, y: 20, opacity: 0, filter: "blur(5px)" },
  visible: {
    x: 0,
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
});

const pct = (n: number) => `${n}%`;

const ENTER_X = [120, 90, 72, 55, 38, 20, 8, 0];
const ENTER_Y = [-120, -90, -72, -55, -38, -20, -8, 0];
const ENTER_SCALE = [0.01, 0.03, 0.06, 0.12, 0.25, 0.5, 0.8, 1.08, 1];
const ENTER_ROTATE = [30, 26, 22, 16, 10, 6, 3, 1, 0];
const ENTER_OPACITY = [0, 0.05, 0.15, 0.3, 0.5, 0.7, 0.9, 1, 1];
const ENTER_TIMES = [0, 0.08, 0.16, 0.28, 0.45, 0.62, 0.8, 0.94, 1];

const EXIT_X = [0, 6, 14, 28, 48, 72];
const EXIT_Y = [0, 30, 90, 170, 280, 420];
const EXIT_SCALE = [1, 0.95, 0.82, 0.68, 0.5, 0.28];
const EXIT_ROTATE = [0, 4, 8, 12, 18, 25];
const EXIT_OPACITY = [1, 0.98, 0.9, 0.7, 0.4, 0];
const EXIT_FILTER = [
  "blur(0px)",
  "blur(0px)",
  "blur(1px)",
  "blur(3px)",
  "blur(6px)",
  "blur(10px)",
];
const EXIT_TIMES = [0, 0.18, 0.36, 0.6, 0.82, 1];

/**
 * Hero image entrance/exit variants. Only the horizontal motion (x, rotate)
 * mirrors with locale direction — vertical motion, scale and opacity stay
 * identical so the visual identity is preserved in both LTR and RTL.
 */
export const getPizzaVariants = (isRTL: boolean): Variants => {
  const mirror = isRTL ? -1 : 1;

  return {
    enter: {
      x: ENTER_X.map((v) => pct(v * mirror)),
      y: ENTER_Y.map(pct),
      scale: ENTER_SCALE,
      rotate: ENTER_ROTATE.map((v) => v * mirror),
      opacity: ENTER_OPACITY,
      transition: {
        duration: 1.6,
        ease: [0.22, 1, 0.36, 1],
        times: ENTER_TIMES,
      },
    },

    center: {
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      opacity: 1,
    },

    exit: {
      x: EXIT_X.map((v) => pct(v * mirror)),
      y: EXIT_Y,
      scale: EXIT_SCALE,
      rotate: EXIT_ROTATE.map((v) => v * mirror),
      opacity: EXIT_OPACITY,
      filter: EXIT_FILTER,
      transition: {
        duration: 1.35,
        ease: [0.4, 0, 0.2, 1],
        times: EXIT_TIMES,
      },
    },
  };
};
