import { type Variants } from "framer-motion";

/** Shared easing — matches the rest of the project */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Page / section entrance — stagger children */
export const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Fade + slide up — generic section entrance */
export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

/** Cart item card — entrance */
export const cartItemVariants: Variants = {
  hidden: { opacity: 0, x: -16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: EASE },
  },
  /** AnimatePresence exit — slide right and fade */
  exit: {
    opacity: 0,
    x: 40,
    filter: "blur(6px)",
    transition: { duration: 0.3, ease: EASE },
  },
};

/** Summary card entrance */
export const summaryVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE, delay: 0.12 },
  },
};

/** Checkout form entrance */
export const checkoutVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: EASE, delay: 0.2 },
  },
};

/** Empty-cart illustration */
export const emptyCartVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE },
  },
};

/** Submit button pulse on hover */
export const buttonHoverVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.015, transition: { duration: 0.2, ease: EASE } },
  tap: { scale: 0.97, transition: { duration: 0.12, ease: EASE } },
};
