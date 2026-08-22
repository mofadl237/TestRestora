import { IOption } from "@/src/Interfaces";
import { ICartOption, ICartProduct } from "@/src/store/features/CartSlice";
import {
  calcSubtotal as pricingSubtotal,
  calcUnitPrice as engineUnitPrice,
  calculateOrderSummary,
  type IPricingLineInput,
} from "@/src/lib/pricing";

export { calculateOrderSummary } from "@/src/lib/pricing";
import { formatMoney } from "@/lib/currency";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formattePrice = (price: number) => formatMoney(price);

// ─────────────────────────────────────────────────────────────────────────────
// Cart pricing — thin adapters over the client-safe Pricing Engine
// (src/lib/pricing). All money math lives there; these wrappers only map
// the cart shapes onto the engine's input types.
// ─────────────────────────────────────────────────────────────────────────────

/** Map a cart item to the pricing engine's line input. */
export const cartItemToLine = (item: ICartProduct): IPricingLineInput => ({
  basePrice: item.basePrice,
  variantPrice: item.variant?.price ?? 0,
  options: (item.options ?? []).map((option) => ({ price: option.price })),
  quantity: item.quantity,
});

export const calcTotalPriceFromVariant = (
  basePrice: number,
  variantPrice: number,
): number => {
  return basePrice + variantPrice;
};

export const calcTotalPriceFromOptions = (options: ICartOption[]) => {
  return options.reduce((sum: number, acc: ICartOption) => {
    return sum + acc.price;
  }, 0);
};

export const calcTotalPriceOneProduct = (
  productVariantPrice: number,
  productOptionsPrice: number,
): number => {
  return productOptionsPrice + productVariantPrice;
};

export const calcSubtotal = (items: ICartProduct[]) => {
  return pricingSubtotal(items.map(cartItemToLine));
};

export const calcTotal = (
  items: ICartProduct[],
  delivery: number,
  discount: number,
  tax: number,
): number => {
  return calculateOrderSummary({
    lines: items.map(cartItemToLine),
    delivery: { fallbackFee: delivery },
    discount,
    tax,
  }).total;
};

export const calcUnitPriceFromCartItem = (item: ICartProduct): number =>
  engineUnitPrice(cartItemToLine(item));

// Pricing previews (dashboard product form). Variant prices are DELTAS on
// top of the base price — see calcTotalPriceFromVariant.
export const calcMinDisplayPrice = (
  basePrice: number,
  variantDeltas: number[],
): number => basePrice + (variantDeltas.length ? Math.min(...variantDeltas) : 0);

export const calcMaxDisplayPrice = (
  basePrice: number,
  variantDeltas: number[],
): number => basePrice + (variantDeltas.length ? Math.max(...variantDeltas) : 0);

export const addExtraToCart = (options: IOption[]) => {
  const optionsProductInCart: ICartOption[] = options.map((option: IOption) => {
    return {
      id: option.id,
      name: option.name,
      price: option.price,
    };
  });
  return optionsProductInCart;
};
