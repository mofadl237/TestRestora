"use client";

import { animate } from "framer-motion";

/**
 * Lightweight fly-to-cart coordination.
 *
 * The CartButton registers the element it renders as the landing target and
 * subscribes to the "land" event. Any component that adds a product to the
 * cart calls `flyToCart()` with an optional source rectangle; a lightweight
 * image clone animates from there to the cart icon, then the landing event
 * fires so the icon can spring and the badge can pop.
 *
 * This is deliberately dependency-free (no Redux, no context) so it works
 * from anywhere without extra re-renders.
 */

type LandSubscriber = () => void;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

let cartTarget: HTMLElement | null = null;
const landSubscribers = new Set<LandSubscriber>();

export function registerCartTarget(el: HTMLElement | null) {
  cartTarget = el;
}

export function unregisterCartTarget() {
  cartTarget = null;
}

export function onCartLand(cb: LandSubscriber) {
  landSubscribers.add(cb);
  return () => {
    landSubscribers.delete(cb);
  };
}

export function offCartLand(cb: LandSubscriber) {
  landSubscribers.delete(cb);
}

function emitCartLand() {
  landSubscribers.forEach((cb) => cb());
}

const quadraticBezier = (p0: number, p1: number, p2: number, t: number) =>
  (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;

/** Whether a rect still intersects the viewport (with a small margin). */
function isVisibleInViewport(rect: Rect): boolean {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const margin = 16;
  return (
    rect.x + rect.w > margin &&
    rect.x < vw - margin &&
    rect.y + rect.h > margin &&
    rect.y < vh - margin
  );
}

/**
 * Animate a product image clone from `source` to the registered cart target.
 *
 * The source must be the original product card position and must still be on
 * screen — if it was scrolled away (or is unknown) the fly is skipped so we
 * never animate from an invisible position. In every case the landing event
 * fires (cart spring, badge, counter) and `onComplete` runs so the caller can
 * reveal the success toast only after the interaction settles.
 */
export function flyToCart(
  source: Rect | null,
  imageSrc: string,
  onComplete?: () => void,
) {
  const target = cartTarget;

  const finish = () => {
    emitCartLand();
    onComplete?.();
  };

  if (!target || !source || !isVisibleInViewport(source)) {
    finish();
    return;
  }

  const targetRect = target.getBoundingClientRect();
  const start = { x: source.x + source.w / 2, y: source.y + source.h / 2 };
  const end = {
    x: targetRect.left + targetRect.width / 2,
    y: targetRect.top + targetRect.height / 2,
  };

  const size = 56;
  const el = document.createElement("div");
  const style = el.style;
  style.position = "fixed";
  style.left = "0";
  style.top = "0";
  style.width = `${size}px`;
  style.height = `${size}px`;
  style.borderRadius = "14px";
  style.background = `url("${imageSrc}") center / cover no-repeat`;
  style.boxShadow = "0 10px 28px 0 oklch(0.215 0.017 28 / 0.22)";
  style.pointerEvents = "none";
  style.zIndex = "9999";
  style.willChange = "transform, opacity";
  style.transform = `translate(${start.x - size / 2}px, ${
    start.y - size / 2
  }px)`;
  document.body.appendChild(el);

  const arc = Math.min(110, Math.abs(end.y - start.y) * 0.35 + 36);
  const control = { x: (start.x + end.x) / 2, y: start.y - arc };

  animate(0, 1, {
    duration: 0.35,
    ease: [0.32, 0.72, 0, 1],
    onUpdate: (p) => {
      const x = quadraticBezier(start.x, control.x, end.x, p);
      const y = quadraticBezier(start.y, control.y, end.y, p);
      const scale = 1 - 0.38 * p;
      style.transform = `translate(${x - size / 2}px, ${
        y - size / 2
      }px) scale(${scale})`;
      style.opacity = String(1 - 0.45 * p);
    },
    onComplete: () => {
      el.remove();
      finish();
    },
  });
}
