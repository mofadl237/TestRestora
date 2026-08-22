import type { IMinimumOrderResult } from "./pricing.types";

/**
 * Validates the subtotal against a zone's minimum order. A `minimumOrder` of
 * 0 (or unset) always passes. The result powers the checkout warning and the
 * server-side rejection.
 */
export function validateMinimumOrder(input: {
  minimumOrder: number;
  subtotal: number;
}): IMinimumOrderResult {
  const required = Math.max(0, input.minimumOrder);
  if (required <= 0) return { ok: true, required: 0, shortfall: 0 };
  const subtotal = Math.max(0, input.subtotal);
  const shortfall = required - subtotal;
  return { ok: shortfall <= 0, required, shortfall: Math.max(0, shortfall) };
}
