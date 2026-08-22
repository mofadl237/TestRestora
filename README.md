# Restora Website Template — v1.0.0

A **complete, runnable, production-ready restaurant website** frontend for the
[Restora](https://github.com/) restaurant platform.

This is not a starter or a UI mockup. It is the full customer-facing Website
architecture of Restora (Home, Menu, Product, Cart, Checkout, Orders, Order
Tracking, Delivery, Reservations, Contact, About) extracted into a standalone
project that talks **only** to the Restora **Public API**.

> The template is a snapshot of the Website architecture. It contains **no**
> Dashboard, Admin, Prisma, database clients, or server code.

---

## Architecture at a glance

```
Website (this template)
    ↓
RTK Query  (src/store/api/publicApi.ts)
    ↓
Restora Public API  (/api/v1/public)
    ↓
Restora Server / Domain Layer
    ↓
Prisma / PostgreSQL (Restora backend — NOT this project)
```

- **Backend contract:** the Restora Public API (`/api/v1/public`). See `docs/API_ENDPOINTS.md`.
- **Server data:** RTK Query (Redux Toolkit). See `docs/RTK_QUERY.md`.
- **Tenant:** configured with `NEXT_PUBLIC_RESTORA_RESTAURANT_ID`. See `docs/TENANT.md`.
- **Branding:** loaded from the API (`/restaurant`) and applied as CSS variables. See `docs/BRANDING.md`.
- **Localization:** next-intl with `en` + `ar` (RTL/LTR). See `docs/LOCALIZATION.md`.

Detailed documentation lives in [`docs/`](docs/ARCHITECTURE.md).

---

## Prerequisites

| Tool      | Version            |
| --------- | ------------------ |
| Node.js   | **20.9+** (22 LTS recommended) |
| npm       | 10+ (ships with Node) |
| Restora   | a running Restora instance with the Public API enabled |

---

## Quick start

```bash
# 1. Install dependencies (npm is the project's package manager)
npm install

# 2. Configure the environment
cp .env.example .env.local
#    NEXT_PUBLIC_RESTORA_API_URL=https://your-restora.example.com
#    NEXT_PUBLIC_RESTORA_RESTAURANT_ID=<restaurant id>

# 3. Run
npm run dev
```

Open http://localhost:3000.

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_RESTORA_API_URL` | ✅ | Base URL of the Restora installation. `/api/v1/public` is appended automatically. |
| `NEXT_PUBLIC_RESTORA_RESTAURANT_ID` | ✅ | The restaurant tenant. Sent as `x-restaurant-id` header + `?restaurantId=` query on every request. |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | ⬜ | `en` or `ar`. Default UI language (defaults to `en`). |

There are **no secrets**. All reads are unauthenticated public endpoints. The
only other variables in the codebase (`META_WHATSAPP_*`) belong to an unused
utility module (`src/lib/whatsapp`) — ignore them.

---

## How to connect a restaurant

1. Create the restaurant in the **Restora Dashboard** and add its products,
   categories, offers, delivery zones, reservation settings and branding.
2. In the Dashboard, copy the restaurant's id.
3. Set it as `NEXT_PUBLIC_RESTORA_RESTAURANT_ID` in `.env.local`.
4. Restart the dev server. The Website now renders that restaurant's data —
   no code changes required.

One template → any restaurant:

```
Website A → restaurantId=A
Website B → restaurantId=B
Website C → restaurantId=C
```

Same template. Same API. Different tenant.

---

## How data flows

### RTK Query

All server data goes through one RTK Query slice: `src/store/api/publicApi.ts`.
It injects the tenant header/query automatically and unwraps the API envelope
(`{ success, data, meta }`) so components receive plain typed payloads.

- Queries: restaurant, availability, home, categories, products (paginated),
  product by id, offers, delivery zones, reservation config, reservation slots,
  orders by phone, order by id.
- Mutations: `createOrder`, `createReservation`.
- Cache tags: `Restaurant`, `Availability`, `Home`, `Categories`, `Products`,
  `Offers`, `DeliveryZones`, `Reservations`, `Orders` — mutations invalidate
  only the resources they affect.

### Cart

Redux slice (`src/store/features/CartSlice.ts`), persisted to `localStorage`.
Items support variants, option groups and quantities. The cart stores **inputs**
(items, selected delivery zone, discount, tax) — totals are derived with the
Pricing Engine (`src/lib/pricing`) and are **never** stored.

### Checkout

`src/Components/Cart/RenderOrder.tsx` → `CheckoutForm` + `createOrder`
mutation. All prices are recomputed server-side by Restora; the client only
collects input and validates required fields. On success the cart is cleared
and the guest is taken to `/orders/[orderId]`.

### Orders & tracking

- `track-order` — lookup by phone (`useGetOrdersByPhoneQuery`).
- `orders/[orderId]` — confirmation + timeline (`useGetOrderByIdQuery`),
  invoice download (client-side print document).

### Branding

`usePublicSettings` (RTK Query `/restaurant`) provides `branding.primaryColor`,
which is applied in `app/[locale]/MarketingChrome.tsx` as the `--primary` /
`--ring` CSS variables. Change the color in the Dashboard → the Website
re-themes itself.

### Reservations

`src/Components/Reservations/PublicReservations.tsx` consumes
`/reservations/config`, `/reservations/slots` and creates via
`POST /reservations`.

---

## Localization

- **UI chrome:** next-intl, `messages/en.json` + `messages/ar.json`.
- **Locale routing:** `/[locale]/...` with a language switcher in the header
  (`localePrefix: "always"`).
- **RTL/LTR:** automatic via `<html dir>`. Directional icons are flipped with
  `src/lib/i18n/DirectionalIcons.tsx`.
- **Content:** translated product/category/offer names come from the API via
  `?locale=` — never hardcoded.

See `docs/LOCALIZATION.md`.

---

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
```

---

## Deployment

The template is a standard Next.js app — deploy anywhere Next.js runs:

- **Vercel** — connect the repo, set the 3 env vars, deploy.
- **Node host / Docker** — `npm run build` then `npm run start`.
- **Any static/hybrid host** — supported by Next.js.

Set the same env vars in the hosting platform. No database is required.

---

## Customizing the design safely

Everything that is **data / API / business flow** is separated from
**UI / design**:

| Keep intact (data)                      | Safe to change (design)                     |
| --------------------------------------- | ------------------------------------------- |
| `src/store/api/*` (RTK Query)           | `src/Components/*` (UI)                     |
| `src/store/features/CartSlice.ts`       | `app/globals.css` (colors, fonts)           |
| `src/lib/pricing/*` (Pricing Engine)    | `src/Components/Slider` (hero design)       |
| `src/Validations/*`                     | `messages/*.json` (copy per restaurant)     |
| tenant resolution (env vars)            | `components/ui/*` (shadcn primitives)       |

See `docs/CUSTOMIZATION.md` for the full guide.

---

## Repository layout

```
app/                        Next.js App Router pages (per locale)
components/ui/              shadcn/ui primitives
lib/                        utilities, currency, pricing adapters, restaurant types
messages/                   en.json + ar.json (localized copy)
src/
  Components/               UI components (header, cart, menu, orders, …)
  Interfaces/               shared domain types
  i18n/                     routing, config, request (next-intl)
  lib/                      pricing engine, i18n helpers, order display
  Providers/                Redux, theme, toast providers
  store/                    Redux store, Cart slice, RTK Query API + types
  Validations/              zod schemas
public/                     static assets (slider images)
```

---

## Documentation

| Doc | What it covers |
| --- | --- |
| `docs/ARCHITECTURE.md` | Full architecture, folder structure, design/data separation |
| `docs/API_ENDPOINTS.md` | Every Public API endpoint consumed, mapping to RTK endpoints |
| `docs/TENANT.md` | How the restaurant is selected per request |
| `docs/RTK_QUERY.md` | Query/mutation/tag/invalidation details |
| `docs/CART.md` | Cart slice, persistence, pricing |
| `docs/CHECKOUT.md` | Checkout flow and order creation |
| `docs/ORDERS.md` | Order confirmation, tracking, invoice |
| `docs/DELIVERY.md` | Delivery zones flow |
| `docs/RESERVATIONS.md` | Reservation experience |
| `docs/PRODUCTS.md` | Categories, products, variants, options |
| `docs/BRANDING.md` | Dynamic restaurant theming |
| `docs/LOCALIZATION.md` | i18n, RTL/LTR, message files |
| `docs/CUSTOMIZATION.md` | How to redesign safely |
