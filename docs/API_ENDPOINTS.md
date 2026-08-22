# Public API Endpoints — Restora Website Template v1.0.0

The only backend contract of this template. Base URL is
`${NEXT_PUBLIC_RESTORA_API_URL}/api/v1/public`.

All endpoints are **unauthenticated**. Every response uses the envelope:

```json
{ "success": true, "data": { ... }, "meta": { "page": 1, "pageSize": 50, "total": 100 } }
{ "success": false, "error": { "code": "…", "message": "…", "details": {} } }
```

The RTK Query layer unwraps `data` in each `transformResponse`; errors are read
with `apiErrorMessage()` / `apiErrorCode()` from `src/store/api/types.ts`.

**Common parameters:**
- `locale` — `en` | `ar` (defaults `en`). The API returns translated text fields.
- `restaurantId` — the tenant. Resolution order: `?restaurantId=` query →
  `x-restaurant-id` header → default restaurant. This template always sends
  **both** (header via `prepareHeaders`, query via `params`).

---

## GET /restaurant

Restaurant public snapshot (name, country, currency, timezone, business hours,
**branding**, contact, social, localization).

- Used by: header, footer, contact page, order details, `usePublicSettings`.
- RTK endpoint: `getRestaurant` — tag `Restaurant`.
- Tenant: yes (query + header).

## GET /restaurant/availability

`{ isOpenNow, status, reason, closedUntil, message, nextOpeningAt }`.

- Used by: `RestaurantClosedBanner` (cart/checkout).
- RTK endpoint: `getAvailability` — tag `Availability`.

## GET /home

Single-request home payload: `{ bestSellers, sections, offers, branding }`.

- Used by: home best-sellers (`useGetHomeQuery`) and menu page hero.
- RTK endpoint: `getHome` — tag `Home`.

## GET /categories

`[ { id, name, displayOrder, productCount, … } ]` ordered for display.

- Used by: menu category tabs (`useGetCategoriesQuery`).
- RTK endpoint: `getCategories` — tag `Categories`.

## GET /products

Paginated catalog. Query params: `locale`, `categoryId?`, `page`, `limit`
(max 100). Pagination is database-level.

- Used by: menu grid + infinite pagination (`useGetMenuPageQuery`).
- RTK endpoint: `getMenuPage` — tag `Products`.

## GET /products/[id]

Single product with `variants` and `optionGroups` (with options).

- Used by: `AddToCartDialog` (add mode), cart item edit (`useLazyGetProductByIdQuery`).
- RTK endpoint: `getProductById` — tag `Products`.

## GET /offers

Active, visible, currently-valid offers only.

- Used by: home offers rail (`useGetOffersQuery`).
- RTK endpoint: `getOffers` — tag `Offers`.

## GET /delivery-zones

Active delivery zones: `{ id, name, deliveryPrice, estimatedTimeMin/Max, minimumOrder }`.

- Used by: cart delivery zone selector (`useGetDeliveryZonesQuery`).
- RTK endpoint: `getDeliveryZones` — tag `DeliveryZones`.

## GET /reservations/config

`{ enabled, capacity, maxGuests, intervalMinutes, windowDays }`.

- Used by: reservation booking UI (`useGetReservationConfigQuery`).
- RTK endpoint: `getReservationConfig` — tag `Reservations`.

## GET /reservations/slots?date=YYYY-MM-DD

Slot grid for one day: `{ dateKey, hasSlots, slots: [{ date, label, capacity,
used, available, open, reason }] }`. Past/full slots come back `open: false`
with a machine `reason` — the UI renders them disabled.

- Used by: reservation slot picker (`useGetReservationSlotsQuery({ date })`).
- RTK endpoint: `getReservationSlots` — tag `Reservations`.

## POST /reservations

Create a reservation. Body: `customerName`, `customerPhone`, `customerEmail?`,
`partySize`, `date` (ISO), `durationMinutes?`, `notes?`. Returns `201 { id }`.

## GET /tables/resolve?tableId=<id>

Resolves a dine-in table for the QR entry flow. Returns `{ id, number, isActive }`
only when the table exists, belongs to the tenant, and is active.

- Used by: `TableResolver` on the home page after scanning a QR code.
- RTK endpoint: `resolveTable` — tag `Tables`.
- Tenant: yes (query + header).

- Errors: `400` invalid fields, `409` capacity full (details include
  `shortfall`), `422` business rule (closed, outside window, …).
- Used by: `PublicReservations` submit (`useCreateReservationMutation`).
- RTK endpoint: `createReservation` — invalidates `Reservations`.
- Localized codes: `apiErrorKey`/`apiErrorShortfall` map
  `reservations.capacityFull` etc. to `reservations.slotReason`/`valid` keys.

## GET /orders?phone=+966…

Recent orders for a phone (privacy: phone is never echoed). Returns summary rows.

- Used by: `TrackOrderClient` (`useLazyGetOrdersByPhoneQuery`).
- RTK endpoint: `getOrdersByPhone` — tag `Orders`.

## GET /orders/[id]

Full order with items, price breakdown and delivery zone snapshot.

- Used by: order confirmation page (`useGetOrderByIdQuery`), mapped by
  `src/lib/orderDisplay.ts`.
- RTK endpoint: `getOrderById` — tag `Orders`.

## POST /orders

Create an order. Body:
`{ customerName, customerPhone, deliveryAddress, city, notes?, deliveryZoneId?,
discount?, tax?, locale?, tableId?, tableNumber?, items: [{ productId, productName,
productImage, quantity, basePrice, variant?, options?, note? }] }`.

- **All prices are recomputed server-side** — client totals are ignored.
- **Dine-in mode:** When `tableId` is provided, `deliveryAddress`, `city`, and
  `deliveryZoneId` are optional. The server validates the table against the tenant
  and creates the order as `DINE_IN` with no delivery fee.
- Returns `201 { orderId, orderNumber, customerName, totalPrice }`.
- Errors: `400` invalid fields / bad zone / invalid table, `422` closed or below minimum order.
- Used by: checkout (`useCreateOrderMutation` in `RenderOrder.tsx`).
- RTK endpoint: `createOrder` — invalidates `Orders`.

---

## Caching notes

- Reads: Restora sets `Cache-Control` (`restaurant`/`branding` SWR-friendly,
  catalog short, order reads `no-store`).
- Mutations: `no-store`, never cached.
- RTK Query caches in memory per URL; tags only invalidate what they affect.
