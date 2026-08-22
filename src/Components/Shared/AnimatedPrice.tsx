"use client";

import * as React from "react";
import { animate } from "framer-motion";

/** Matches the project-wide premium easing curve. */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Animates between numeric values whenever `value` changes — used for live
 * price updates (subtotal, delivery, total) so numbers never snap instantly.
 */
export function AnimatedPrice({
  value,
  format,
  duration = 0.45,
  className,
}: {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = React.useState(value);
  const prevRef = React.useRef(value);

  React.useEffect(() => {
    const controls = animate(prevRef.current, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
    });
    prevRef.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={className}>
      {format ? format(display) : Math.round(display).toLocaleString()}
    </span>
  );
}
