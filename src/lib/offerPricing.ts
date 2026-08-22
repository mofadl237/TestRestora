/**
 * Canonical Offer Pricing — Single Source of Truth
 *
 * Every pricing display in the app MUST flow through calculateOfferPricing().
 * No component should compute offer prices independently.
 *
 * The server is authoritative for the FINAL order price. These calculations
 * are for UI preview, cart display, and user understanding only.
 */

import type { IApiOffer, IApiOfferProductRef } from "@/src/store/api/types";
import { formatMoney, DEFAULT_CURRENCY_CODE } from "@/lib/currency";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface OfferProductLine {
  productId: string;
  productName: string;
  productImage: string;
  basePrice: number;
  role: "trigger" | "reward" | "included";
  /** Discount applied to this specific product (0 if no discount). */
  discountAmount: number;
  /** Final price for this product after discount. */
  finalPrice: number;
}

export interface OfferPricing {
  /** The original combined price of all participating products. */
  originalTotal: number;
  /** The total discount applied across all products. */
  discountAmount: number;
  /** The final offer price the customer pays. */
  finalTotal: number;
  /** Savings as a percentage of originalTotal (0–100). */
  savingsPercent: number;
  /** Per-product breakdown. */
  breakdown: OfferProductLine[];
  /** Currency code for formatting. */
  currency: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Clamp a number to [min, max]. Never produces NaN or Infinity. */
function clamp(value: number, min: number, max: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

/** Safe price: never NaN, never negative. */
function safePrice(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

// ─── Config type extractors ─────────────────────────────────────────────────

interface OfferConfig {
  buyQty?: number;
  getQty?: number;
  bundlePrice?: number;
  rewardDiscountPct?: number;
}

function extractConfig(offer: IApiOffer): OfferConfig {
  const raw = offer.config;
  if (!raw || typeof raw !== "object") return {};
  return {
    buyQty: typeof raw.buyQty === "number" ? raw.buyQty : undefined,
    getQty: typeof raw.getQty === "number" ? raw.getQty : undefined,
    bundlePrice: typeof raw.bundlePrice === "number" ? raw.bundlePrice : undefined,
    rewardDiscountPct:
      typeof raw.rewardDiscountPct === "number"
        ? raw.rewardDiscountPct
        : undefined,
  };
}

// ─── Per-type calculators ───────────────────────────────────────────────────

/**
 * Percentage discount on all products.
 * discountAmount = sum(productPrices) * (offer.value / 100)
 */
function calcPercentage(
  products: IApiOfferProductRef[],
  offerValue: number,
): OfferProductLine[] {
  const totalBefore = products.reduce(
    (sum, p) => sum + safePrice(p.product.basePrice),
    0,
  );
  const pct = clamp(offerValue, 0, 100) / 100;
  const totalDiscount = totalBefore * pct;
  let remainingDiscount = totalDiscount;

  return products.map((p, i) => {
    const price = safePrice(p.product.basePrice);
    // Distribute discount proportionally across products
    const productShare =
      totalBefore > 0 ? (price / totalBefore) * totalDiscount : 0;
    const disc =
      i === products.length - 1
        ? clamp(remainingDiscount, 0, price)
        : clamp(productShare, 0, price);
    remainingDiscount -= disc;

    return {
      productId: p.productId,
      productName: p.product.name,
      productImage: p.product.image,
      basePrice: price,
      role: p.role as OfferProductLine["role"],
      discountAmount: Math.round(disc * 100) / 100,
      finalPrice: Math.round((price - disc) * 100) / 100,
    };
  });
}

/**
 * Fixed discount on the total.
 * discountAmount = min(offer.value, totalBefore)
 */
function calcFixed(
  products: IApiOfferProductRef[],
  offerValue: number,
): OfferProductLine[] {
  const totalBefore = products.reduce(
    (sum, p) => sum + safePrice(p.product.basePrice),
    0,
  );
  const totalDiscount = clamp(offerValue, 0, totalBefore);
  let remainingDiscount = totalDiscount;

  return products.map((p, i) => {
    const price = safePrice(p.product.basePrice);
    const productShare =
      totalBefore > 0 ? (price / totalBefore) * totalDiscount : 0;
    const disc =
      i === products.length - 1
        ? clamp(remainingDiscount, 0, price)
        : clamp(productShare, 0, price);
    remainingDiscount -= disc;

    return {
      productId: p.productId,
      productName: p.product.name,
      productImage: p.product.image,
      basePrice: price,
      role: p.role as OfferProductLine["role"],
      discountAmount: Math.round(disc * 100) / 100,
      finalPrice: Math.round((price - disc) * 100) / 100,
    };
  });
}

/**
 * BOGO: trigger items are full price, reward items discounted by
 * config.rewardDiscountPct (not offer.value).
 *
 * For 100% reward discount: reward finalPrice = 0.
 * For 50%: reward finalPrice = rewardPrice * 0.5.
 */
function calcBogo(
  products: IApiOfferProductRef[],
  config: OfferConfig,
): OfferProductLine[] {
  const rewardDiscountPct = clamp(config.rewardDiscountPct ?? 100, 0, 100) / 100;

  return products.map((p) => {
    const price = safePrice(p.product.basePrice);
    const isReward = p.role === "reward";
    const disc = isReward ? price * rewardDiscountPct : 0;

    return {
      productId: p.productId,
      productName: p.product.name,
      productImage: p.product.image,
      basePrice: price,
      role: p.role as OfferProductLine["role"],
      discountAmount: Math.round(disc * 100) / 100,
      finalPrice: Math.round((price - disc) * 100) / 100,
    };
  });
}

/**
 * Bundle / Meal Deal / Family Meal / Kids Meal:
 * Use config.bundlePrice as the final price.
 * All products are "included" — no per-product discount.
 */
function calcBundle(
  products: IApiOfferProductRef[],
  _config: OfferConfig,
): OfferProductLine[] {
  return products.map((p) => {
    const price = safePrice(p.product.basePrice);

    return {
      productId: p.productId,
      productName: p.product.name,
      productImage: p.product.image,
      basePrice: price,
      role: p.role as OfferProductLine["role"],
      discountAmount: 0, // Bundle discount is on the total, not per-product
      finalPrice: price, // Show original price per product
    };
  });
}

// ─── Main export ────────────────────────────────────────────────────────────

/**
 * Calculate the complete pricing for an offer.
 *
 * Returns originalTotal, discountAmount, finalTotal, savingsPercent,
 * per-product breakdown, and currency code.
 *
 * Safe against: NaN, Infinity, negative prices, missing config, empty products.
 */
export function calculateOfferPricing(offer: IApiOffer): OfferPricing {
  const config = extractConfig(offer);

  // Guard: no products
  if (!offer.products || offer.products.length === 0) {
    return {
      originalTotal: 0,
      discountAmount: 0,
      finalTotal: 0,
      savingsPercent: 0,
      breakdown: [],
      currency: DEFAULT_CURRENCY_CODE,
    };
  }

  let breakdown: OfferProductLine[];

  switch (offer.type) {
    case "percentage":
      breakdown = calcPercentage(offer.products, offer.value);
      break;
    case "fixed":
      breakdown = calcFixed(offer.products, offer.value);
      break;
    case "bogo":
      breakdown = calcBogo(offer.products, config);
      break;
    case "bundle":
    case "meal_deal":
    case "family_meal":
    case "kids_meal":
      breakdown = calcBundle(offer.products, config);
      break;
    default:
      // Unknown offer type: show products at face value, no discount
      breakdown = offer.products.map((p) => ({
        productId: p.productId,
        productName: p.product.name,
        productImage: p.product.image,
        basePrice: safePrice(p.product.basePrice),
        role: p.role as OfferProductLine["role"],
        discountAmount: 0,
        finalPrice: safePrice(p.product.basePrice),
      }));
  }

  const originalTotal =
    Math.round(breakdown.reduce((sum, l) => sum + l.basePrice, 0) * 100) / 100;
  const totalProductDiscounts =
    Math.round(breakdown.reduce((sum, l) => sum + l.discountAmount, 0) * 100) /
    100;

  // For bundles, the total discount is originalTotal - bundlePrice
  let discountAmount: number;
  let finalTotal: number;

  if (
    offer.type === "bundle" ||
    offer.type === "meal_deal" ||
    offer.type === "family_meal" ||
    offer.type === "kids_meal"
  ) {
    const bundlePrice = clamp(config.bundlePrice ?? originalTotal, 0, originalTotal);
    discountAmount = originalTotal - bundlePrice;
    finalTotal = bundlePrice;
  } else {
    discountAmount = totalProductDiscounts;
    finalTotal = originalTotal - totalProductDiscounts;
  }

  // Safety: never negative
  finalTotal = clamp(finalTotal, 0, originalTotal);
  discountAmount = clamp(discountAmount, 0, originalTotal);
  const savingsPercent =
    originalTotal > 0
      ? Math.round((discountAmount / originalTotal) * 100 * 10) / 10
      : 0;

  return {
    originalTotal,
    discountAmount,
    finalTotal,
    savingsPercent,
    breakdown,
    currency: DEFAULT_CURRENCY_CODE,
  };
}

// ─── Formatting helpers ─────────────────────────────────────────────────────

/** Format an offer price for display. */
export function formatOfferPrice(
  value: number,
  currency?: string,
): string {
  return formatMoney(value, currency ?? DEFAULT_CURRENCY_CODE);
}

/** Format a discount with minus sign. */
export function formatDiscount(
  value: number,
  currency?: string,
): string {
  return `−${formatMoney(value, currency ?? DEFAULT_CURRENCY_CODE)}`;
}

/** Development logger — logs offer pricing calculations. */
export function logOfferPricing(
  offer: IApiOffer,
  pricing: OfferPricing,
): void {
  if (process.env.NODE_ENV !== "development") return;

  console.groupCollapsed(
    `[OfferPricing] ${offer.name} (${offer.type})`,
  );
  console.log("Offer ID:", offer.id);
  console.log("Type:", offer.type);
  console.log("Config:", offer.config);
  console.log("Original:", pricing.originalTotal);
  console.log("Discount:", pricing.discountAmount);
  console.log("Final:", pricing.finalTotal);
  console.log("Savings %:", pricing.savingsPercent);
  console.log("Breakdown:", pricing.breakdown);
  console.groupEnd();
}
