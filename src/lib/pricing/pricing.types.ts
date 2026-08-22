/**
 * Pure pricing types — no imports from the store or Prisma, so the engine is
 * usable from server actions, the Redux cart slice, and client components.
 */

/** A single cart line's price inputs. `variantPrice` is a DELTA on top of
 * the base price (see the seed / dashboard product form). */
export interface IPricingLineInput {
  basePrice: number;
  variantPrice?: number;
  options?: { price: number }[];
  quantity: number;
}

/** Delivery fee resolution inputs. */
export interface IDeliveryInput {
  /** Selected delivery zone snapshot (from the checkout cards). */
  zone?: {
    deliveryPrice: number;
    minimumOrder?: number;
  } | null;
  /** Flat fallback fee when no zone is selected (settings / legacy path). */
  fallbackFee?: number;
  /** Orders at/above this subtotal get free delivery (settings, future campaigns). */
  freeDeliveryThreshold?: number;
  /** Provided automatically by `calculateOrderSummary`; optional for direct calls. */
  subtotal?: number;
}

/** Fixed-amount discount (future: percentage + coupon codes). */
export interface IDiscountInput {
  amount: number;
  subtotal: number;
}

/** Tax resolution — flat amount now, percentage rate future-ready. */
export interface ITaxInput {
  amount?: number;
  rate?: number;
  taxableBase?: number;
}

export interface IOrderSummaryInput {
  lines: IPricingLineInput[];
  delivery?: IDeliveryInput | null;
  discount?: number;
  tax?: number;
  taxRate?: number;
}

/** The single canonical money result for an order. */
export interface IOrderSummary {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  tax: number;
  serviceFee: number;
  total: number;
}

export interface IMinimumOrderResult {
  ok: boolean;
  required: number;
  shortfall: number;
}
