import { type Variants } from "framer-motion";

/** Shared easing — matches the rest of the project */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const spring = { type: "spring", stiffness: 400, damping: 26 } as const;

/** Delivery selector block entrance */
export const zoneSelectorVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

/** Delivery summary card — crossfade between zones */
export const deliverySummaryVariants: Variants = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: { duration: 0.22, ease: EASE },
  },
};

/** Info rows inside the delivery summary card — subtle stagger */
export const summaryRowsVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export const summaryRowVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: EASE } },
};

/** "FREE" badge swap */
export const freeBadgeVariants: Variants = {
  hidden: { opacity: 0, y: 6, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.9,
    transition: { duration: 0.2, ease: EASE },
  },
};
