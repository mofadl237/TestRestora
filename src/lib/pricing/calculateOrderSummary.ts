import { calcSubtotal } from "./calculateLinePrice";
import { calcDeliveryFee } from "./calculateDelivery";
import { calcDiscountAmount } from "./calculateDiscount";
import { calcTaxAmount } from "./calculateTaxes";
import type { IOrderSummary, IOrderSummaryInput } from "./pricing.types";

/**
 * THE single entry point for every monetary computation in the application.
 *
 * The UI, Redux derived values, server actions and dashboard all flow through
 * this function — nobody calculates totals inline.
 */
export function calculateOrderSummary(
  input: IOrderSummaryInput,
): IOrderSummary {
  const subtotal = calcSubtotal(input.lines);

  const deliveryFee = calcDeliveryFee({
    zone: input.delivery?.zone,
    fallbackFee: input.delivery?.fallbackFee,
    freeDeliveryThreshold: input.delivery?.freeDeliveryThreshold,
    subtotal,
  });

  const discount = calcDiscountAmount({
    amount: input.discount ?? 0,
    subtotal,
  });

  const taxableBase = subtotal - discount;
  const tax = calcTaxAmount({
    amount: input.tax ?? 0,
    rate: input.taxRate ?? 0,
    taxableBase,
  });

  // Reserved for future billing (platform fee, small order fee, ...).
  const serviceFee = 0;

  const total = subtotal + deliveryFee + serviceFee + tax - discount;

  return { subtotal, deliveryFee, discount, tax, serviceFee, total };
}
