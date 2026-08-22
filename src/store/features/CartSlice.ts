import { setLocalStorage } from "@/lib/localStorageHandle";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface ICartVariant {
  id: string;
  name: string;
  price: number;
}

export interface ICartOption {
  id: string;
  name: string;
  price: number;
}

export interface ICartProduct {
  /** Unique cart-item ID (crypto.randomUUID()) */
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  variant?: ICartVariant;
  options?: ICartOption[];
  note?: string;
  basePrice: number;
}

// ─── Offer Cart Model ───────────────────────────────────────────────────────

/** A product participating in an offer (trigger or reward). */
export interface ICartOfferProduct {
  productId: string;
  productName: string;
  productImage: string;
  basePrice: number;
  role: "trigger" | "reward" | "included";
}

/**
 * An Offer as a first-class cart entity.
 *
 * An Offer is NOT a collection of individual products — it is ONE logical
 * transaction. The cart stores the offer identity and its computed pricing
 * snapshot; the server is authoritative for the final price.
 */
export interface ICartOfferGroup {
  /** Unique cart-entity ID (crypto.randomUUID()) */
  id: string;
  offerId: string;
  offerType: string;
  offerName: string;
  offerDescription: string;
  offerImage: string;
  /** Products participating in this offer (trigger, reward, included). */
  products: ICartOfferProduct[];
  /** Expected original combined price before discount (client-computed for display). */
  originalPrice: number;
  /** Expected discount amount (client-computed for display). */
  discountAmount: number;
  /** Expected final offer price (client-computed for display). */
  finalPrice: number;
  /** Offer-level quantity (the whole offer is one line). */
  quantity: number;
  /** Offer config snapshot from the API (buyQty, getQty, bundlePrice, etc). */
  config: Record<string, unknown> | null;
}

/** Delivery zone selected during checkout. Stored, never derived. */
export interface ICartDeliveryZone {
  id: string;
  name: string;
  deliveryPrice: number;
  minimumOrder: number;
  estimatedTimeMin: number;
  estimatedTimeMax: number;
}

/** Dine-in table established by the QR entry flow. Stored, never derived. */
export interface ICartTable {
  id: string;
  number: string;
}

/**
 * Applied promo code snapshot from server validation.
 * The discount preview is for UI display only — the server revalidates
 * and recalculates during order creation.
 */
export interface ICartPromoCode {
  code: string;
  offerId: string;
  offerName: string;
  offerType: string;
  discountType: string;
  discountValue: number;
  /** Server-computed estimated discount for preview display. */
  estimatedDiscount: number;
}

interface ICartState {
  items: ICartProduct[];
  offerGroups: ICartOfferGroup[];
  deliveryZone: ICartDeliveryZone | null;
  /** Dine-in table context established by scanning a QR code. */
  table: ICartTable | null;
  /** Applied promo code (order-level discount validated by server). */
  promoCode: ICartPromoCode | null;
  /** Applied discounts (future: coupons) — an input, not a derived value. */
  discount: number;
  /** Tax input (flat amount today). */
  tax: number;
}

interface IPersistedCart {
  items: ICartProduct[];
  offerGroups?: ICartOfferGroup[];
  promoCode?: ICartPromoCode | null;
  deliveryZone: ICartDeliveryZone | null;
  table: ICartTable | null;
}

const persist = (
  items: ICartProduct[],
  offerGroups: ICartOfferGroup[],
  promoCode: ICartPromoCode | null,
  deliveryZone: ICartDeliveryZone | null,
  table: ICartTable | null,
) => {
  const payload: IPersistedCart = { items, offerGroups, promoCode, deliveryZone, table };
  setLocalStorage(JSON.stringify(payload));
};

