# Checkout — Restora Website Template v1.0.0

Checkout collects input, validates required fields client-side, and submits
through the **Restora Public API**. Restora owns all business rules: pricing,
offers, delivery calculation, minimum orders, and order creation.

```
Cart items + delivery zone (Redux)
    ↓
RenderOrder.tsx  (subtotal via Pricing Engine)
    ↓
CheckoutForm     (name, phone, address, city, notes)
    ↓
POST /orders  (useCreateOrderMutation)   ← server recomputes all prices
    ↓
/orders/[orderId]
```

---

## Flow

1. **Availability gate** — `RestaurantClosedBanner`
   (`useGetAvailabilityQuery`) disables submission when closed.
2. **Delivery zone** — required when Restora has zones configured
   (`useGetDeliveryZonesQuery`); the selected zone is passed as
   `deliveryZoneId`.
3. **Summary** — computed with the Pricing Engine, displayed by
   `CartSummary` (`subtotal`, `deliveryFee`, `tax`, `discount`, `total`).
4. **Form** — `ShoppingCart/CheckoutForm.tsx` collects `customerName`,
   `phone`, `address`, `city`, `apartment`, `notes`. Client-side presence
   checks via localized toasts.
5. **Submit** — `RenderOrder.handleSubmit`:
   - maps cart items to `ICreateOrderItem[]` (productId, productName,
     productImage, quantity, basePrice, variant, options, note),
   - calls `createOrder({ ...fields, items, deliveryZoneId, discount, tax,
     locale }).unwrap()`,
   - on success stores a minimal `lastOrder` ref (`{ orderId, orderNumber }`)
     in localStorage (no PII), `clearCart()`, routes to
     `/orders/[orderId]`,
   - on failure shows `apiErrorMessage(err)` via toast.

---

## API contract

`POST /api/v1/public/orders` — see `docs/API_ENDPOINTS.md`.

- **All prices are recomputed server-side.** The client sends
  `basePrice`/variant/options only so the server can rebuild and price the
  same product configuration; totals the client sends are ignored.
- Responses: `201 { orderId, orderNumber, customerName, totalPrice }`.
- Errors: `400` invalid input / inactive zone, `422` closed or below minimum
  order.

---

## Components

```
RenderOrder.tsx          container + submission logic
ShoppingCart/
  CheckoutForm.tsx       form fields
  CartSummary.tsx        price breakdown (Pricing Engine output)
  SubmitOrderButton.tsx  total + loading + disabled state (sticky on mobile)
DeliveryZones/*          zone selection UI
RestaurantClosedBanner.tsx  availability gate
```

---

## Rules

- NEVER duplicate order business logic in the frontend.
- NEVER compute the authoritative total client-side and expect it to be used —
  Restora is the source of truth.
- Keep the checkout input collection isolated from UI redesigns (see
  `docs/CUSTOMIZATION.md`).
