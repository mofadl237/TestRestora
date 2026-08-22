import type { ITaxInput } from "./pricing.types";

/**
 * Tax for an order. Flat amount today; a percentage rate is supported when
 * `rate` is provided (applied to the taxable base, normally subtotal minus
 * discount). Future VAT tiers plug in here.
 */
export function calcTaxAmount(input: ITaxInput): number {
  if (input.rate && input.rate > 0) {
    const base = Math.max(0, input.taxableBase ?? 0);
    return (base * input.rate) / 100;
  }
  return Math.max(0, input.amount ?? 0);
}
