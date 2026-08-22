"use client";

import { useLocaleDirection } from "./useLocaleDirection";

/**
 * Hook providing Framer Motion animation variants that automatically
 * adapt to LTR/RTL layouts (e.g. flipping X coordinates).
 */
export function useDirectionalAnimations() {
  const { isRTL } = useLocaleDirection();

  const EASE = [0.22, 1, 0.36, 1];

  const slideFromStart = (offset = 20, duration = 0.5) => ({
    hidden: { opacity: 0, x: isRTL ? offset : -offset },
    visible: { opacity: 1, x: 0, transition: { duration, ease: EASE } },
    exit: {
      opacity: 0,
      x: isRTL ? offset : -offset,
      transition: { duration, ease: EASE },
    },
  });

  const slideFromEnd = (offset = 20, duration = 0.5) => ({
    hidden: { opacity: 0, x: isRTL ? -offset : offset },
    visible: { opacity: 1, x: 0, transition: { duration, ease: EASE } },
    exit: {
      opacity: 0,
      x: isRTL ? -offset : offset,
      transition: { duration, ease: EASE },
    },
  });

  const drawerFromStart = {
    hidden: { x: isRTL ? "100%" : "-100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: EASE } },
    exit: {
      x: isRTL ? "100%" : "-100%",
      transition: { duration: 0.3, ease: EASE },
    },
  };

  const drawerFromEnd = {
    hidden: { x: isRTL ? "-100%" : "100%" },
    visible: { x: 0, transition: { duration: 0.3, ease: EASE } },
    exit: {
      x: isRTL ? "-100%" : "100%",
      transition: { duration: 0.3, ease: EASE },
    },
  };

  const fadeUp = (offset = 20, duration = 0.4) => ({
    hidden: { opacity: 0, y: offset },
    visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
    exit: { opacity: 0, y: offset, transition: { duration, ease: EASE } },
  });

  return {
    slideFromStart,
    slideFromEnd,
    drawerFromStart,
    drawerFromEnd,
    fadeUp,
    EASE,
  };
}