// Always start empty so server and client render identical markup on mount;
// real cart data is hydrated client-side via `hydrateCart` after mount.
const initialState: ICartState = {
  items: [],
  offerGroups: [],
  deliveryZone: null,
  table: null,
  promoCode: null,
  discount: 0,
  tax: 0,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<ICartProduct>) => {
      const incoming = action.payload;
      const existingIdx = state.items.findIndex(
        (item) =>
          item.productId === incoming.productId &&
          item.variant?.id === incoming.variant?.id &&
          JSON.stringify((item.options ?? []).map((o) => o.id).sort()) ===
            JSON.stringify((incoming.options ?? []).map((o) => o.id).sort()),
      );

      if (existingIdx !== -1) {
        state.items[existingIdx].quantity += incoming.quantity;
      } else {
        state.items.push(incoming);
      }

      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    /** Replace an existing item by its cart id (used by Edit flow). */
    updateItem: (state, action: PayloadAction<ICartProduct>) => {
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
        persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
      }
    },

    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find((i) => i.id === action.payload);
      if (item) {
        item.quantity += 1;
        persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
      }
    },

    /** Decrease quantity. Removes the item if it reaches 0. */
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const idx = state.items.findIndex((i) => i.id === action.payload);
      if (idx !== -1) {
        if (state.items[idx].quantity <= 1) {
          state.items.splice(idx, 1);
        } else {
          state.items[idx].quantity -= 1;
        }
        persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
      }
    },

    // ─── Offer Group Actions ───────────────────────────────────────────────

    /** Add an offer as a single cart entity. Merges by offerId. */
    addOfferGroup: (state, action: PayloadAction<ICartOfferGroup>) => {
      const incoming = action.payload;
      const existingIdx = state.offerGroups.findIndex(
        (og) => og.offerId === incoming.offerId,
      );

      if (existingIdx !== -1) {
        state.offerGroups[existingIdx].quantity += incoming.quantity;
      } else {
        state.offerGroups.push(incoming);
      }

      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    /** Remove an offer group by its cart-entity ID. */
    removeOfferGroup: (state, action: PayloadAction<string>) => {
      state.offerGroups = state.offerGroups.filter(
        (og) => og.id !== action.payload,
      );
      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    /** Increase the quantity of an offer group (whole offer × N). */
    increaseOfferQuantity: (state, action: PayloadAction<string>) => {
      const og = state.offerGroups.find((g) => g.id === action.payload);
      if (og) {
        og.quantity += 1;
        persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
      }
    },

    /** Decrease the quantity of an offer group. Removes at 0. */
    decreaseOfferQuantity: (state, action: PayloadAction<string>) => {
      const idx = state.offerGroups.findIndex((g) => g.id === action.payload);
      if (idx !== -1) {
        if (state.offerGroups[idx].quantity <= 1) {
          state.offerGroups.splice(idx, 1);
        } else {
          state.offerGroups[idx].quantity -= 1;
        }
        persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
      }
    },

    // ─── Promo Code ────────────────────────────────────────────────────────

    /** Apply a validated promo code to the cart. */
    setPromoCode: (state, action: PayloadAction<ICartPromoCode>) => {
      state.promoCode = action.payload;
      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    /** Remove the applied promo code. */
    clearPromoCode: (state) => {
      state.promoCode = null;
      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    // ─── Zone / Table / Cart ───────────────────────────────────────────────

    /** Select / change the checkout delivery zone. */
    setDeliveryZone: (state, action: PayloadAction<ICartDeliveryZone>) => {
      state.deliveryZone = action.payload;
      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    /** Remove the delivery zone selection (cart emptied, etc). */
    clearDeliveryZone: (state) => {
      state.deliveryZone = null;
      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    /** Set the active dine-in table from the QR entry flow. */
    setDineInTable: (state, action: PayloadAction<ICartTable>) => {
      state.table = action.payload;
      state.deliveryZone = null;
      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    /** Clear the active dine-in table. */
    clearDineInTable: (state) => {
      state.table = null;
      persist(state.items, state.offerGroups, state.promoCode, state.deliveryZone, state.table);
    },

    /** Clear the entire cart. */
    clearCart: (state) => {
      state.items = [];
      state.offerGroups = [];
      state.promoCode = null;
      state.deliveryZone = null;
      state.table = null;
      persist([], [], null, null, null);
    },

    /**
     * Load persisted cart state client-side, after mount (avoids SSR/CSR
     * mismatch). Supports the legacy shape (bare items array) so carts saved
     * before the Delivery System upgrade still hydrate.
     */
    hydrateCart: (
      state,
      action: PayloadAction<IPersistedCart | ICartProduct[]>,
    ) => {
      const payload = action.payload;
      if (Array.isArray(payload)) {
        state.items = payload;
        state.offerGroups = [];
        state.promoCode = null;
        state.deliveryZone = null;
        state.table = null;
      } else {
        state.items = payload.items ?? [];
        state.offerGroups = payload.offerGroups ?? [];
        state.promoCode = payload.promoCode ?? null;
        state.deliveryZone = payload.deliveryZone ?? null;
        state.table = payload.table ?? null;
      }
    },
  },
});

export const {
  addItem,
  updateItem,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  addOfferGroup,
  removeOfferGroup,
  increaseOfferQuantity,
  decreaseOfferQuantity,
  setPromoCode,
  clearPromoCode,
  setDeliveryZone,
  clearDeliveryZone,
  setDineInTable,
  clearDineInTable,
  clearCart,
  hydrateCart,
} = cartSlice.actions;

export default cartSlice.reducer;
