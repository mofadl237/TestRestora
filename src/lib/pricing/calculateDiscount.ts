import type { IDiscountInput } from "./pricing.types";

/**
 * Discount applied to an order. Currently fixed-amount; percentage and
 * coupon resolution land here in the future without touching the engine.
 * A discount never exceeds the subtotal and never goes negative.
 */
export function calcDiscountAmount(input: IDiscountInput): number {
  const amount = Math.max(0, input.amount);
  return Math.min(amount, Math.max(0, input.subtotal));
}
