import type { IPricingLineInput } from "./pricing.types";

/**
 * Unit price of one line = base price + variant delta + sum of option prices.
 * This is the ONLY place the line price rule lives.
 */
export function calcUnitPrice(line: IPricingLineInput): number {
  const variantDelta = line.variantPrice ?? 0;
  const optionsPrice = (line.options ?? []).reduce(
    (sum, option) => sum + (option.price || 0),
    0,
  );
  return line.basePrice + variantDelta + optionsPrice;
}

export function calcLineTotal(line: IPricingLineInput): number {
  return calcUnitPrice(line) * Math.max(0, line.quantity);
}

export function calcSubtotal(lines: IPricingLineInput[]): number {
  return lines.reduce((sum, line) => sum + calcLineTotal(line), 0);
}
