# Restora Website Template — AI Development Guide

**Version 1.0.0**

Read this file BEFORE making any code change. This document describes the
**actual** extracted architecture of this Template, not generic advice.

---

## 1. What this project is

A **standalone restaurant Website Template** for the Restora platform.

- It is the customer-facing Website (Home, Menu, Product, Cart, Checkout,
  Orders, Tracking, Delivery, Reservations, Contact, About).
- It contains **no** Dashboard, Admin, Prisma, database clients, server
  actions, or internal Restora server modules.
- It is **not** part of the Restora Dashboard at runtime and must never import
  from it.

## 2. The backend is the Restora Public API — only

```
Website (this template)
    ↓
RTK Query — src/store/api/publicApi.ts
    ↓
Restora Public API — /api/v1/public
    ↓
Restora Server / Domain Layer (external)
    ↓
Prisma / PostgreSQL (external)
```

**The Public API is the only backend contract.** All restaurant data flows
through it. Never bypass it.

### AI SAFETY RULES (non-negotiable)

1. NEVER import Prisma.
2. NEVER import database clients.
3. NEVER access PostgreSQL / Supabase directly.
4. NEVER import Restora Dashboard server modules.
5. NEVER import Restora Admin server modules.
6. NEVER duplicate Restora business logic in the frontend (pricing, offers,
   delivery, order creation, reservation capacity — Restora owns these).
7. NEVER create a second Cart system (one exists: `src/store/features/CartSlice.ts`).
8. NEVER create a second Checkout engine (one exists: `src/Components/Cart/RenderOrder.tsx`).
9. NEVER hardcode restaurant data (name, logo, colors, cuisine, contact,
   products, categories, offers) inside components — it comes from the API.
10. NEVER hardcode `restaurantId` inside components — it comes from
    `NEXT_PUBLIC_RESTORA_RESTAURANT_ID`.
11. NEVER create a second API client — `src/store/api/publicApi.ts` is the only one.
12. Before creating a new API query: read `docs/API_ENDPOINTS.md`, search
    existing endpoints in `src/store/api/publicApi.ts`, reuse if possible.
13. Before creating a new component: search `src/Components/**` first.
14. Before changing data architecture: understand the API contract first
    (`docs/API_ENDPOINTS.md`).
15. Keep UI/design changes isolated from API, RTK Query, Cart, Checkout,
    tenant resolution and business flows.

---

## 3. How to run

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_RESTORA_API_URL + NEXT_PUBLIC_RESTORA_RESTAURANT_ID
npm run dev                  # or: npm run build && npm run start
npm run lint                 # ESLint
```

Environment variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_RESTORA_API_URL` | Base URL of the Restora installation (`/api/v1/public` is appended) |
| `NEXT_PUBLIC_RESTORA_RESTAURANT_ID` | Tenant id — injected as `x-restaurant-id` header + `?restaurantId=` query on every request |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | `en` or `ar` (defaults to `en`) |

---

## 4. Folder structure

```
app/[locale]/                    locale-rooted routes
app/[locale]/layout.tsx          root layout: fonts, metadata, dir=rlt/ltr, Providers, MarketingChrome
app/[locale]/MarketingChrome.tsx Header + Footer + branding CSS vars
app/[locale]/(website)/          all public pages (see §5)
app/globals.css                  design tokens (Tailwind v4)
components/ui/                   shadcn/ui primitives
lib/                             utilities + domain types + pricing adapters
messages/en.json, ar.json        UI copy (next-intl)
public/images/                   static hero/slider assets
src/
  Components/                    UI (About, BestSeller, Cart, Contact, Documents,
                                 Footer, header, Menu, Offers, Order, Product,
                                 Reservations, Shared, Slider, TrackOrder)
  Interfaces/                    shared domain types (ICategory, IProduct, …)
  i18n/                          routing.ts, config.ts, request.ts (next-intl)
  lib/                           pricing engine, i18n helpers, order display,
                                 whatsapp (unused module)
  Providers/                     ReduxProvider, theme-provider, ToastProvider
  store/
    api/publicApi.ts             ★ RTK Query — the ONLY API client
    api/types.ts                 ★ API DTOs + envelope helpers
    features/CartSlice.ts        ★ Cart (Redux)
    store.ts                     configureStore
  Validations/                   zod schemas (login/signup/contact)
```

