# Architecture — Restora Website Template v1.0.0

This template is a **standalone Next.js frontend** for the Restora restaurant
platform. It consumes **only** the Restora Public API and contains no backend
code, database access, or dashboard/admin logic.

```
Website (this template)
    ↓
RTK Query — src/store/api/publicApi.ts
    ↓
Restora Public API — /api/v1/public
    ↓
Restora Server / Domain Layer (external)
    ↓
Prisma → PostgreSQL / Supabase (external)
```

---

## Stack

- **Next.js 16 (App Router)** — `app/[locale]/...` with `(website)` route group.
- **React 19** — Server Components by default; `"use client"` only where needed.
- **Redux Toolkit + RTK Query** — single API client (`src/store/api/publicApi.ts`)
  + cart slice (`src/store/features/CartSlice.ts`).
- **next-intl** — locale routing, request config, message files.
- **TailwindCSS v4** (`app/globals.css`) + **shadcn/ui** (`components/ui/`).
- **Framer Motion** — animations (`src/Components/**/animations.ts`, variants).
- **Zod** — form validation (`src/Validations/index.ts`).

---

## Folder structure

```
app/
  [locale]/
    layout.tsx              Root layout: fonts, metadata, dir (rtl/ltr), Providers,
                            MarketingChrome, NextIntlClientProvider
    MarketingChrome.tsx     Header + Footer + branding CSS variables (client)
    page.tsx                Home: Slider + BestSeller + PublicOffers + FloatingMenuCta
    (website)/
      about/  cart/  contact/  menu/
      orders/[orderId]/     Confirmation + timeline + invoice
      reservations/  track-order/
components/ui/              shadcn/ui primitives (button, dialog, field, …)
lib/
  currency.ts               money formatting (formatMoney)
  restaurant.ts             domain types + pure availability logic (no DB)
  time.ts                   timezone-aware date helpers
  toast.ts                  lightweight toast system (custom, not sonner)
  utils.ts                  cn() + pricing adapters (cartItemToLine, calcSubtotal, …)
  localStorageHandle.ts     localStorage persistence helpers
messages/en.json, ar.json   UI copy (next-intl)
src/
  Components/               UI — see §Components below
  Interfaces/               shared domain types (ICategory, IProduct, …)
  i18n/
    routing.ts              locales en/ar, localePrefix "always"
    config.ts               static i18n runtime config
    request.ts              next-intl getRequestConfig → loads messages/{locale}.json
  lib/
    pricing/                ★ Pricing Engine (calculateOrderSummary, calcUnitPrice, …)
    i18n/                   DirectionalIcons.tsx, useLocaleDirection.ts, AnimationHelpers.ts
    orderDisplay.ts         maps API order → UI (mapOrderDetail, buildInvoice, buildRestaurant)
    whatsapp/               unused module (dead code — safe to delete)
  Providers/                Providers.tsx (compose), ReduxProvider.tsx,
                            theme-provider.tsx, ToastProvider.tsx
  store/
    api/publicApi.ts        ★ RTK Query — the ONLY API client
    api/types.ts            ★ API DTOs + envelope helpers (apiErrorMessage, …)
    features/CartSlice.ts   ★ Cart state + persistence
    store.ts                configureStore
  Validations/              zod schemas (contactSchema, loginSchema, signUpSchema)
public/images/              static hero/slider assets
```

---

## Pages (under `app/[locale]/(website)/`)

| Route | Page component | Data layer |
| --- | --- | --- |
| `/` | `page.tsx` | `useGetHomeQuery`, `useGetOffersQuery` |
| `/menu` | `menu/page.tsx` → `src/Components/Menu/MenuPage.tsx` → `MenuPageClient.tsx` | `useGetHomeQuery`, `useGetCategoriesQuery`, `useGetMenuPageQuery` |
| `/cart` | `cart/page.tsx` → `src/Components/Cart/Cart.tsx` → `RenderOrder.tsx` | `useGetDeliveryZonesQuery`, `useGetAvailabilityQuery`, `useCreateOrderMutation`, `useLazyGetProductByIdQuery` |
| `/orders/[orderId]` | `orders/[orderId]/page.tsx` (+ `OrderDetailsClient.tsx`) | `useGetOrderByIdQuery`, `useGetRestaurantQuery`, `src/lib/orderDisplay.ts` |
| `/track-order` | `track-order/page.tsx` → `TrackOrderClient.tsx` | `useLazyGetOrdersByPhoneQuery`, `useLazyGetOrderByIdQuery` |
| `/reservations` | `reservations/page.tsx` → `PublicReservations.tsx` | `useGetReservationConfigQuery`, `useGetReservationSlotsQuery`, `useCreateReservationMutation`, `useGetRestaurantQuery` |
| `/about` | `about/page.tsx` | static (copy from `messages/about.*`) |
| `/contact` | `contact/page.tsx` | static + form (zod `contactSchema`) |

---

## Components (`src/Components/`)

| Folder | Responsibility |
| --- | --- |
| `header/` | Header, NavBar, CartButton, LanguageSwitcher, ToggleMode (theme) |
| `Footer/` | Footer + `usePublicSettings()` hook (RTK `/restaurant`) |
| `Slider/` | Hero slider (media from `src/data/index.ts` + copy from `hero.slides`) |
| `BestSeller/` | Home best-seller rails (`useGetHomeQuery`) |
| `Offers/` | Public offers (`useGetOffersQuery`) |
| `Menu/` | Menu page container + grid, search, category tabs, empty state |
| `Product/` | Product card + `AddToCartDialog` (variant/option/quantity) |
| `Cart/` | Cart container (`RenderOrder.tsx`), shopping cart, delivery zones, edit dialog, closed banner |
| `Order/` | Order confirmation components (timeline, items, price summary, customer info) |
| `TrackOrder/` | Order lookup by phone |
| `Reservations/` | Reservation booking experience |
| `About/`, `Contact/` | Marketing sections (copy from messages) |
| `Documents/` | Printable invoice / kitchen ticket / printable order |
| `Shared/` | AnimatedPrice, FloatingMenuCta |

---

## Business logic (never in JSX)

- **Pricing Engine** — `src/lib/pricing/` (`calculateOrderSummary`,
  `calcUnitPrice`, `calcLineTotal`, `calcSubtotal`, `calcDeliveryFee`,
  `calcDiscountAmount`, `calcTaxAmount`, `validateMinimumOrder`).
  Adapters live in `lib/utils.ts` (`cartItemToLine`, `calcSubtotal`, `calcTotal`).
- **Availability** — `lib/restaurant.ts` (`getAvailability`, pure, timezone-aware).
- **Order display** — `src/lib/orderDisplay.ts`.
- **Validation** — `src/Validations/index.ts`.

---

## Design / data separation

| Data (keep intact) | Design (safe to change) |
| --- | --- |
| `src/store/api/*` | `src/Components/**` |
| `src/store/features/CartSlice.ts` | `app/globals.css`, `components/ui/*` |
| `src/lib/pricing/*`, `lib/restaurant.ts` | slider + hero design |
| `src/Interfaces/*`, `src/store/api/types.ts` | `messages/*.json` copy |
| tenant env vars | `next.config.ts` fonts/images |

Redesigning a page never requires touching RTK Query, Cart, Checkout, tenant
resolution, or the Pricing Engine.
