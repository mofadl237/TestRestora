# Orders — Restora Website Template v1.0.0

Two public order flows: **tracking** (lookup by phone) and **confirmation**
(single order after checkout). Both consume the Public API — no order engine
exists in this template.

---

## Order tracking — `/track-order`

- Page: `app/[locale]/(website)/track-order/page.tsx` →
  `src/Components/TrackOrder/TrackOrderClient.tsx`.
- Data: `useLazyGetOrdersByPhoneQuery` (`GET /orders?phone=`).
- Flow:
  1. Guest enters their phone number.
  2. The template shows recent orders split into **active** and **completed**.
  3. A saved last-order shortcut ("Continue Tracking Your Last Order") reuses
     the `lastOrder` ref stored at checkout.
  4. Selecting an order opens `useLazyGetOrderByIdQuery` → navigates to
     `/orders/[orderId]`.
- Privacy: the API never echoes the phone number back.

---

## Order confirmation — `/orders/[orderId]`

- Page: `app/[locale]/(website)/orders/[orderId]/page.tsx` (client) +
  `OrderDetailsClient.tsx`.
- Data: `useGetOrderByIdQuery({ id, locale })` +
  `useGetRestaurantQuery({ locale })` (currency).
- Mapping: `src/lib/orderDisplay.ts` converts the API payload to UI shapes:
  - `mapOrderDetail(order, locale, currencyCode)` → `IOrderDetail`,
  - `buildInvoice(order, locale, currencyCode)` → `IInvoiceData`,
  - `buildRestaurant(settings)` → `IInvoiceRestaurant`.
- Loading: centered `Loader2` spinner. Error/not-found → `notFound()`.

### Confirmation UI (`src/Components/Order/`)

| Component | Content |
| --- | --- |
| `OrderHeader` | Order number, status, created date, total. |
| `OrderSuccessBanner` | Confirmation copy + order number. |
| `OrderTimeline` | Status steps with current status highlight. |
| `OrderItemsList` | Ordered items (name, quantity, unit, total). |
| `OrderPriceSummary` | Subtotal / delivery / tax / discount / total + zone ETA. |
| `OrderCustomerInfo` | Name, phone, address, city, notes, payment status. |
| `StatusBadge` | Colored status badge. |

### Invoice (`src/Components/Documents/`)

- `InvoiceDialog` renders a printable invoice via `InvoiceDocument`.
- Also available: `PrintableOrderDocument`, `KitchenTicketDocument`,
  `mappers.ts`, `types.ts`. Pure client-side print — no server.

---

## Status values

Status strings come from the API (`status`, `paymentStatus`). Localized labels
and colors are resolved in `src/Components/Order/` (e.g. `StatusBadge`,
`OrderTimeline`) via `messages/order.*`.

---

## Rules

- NEVER create another order engine.
- Order reads are `no-store` at the API; RTK Query keeps them fresh per mount.
- Do not store customer PII in the template beyond the minimal `lastOrder`
  reference used for the tracking shortcut.