---

## 5. Pages (all under `app/[locale]/(website)/`)

| Route | File | Data |
| --- | --- | --- |
| `/` (home) | `app/[locale]/page.tsx` | Slider + BestSeller (`useGetHomeQuery`) + PublicOffers (`useGetOffersQuery`) + FloatingMenuCta |
| `/menu` | `menu/page.tsx` → `src/Components/Menu/MenuPage.tsx` | `useGetHomeQuery`, `useGetCategoriesQuery`, `useGetMenuPageQuery` |
| `/cart` | `cart/page.tsx` → `src/Components/Cart/Cart.tsx` → `RenderOrder.tsx` | `useGetDeliveryZonesQuery`, `useGetAvailabilityQuery`, `useCreateOrderMutation`, `useLazyGetProductByIdQuery` |
| `/orders/[orderId]` | `orders/[orderId]/page.tsx` (+ `OrderDetailsClient.tsx`) | `useGetOrderByIdQuery`, `useGetRestaurantQuery`, invoice via `src/lib/orderDisplay.ts` |
| `/track-order` | `track-order/page.tsx` → `src/Components/TrackOrder/TrackOrderClient.tsx` | `useLazyGetOrdersByPhoneQuery`, `useLazyGetOrderByIdQuery` |
| `/reservations` | `reservations/page.tsx` → `PublicReservations.tsx` | `useGetReservationConfigQuery`, `useGetReservationSlotsQuery`, `useCreateReservationMutation`, `useGetRestaurantQuery` |
| `/about` | `about/page.tsx` | static sections (copy from `messages/about.*`) |
| `/contact` | `contact/page.tsx` | static sections + contact form (zod `contactSchema`) |

---

## 6. API layer — RTK Query

Single slice: **`src/store/api/publicApi.ts`** (`reducerPath: "restoraPublicApi"`).

- `baseQuery`: `fetchBaseQuery` with `baseUrl: ${API_URL}/api/v1/public`.
- `prepareHeaders`: injects `x-restaurant-id` from the env var.
- Every request also appends `?restaurantId=` (GET) or sends it as a query
  param (POST) so intermediate caches resolve the tenant.
- Every endpoint unwraps the API envelope `{ success, data, meta? }` in
  `transformResponse` — hooks return plain payloads. Errors surface through
  RTK Query and are read with `apiErrorMessage()` / `apiErrorCode()` from
  `src/store/api/types.ts`.
- Types mirror the **API DTOs**, not Prisma (`src/store/api/types.ts`).

### Endpoints

| RTK endpoint | HTTP | REST URL |
| --- | --- | --- |
| `getRestaurant` | GET | `/restaurant` |
| `getAvailability` | GET | `/restaurant/availability` |
| `getHome` | GET | `/home` |
| `getCategories` | GET | `/categories` |
| `getMenuPage` | GET | `/products?categoryId&page&limit` |
| `getProductById` | GET | `/products/[id]` |
| `getOffers` | GET | `/offers` |
| `getDeliveryZones` | GET | `/delivery-zones` |
| `getReservationConfig` | GET | `/reservations/config` |
| `getReservationSlots` | GET | `/reservations/slots?date=` |
| `createReservation` | POST | `/reservations` |
| `resolveTable` | GET | `/tables/resolve` |
| `getOrdersByPhone` | GET | `/orders?phone=` |
| `getOrderById` | GET | `/orders/[id]` |
| `createOrder` | POST | `/orders` |

### Tags & invalidation

`tagTypes`: `Restaurant, Availability, Home, Categories, Products, Offers,
DeliveryZones, Reservations, Orders, Tables`.

- `createOrder` → invalidates `Orders`.
- `createReservation` → invalidates `Reservations`.
- No refetch-everything-on-mutation behavior.

How to add a query: add an endpoint to `publicApi.ts`, export the hook, reuse
existing types from `src/store/api/types.ts`. Do NOT create a second client.

