# Cart — Restora Website Template v1.0.0

The cart is a **Redux slice** (`src/store/features/CartSlice.ts`) persisted to
`localStorage`. There is exactly **one** cart system — never create a second one.

---

## State — inputs only

```ts
interface ICartState {
  items: ICartProduct[];            // inputs
  deliveryZone: ICartDeliveryZone | null;
  discount: number;                 // inputs (flat amount)
  tax: number;                      // inputs (flat amount)
}
```

Derived values (subtotal, delivery, total) are **never stored** — they are
computed on demand through the Pricing Engine (`src/lib/pricing`, wrapped in
`lib/utils.ts`).

`ICartProduct` carries everything needed for checkout and edit:
`productId, productName, productImage, quantity, basePrice, variant?, options?, note?`.
Each item gets a unique `id` (`crypto.randomUUID()`).

---

## Actions

| Action | Behavior |
| --- | --- |
| `addItem` | Merges when the same productId + variantId + sorted option ids already exist; else appends. |
| `updateItem` | Replaces an item by its cart id (edit flow). |
| `removeItem` | Removes by cart id. |
| `increaseQuantity` / `decreaseQuantity` | Adjusts quantity; removes item at 0. |
| `setDeliveryZone` / `clearDeliveryZone` | Selects the checkout zone. |
| `clearCart` | Empties items + zone. |
| `hydrateCart` | Loads persisted state client-side after mount (avoids SSR/CSR mismatch); supports the legacy bare-array shape. |

---

## Persistence

- `lib/localStorageHandle.ts` (`setLocalStorage` / `getLocalStorage`).
- Persists **items + deliveryZone** only (never derived values).
- Redux and localStorage stay in sync — every mutating action persists.
- Hydration happens in `RenderOrder.tsx` after mount so the server and client
  render identical first markup.

---

## Pricing

All money math flows through the Pricing Engine:

```ts
import { calcSubtotal, calculateOrderSummary } from "@/lib/utils";
const subtotal = calcSubtotal(items);
const summary = calculateOrderSummary({ lines, delivery, discount, tax });
```

- `lib/utils.ts` — thin adapters mapping cart shapes to engine inputs
  (`cartItemToLine`, `calcSubtotal`, `calcTotal`, `calcTotalPriceFromVariant`,
  `calcTotalPriceFromOptions`).
- `src/lib/pricing/` — engine (`calculateOrderSummary`, `calcUnitPrice`,
  `calcLineTotal`, `calcDeliveryFee`, `calcDiscountAmount`, `calcTaxAmount`,
  `validateMinimumOrder`).
- Prices are **never calculated inside JSX**.

---

## Components

```
src/Components/Cart/
  Cart.tsx                     entry (renders RenderOrder / empty)
  RenderOrder.tsx              ★ container: state, hydration, submit logic
  ShoppingCart/
    CartHeader.tsx  CartItems.tsx  CartSummary.tsx  CheckoutForm.tsx
    SubmitOrderButton.tsx  EmptyCart.tsx  CartAnimations.ts
  DeliveryZones/               zone selector (combobox, sheet, search, summary)
  EditCartDialog.tsx           re-fetch product via useLazyGetProductByIdQuery
  RestaurantClosedBanner.tsx   availability gate
```

Key points:

- `RestaurantClosedBanner` uses `useGetAvailabilityQuery`; when the restaurant
  is closed, order submission is disabled.
- `DeliveryZoneSelector` lists zones from `useGetDeliveryZonesQuery`; the
  selected zone is stored in the slice and validated on the server at order time.
- Edit flow re-fetches the full product (`useLazyGetProductByIdQuery`) and opens
  `AddToCartDialog` in `mode="edit"`.
