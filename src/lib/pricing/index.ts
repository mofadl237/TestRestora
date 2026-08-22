/**
 * Centralized Pricing Engine — every money calculation in the app must flow
 * through `calculateOrderSummary()`.
 */
export { calculateOrderSummary } from "./calculateOrderSummary";
export { calcUnitPrice, calcLineTotal, calcSubtotal } from "./calculateLinePrice";
export { calcDeliveryFee, isFreeDelivery } from "./calculateDelivery";
export { calcDiscountAmount } from "./calculateDiscount";
export { calcTaxAmount } from "./calculateTaxes";
export { validateMinimumOrder } from "./validateMinimumOrder";

export type {
  IPricingLineInput,
  IDeliveryInput,
  IDiscountInput,
  ITaxInput,
  IOrderSummaryInput,
  IOrderSummary,
  IMinimumOrderResult,
} from "./pricing.types";