---

## 7. Cart (`src/store/features/CartSlice.ts`)

- **Inputs only:** `items`, `deliveryZone`, `table`, `discount`, `tax`.
- **Derived values are never stored** — subtotal/total/delivery are computed
  on demand via the Pricing Engine (`src/lib/pricing`, wrapped by `lib/utils.ts`).
- Persisted to `localStorage` (`lib/localStorageHandle.ts`) — items + selected
  zone + active dine-in table. Hydrated client-side after mount to avoid SSR/CSR
  mismatch (`hydrateCart` action).
- Item merge is keyed by productId + variantId + sorted option ids.
- The dine-in table is set by `TableResolver` after a successful QR scan and is
  cleared by `clearCart`, an explicit "leave table" action, or an invalid table.
- Cart pages: `src/Components/Cart/` — `RenderOrder.tsx` (container),
  `ShoppingCart/*` (presentation), `DeliveryZones/*`, `EditCartDialog.tsx`.

## 8. Checkout

`src/Components/Cart/RenderOrder.tsx` orchestrates: items list → delivery zone
selector → summary (Pricing Engine) → `CheckoutForm` (collects
name/phone/address/city/notes) → `createOrder` mutation.

- When the cart has an active dine-in table (set via QR scan), checkout switches
  to DINE_IN mode: the delivery zone/address/city fields are hidden, the delivery
  fee is zero, and `tableId`/`tableNumber` are sent to `createOrder`.
- Restora recomputes all prices server-side. The client sends
  productId/quantity/basePrice/variant/options and the server prices it.
- `RestaurantClosedBanner` gates submission when closed.
- On success: stores a minimal `lastOrder` ref in localStorage, clears the
  cart, routes to `/orders/[orderId]`.

## 9. Orders & documents

- Tracking: `src/Components/TrackOrder/TrackOrderClient.tsx` (phone lookup).
- Details: `app/[locale]/(website)/orders/[orderId]/page.tsx` maps API payload
  through `src/lib/orderDisplay.ts` (`mapOrderDetail`, `buildInvoice`,
  `buildRestaurant`) into `src/Components/Order/*` components.
- Printable invoice: `src/Components/Documents/` (InvoiceDialog, mappers,
  PrintableOrder, KitchenTicket) — client-side print, no server.

## 10. Delivery

- Zones come from `useGetDeliveryZonesQuery` (`/delivery-zones`).
- Selection stored in the Cart slice (`setDeliveryZone`), passed to
  `createOrder` as `deliveryZoneId`. Restora validates the zone and computes
  the fee. **Zones are never hardcoded.**

## 11. Reservations

`src/Components/Reservations/PublicReservations.tsx`:
- `useGetReservationConfigQuery` → capacity/maxGuests/interval/window.
- `useGetReservationSlotsQuery({ date })` → slot grid (heatmap disabled slots).
- `useCreateReservationMutation` → `POST /reservations`.
- Slot rejection reasons (`reservations.capacityFull`, etc.) map to localized
  messages via `reservations.slotReason` keys. `apiErrorKey`/`apiErrorShortfall`
  in `src/store/api/types.ts` decode machine codes.

## 12. Products / Variants / Options

- Categories: `useGetCategoriesQuery`. Products: `useGetMenuPageQuery`
  (paginated), `useGetProductByIdQuery` (variants + option groups).
- Add-to-cart modal: `src/Components/Product/AddToCartDialog/index.tsx` —
  variant selector, option groups (min/max selection), quantity.
- Domain types: `src/Interfaces/index.ts` (`ICategory`, `IProduct`,
  `IProductVariant`, `IOptionGroup`, `IOption`, `IProductWithOptions`,
  `IHomeProduct`, `IHomeSection`).

## 13. Branding

- `src/Components/Footer/data.ts` exports `usePublicSettings()` →
  `useGetRestaurantQuery` (shared cached snapshot).
- `app/[locale]/MarketingChrome.tsx` applies
  `publicSettings.branding.primaryColor` as `--primary`/`--ring` CSS vars.
- Header/Footer show `restaurantName` from the API (fallback
  `common.brandName`). **No restaurant identity is hardcoded.**

## 14. Localization

- **Architecture:** next-intl. `src/i18n/routing.ts` (locales `en`/`ar`,
  `localePrefix: "always"`), `middleware.ts` (next-intl middleware),
  `src/i18n/request.ts` (loads `messages/{locale}.json`).
- **UI copy:** `messages/en.json` + `messages/ar.json` (keep in sync —
  structural parity is required; both are used by the same components).
- **RTL:** `<html dir>` in `app/[locale]/layout.tsx`. Directional icons via
  `src/lib/i18n/DirectionalIcons.tsx` (`IconBack`, `IconForward`, …).
- **API content:** localized via `?locale=` per request — the API returns
  translated product/category/zone/offer names.
- Metadata is localized via `generateMetadata` + `getTranslations` per page.

## 15. Design vs data separation

**Never mix.** UI components must not contain business logic; business logic
must not live in JSX.

| Layer | Location |
| --- | --- |
| Presentation components | `src/Components/*` |
| Server data (RTK Query) | `src/store/api/*` |
| State (cart) | `src/store/features/CartSlice.ts` |
| Pricing / money math | `src/lib/pricing/*` (+ `lib/utils.ts` adapters) |
| Domain types | `src/Interfaces/*`, `lib/restaurant.ts` |
| Validation | `src/Validations/*` |
| Localization | `messages/*.json`, `src/i18n/*` |

---

## 16. Files that should NOT be modified casually

- `src/store/api/publicApi.ts` — the only API client; changing it changes the
  data contract for the whole app.
- `src/store/api/types.ts` — API DTOs; must mirror the Restora Public API.
- `src/store/features/CartSlice.ts` — cart state + persistence contract.
- `src/lib/pricing/*` — money math; must match Restora server pricing.
- `src/i18n/routing.ts` / `middleware.ts` — locale routing contract.
- `next.config.ts` — next-intl plugin + image config.
- `messages/en.json` + `messages/ar.json` — always edit BOTH together.

Safe to change freely: anything under `src/Components/**`, `app/globals.css`,
`components/ui/**`, slider design, animations, copy in `messages/**`.

---

## 17. How to add things

### Add a page
1. Create `app/[locale]/(website)/my-page/page.tsx`.
2. Localize metadata with `getTranslations` (add `myPage.meta` keys to BOTH
   message files).
3. Compose existing `src/Components`; use RTK hooks for data.

### Add an API query
1. Check `docs/API_ENDPOINTS.md` — if Restora already exposes the endpoint,
   reuse it.
2. Add the endpoint to `src/store/api/publicApi.ts` with a proper
   `providesTags` entry.
3. Export the hook; type the response in `src/store/api/types.ts`.

### Add a mutation
1. Add to `publicApi.ts` with `invalidatesTags` for exactly the tags affected.
2. Never refetch unrelated data.

### Add a component
1. Search `src/Components/**` for an existing pattern and reuse it.
2. Presentation components take props; data comes from hooks in the container.

---

## 18. Creating a new restaurant website

1. Copy/clone this folder.
2. `npm install`.
3. Set `NEXT_PUBLIC_RESTORA_API_URL` + `NEXT_PUBLIC_RESTORA_RESTAURANT_ID`.
4. `npm run dev` — the Website connects to Restora automatically.
5. Redesign UI (`src/Components/**`, `app/globals.css`, `messages/*.json`).
6. Deploy.

No modification of the Restora Dashboard is required to create a new Website.

---

## 19. Specialized docs

- `docs/ARCHITECTURE.md`
- `docs/API_ENDPOINTS.md`
- `docs/TENANT.md`
- `docs/RTK_QUERY.md`
- `docs/CART.md`
- `docs/CHECKOUT.md`
- `docs/ORDERS.md`
- `docs/DELIVERY.md`
- `docs/RESERVATIONS.md`
- `docs/PRODUCTS.md`
- `docs/BRANDING.md`
- `docs/LOCALIZATION.md`
- `docs/CUSTOMIZATION.md`
