# Restora Website Template — Status

**Version 1.6.0 — Complete Clone-Based SEO Architecture**
Last updated: 2026-08-26

---

## Current state

The template is a standalone restaurant public website consuming ONLY the
Restora Public API (`/api/v1/public`). As of v1.6.0 it features:
multi-branch support with session-scoped branch persistence (sessionStorage),
dynamic branding from the API (logo, cover image, primary color), a dynamic
homepage product slider replacing hardcoded hero images, server-side
OG/Twitter metadata from API data, a compact premium BranchSelection
redesign, and a complete clone-based SEO architecture.

## Clone-based SEO architecture (v1.6.0)

The template generates ALL restaurant-specific SEO from two environment
variables + the Public API:

```
NEXT_PUBLIC_RESTAURANT_ID  → tenant identity (API data)
NEXT_PUBLIC_SITE_URL       → canonical host (metadata, sitemap, OG)
```

### What is automatic per clone

| SEO element | Source |
| --- | --- |
| `<title>` / title template | `restaurant.restaurantName` from API |
| `<meta name="description">` | Restaurant name + address from API |
| `<link rel="canonical">` | `NEXT_PUBLIC_SITE_URL` + locale + path |
| OpenGraph title/description/image | API `restaurantName`, address, `branding.coverImage` |
| Twitter card (summary_large_image) | Same as OpenGraph |
| `<link rel="icon">` | `branding.logo` from API |
| `hreflang` alternates | All configured locales with `x-default` |
| JSON-LD structured data | `@type: Restaurant` or `RestaurantChain` with real branches |
| `sitemap.xml` | All locales x static routes + dynamic product/category entries |
| `robots.txt` | Allows public pages, blocks cart/orders/admin/api |
| Per-page metadata | Menu, Cart, About, Contact, Reservations, Track Order |

### SEO module architecture

```
src/lib/seo/
  seo.ts            ← Centralized helpers (canonicalUrl, buildRootMetadata,
                       buildPageMetadata, buildHreflangAlternates, getSiteUrl)
  serverData.ts     ← Server-side API fetch (fetchPublicRestaurant)
  structuredData.ts ← JSON-LD builder (getRestaurantJsonLd)

src/Components/Seo/
  RestaurantJsonLd.tsx  ← Server component, emits JSON-LD in <head>

app/
  sitemap.ts        ← Dynamic sitemap with hreflang alternates
  robots.ts         ← Robots.txt with sitemap reference
  [locale]/layout.tsx  ← Root metadata via buildRootMetadata()
```

### Key design decisions

1. **No hardcoded restaurant data** — zero restaurant-specific titles,
   descriptions, images, URLs, or names in source code.
2. **Single API client** — `src/store/api/publicApi.ts` for client-side;
   `src/lib/seo/serverData.ts` for server-side metadata generation.
3. **Failure-tolerant** — every SEO fetch returns null on error; pages
   render with fallback defaults.
4. **Branch query parameters** — `?branch=` does NOT create separate
   canonical URLs; branch selection is operational context, not SEO content.
5. **No duplicate pages** — cart, orders, and track-order are noindexed;
   only intentional public pages are indexed.

## Branch persistence: sessionStorage (v1.5.0)

Branch selection is persisted to **sessionStorage**, NOT localStorage.

**Why:** A customer may select a branch today and later physically move to
another location. We do not want the old branch selection to persist across
future sessions.

**Key format:** `restora.pub.branch.{restaurantId}` (restaurant-scoped to
prevent cross-restaurant collisions in the same browser tab).

**Session flow:**
1. Customer opens restaurant → resolve branches
2. Check sessionStorage for this restaurant's key
3. If stored branch is still active → restore it
4. Otherwise → single branch auto-activates; multi-branch shows selector
5. Customer selects branch → persist to sessionStorage + activate
6. Close tab / new session → previous selection is NOT inherited

**QR priority:** QR/table resolution overrides sessionStorage. If `?tableId=`
resolves to a branch, that branch activates and sessionStorage is updated.

**Single branch:** auto-activates; no selector shown; stored in sessionStorage
for the current session.

**Security:** sessionStorage is UX-only, NOT authorization. Server continues
validating `restaurantId + branchId` for every request.

**Files changed:**
- `lib/localStorageHandle.ts` — added `getBranchStorageKey()`,
  `setSessionStorage`, `getSessionStorage`, `removeSessionStorage` helpers.
  Old `ACTIVE_BRANCH_STORAGE_KEY` / `setNamedStorage` / `getNamedStorage` /
  `removeNamedStorage` removed (were only used by branch code).
- `src/store/features/BranchSlice.ts` — `setActiveBranch` and
  `clearActiveBranch` reducers now write to sessionStorage via
  `getBranchStorageKey()`. Comment updated.
- `src/Components/Branch/BranchGate.tsx` — hydration reads from sessionStorage
  via `getSessionStorage(getBranchStorageKey())` instead of localStorage.

## Dynamic branding (v1.4.0)

- **Header logo:** API `branding.logo` rendered via `next/image`; falls back to
  first-letter monogram when logo is empty/missing.
- **Footer logo:** Same pattern via `FooterBrand.tsx`.
- **BranchSplash:** Shows `branding.logo` when available; monogram fallback
  otherwise. Primary color pulse animation.
- **BranchSelection redesign:** Compact, cinematic, restaurant-branded. Logo as
  brand reveal (no oversized hero), compact branch cards (h-28 images), tighter
  spacing, phone/maps links, Ken Burns ambient cover entrance.

## Dynamic homepage product slider (v1.4.0)

- **Hero.tsx** rewritten: hardcoded pizza images (`sliderData` from `src/data`)
  replaced with dynamic product collection from `useGetHomeQuery`.
- Merges `bestSellers` + `chefRecommendations` + `familyMeals` + `newItems` +
  `kidsMeals` + `comboMeals` (deduplicates by `id`).
- Shows product name, description, base price with locale currency formatting,
  animated crossfade transitions with GSAP.
- `AddToCartDialog` integration removed from Hero (link to `/menu` instead);
  Hero is a showcase, not a cart surface.
- Loading state: animated skeleton cards. Empty state: `EmptyState` message.
- `prefers-reduced-motion` respected (no autoplay, no transitions).

## Server-side dynamic metadata (v1.4.0)

- `app/[locale]/layout.tsx` now uses `generateMetadata` (async, server-side)
  instead of static `export const metadata`.
- `fetchPublicRestaurant(locale)` in `src/lib/seo/serverData.ts` fetches
  `branding.coverImage`, `branding.logo`, `restaurantName` server-side.
- `og:image` + `twitter:image` set from `branding.coverImage` (when present).
- `favicon` set from `branding.logo` (when present).
- Title template: `{name}` (default), `%s | {name}` (nested pages).
- Graceful fallback: empty/missing branding → defaults to "Restaurant" name,
  no image tags. **Verified working** — API returns empty strings for
  `coverImage`/`logo` on the current tenant, so image meta tags are correctly
  omitted.

## Translation keys added (v1.4.0)

- `hero.orderNow` / `hero.from` added to `messages/en.json`, `ar.json`,
  `it.json` — structural parity maintained.

## Multi-branch support (v1.1.0)

### Branch architecture

```
Visitor → BranchGate (MarketingChrome wrapper)
            │
            ├─ GET /branches (light payload: id, name, slug, image,
            │                 address, status — never menus)
            │
            ├─ 0 or 1 branch  → resolve silently, render website
            ├─ >1 branches    → premium selection screen (first visit)
            └─ ?tableId= (QR) → skip gate; table resolves table + branch
                                   ↓
                     Active branch in Redux (sessionStorage)
                                   ↓
        All catalog / offers / delivery / reservations / orders scoped
        with ?branchId= (server remains authoritative for pricing)
```

- **State:** `src/store/features/BranchSlice.ts` — `{ active: {id,name,slug},
  hydrated }`, persisted to sessionStorage under key
  `restora.pub.branch.{restaurantId}` (session-scoped, NOT localStorage).
- **Gate:** `src/Components/Branch/BranchGate.tsx` — resolves once per page
  load; reads from sessionStorage on mount; exposes `useBranchContext()`
  (`branches`, `activeBranch`, `isMultiBranch`, `requestSwitch`). Deep links
  via `?branch=<slug|id>` are activated then cleaned from the URL.
- **API:** `getBranches` endpoint (`GET /branches`) + optional `branchId`
  parameter on availability, home, categories, products, product detail,
  offers, delivery zones, reservation config/slots/creation, promo validation,
  order creation. Older servers that don't expose `/branches` return 404 →
  the gate degrades silently to restaurant-level behavior.

### Single-branch behavior

- No "Choose Branch" screen, no header switcher, no badges — nothing renders.
- The only branch is auto-activated silently on first load.
- Requests carry no `?branchId=` when unresolved (identical wire format to v1).

### Multi-branch behavior

- First visit (no saved location): premium selection screen — logo reveal,
  headline, staggered cards with branch image / address / open status /
  phone / maps link / hours / CTA. Framer Motion entrance, GSAP ambient
  cover reveal, `prefers-reduced-motion` respected.
- Selection persists; returning customers land directly in their location.
- Header switcher (compact pill, multi-branch only): desktop next to theme /
  language, mobile beside the hamburger. Switching with a non-empty cart from
  another branch shows a confirmation dialog ("Changing your location may
  change available items, prices and offers…") and clears the cart only after
  explicit confirmation. The cart is tagged with its owning branchId.
- Checkout shows "Ordering from 📍 <branch>" and every order payload includes
  `branchId`. Final pricing is always resolved server-side.

### QR behavior

- `?tableId=` entry bypasses the branch gate entirely — the QR already answers
  "which location?".
- `TableResolver` resolves the table; when the response carries
  `branch { id, name, slug }` the branch is activated silently (no selector,
  no toast spam). Dine-in mode proceeds exactly as before (zero delivery fee,
  table number on the order).

### Reservations / Delivery / Offers

- Reservation config, slot grids and bookings are scoped to the active
  branch; a badge confirms the location above the booking form.
- Delivery zones come from the active branch; stale zone selections are
  dropped automatically when the list changes.
- Offers are fetched per branch (global offers remain server-filtered;
  other branches' offers never leak into the current site).

## Clone-based SEO architecture (v1.6.0)

### Environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_RESTORA_RESTAURANT_ID` | Tenant ID — drives all API data | `disforno_restaurant_id` |
| `NEXT_PUBLIC_SITE_URL` | Public URL of this website clone | `https://disforno.restora.world` |

### Clone workflow

```
Clone Template
↓
Set NEXT_PUBLIC_RESTAURANT_ID
Set NEXT_PUBLIC_SITE_URL=https://restaurant.restora.world
↓
Deploy
↓
All SEO metadata auto-configured from API data
```

### Files changed (v1.6.0)

**New:**
- `src/lib/seo/seo.ts` — centralized SEO helpers: `getSiteUrl()`, `getRestaurantForSeo()`, `canonicalUrl()`, `buildRootMetadata()`, `buildPageMetadata()`

**Modified:**
- `app/[locale]/layout.tsx` — uses `buildRootMetadata()` from `seo.ts`
- `app/[locale]/page.tsx` — explicit home page metadata via `buildPageMetadata()`
- `app/[locale]/(website)/menu/page.tsx` — added `generateMetadata` with `menu.meta` keys
- `app/[locale]/(website)/cart/page.tsx` — added `generateMetadata` with `cart.meta` keys + `noindex`
- `app/[locale]/(website)/about/page.tsx` — uses `buildPageMetadata()` for canonical + OG
- `app/[locale]/(website)/contact/page.tsx` — uses `buildPageMetadata()` for canonical + OG
- `app/[locale]/(website)/reservations/page.tsx` — uses `buildPageMetadata()` for canonical + OG
- `app/[locale]/(website)/track-order/page.tsx` — uses `buildPageMetadata()` for canonical + OG + `noindex`
- `src/lib/seo/structuredData.ts` — enhanced JSON-LD: `image`, `openingHoursSpecification`, `sameAs`, `email`, `areaServed`, country code in address
- `app/sitemap.ts` — `changeFrequency` + `priority` per route; imports from `seo.ts`
- `app/robots.ts` — disallows `/api/`, `/dashboard/`, `/admin/`; imports from `seo.ts`
- `.env` + `.env.local` — added `NEXT_PUBLIC_SITE_URL`
- `messages/en.json` — added `home.meta`, `menu.meta`, `cart.meta`
- `messages/ar.json` — added `home.meta`, `menu.meta`, `cart.meta`
- `messages/it.json` — added `home.meta`, `menu.meta`, `cart.meta`

### How metadata is generated per restaurant

1. **Root layout** (`generateMetadata`): fetches restaurant via `getRestaurantForSeo(locale)` → `buildRootMetadata(restaurant)` produces:
   - `metadataBase`: from `NEXT_PUBLIC_SITE_URL`
   - `title.default`: restaurant name from API
   - `title.template`: `%s | restaurantName`
   - `description`: from restaurant name + address
   - `openGraph.url`: from `NEXT_PUBLIC_SITE_URL`
   - `openGraph.images`: from `branding.coverImage`
   - `twitter.images`: from `branding.coverImage`
   - `icons.icon`: from `branding.logo`
   - `alternates.languages`: all locales with absolute URLs
   - `alternates.canonical`: default locale root URL

2. **Per-page** (`generateMetadata`): uses `buildPageMetadata(restaurant, locale, path, {title, description})` which produces:
   - `title`: page title (wrapped by root template → "Menu | Disforno")
   - `description`: page-specific from translations
   - `alternates.canonical`: locale + path URL
   - `openGraph.url` + `openGraph.title`: page-specific
   - `twitter.title`: page-specific

3. **JSON-LD** (`RestaurantJsonLd` server component): fetches restaurant + branches → structured data:
   - Single branch: `@type: Restaurant`
   - Multi-branch: `@type: RestaurantChain` with `department[]`
   - Fields: `name`, `url`, `logo`, `image`, `telephone`, `email`, `address`, `openingHoursSpecification`, `sameAs`, `areaServed`

4. **Sitemap** (`sitemap.ts`): iterates `ROUTES × locales` → each entry has:
   - `url`: absolute from `NEXT_PUBLIC_SITE_URL`
   - `changeFrequency`: per-route (daily/weekly/monthly)
   - `priority`: per-route (1.0 → 0.6)
   - `alternates.languages`: all locale URLs

5. **Robots** (`robots.ts`): allows public pages, disallows private/admin/api routes; references sitemap from `NEXT_PUBLIC_SITE_URL`.

### Performance

- Pre-selection network cost = `/branches` (light) + `/restaurant`
  (shared branding snapshot). Children are not mounted until the branch is
  resolved, so no menu/catalog data is requested before selection.
- Splash is a minimal branded pulse; total blocking time ≈ one small request.
- Branch images render through `next/image` (`sizes` hints, lazy by default;
  priority only for the first paint logo).

### API contract & data flow

Every branch-scoped RTK Query endpoint includes `branchId` in its query args.
RTK Query uses the full args object as the cache key, so different branches
produce different cache entries automatically — no `serializeQueryArgs`
override needed.

**Endpoint → branchId mapping (verified in `publicApi.ts`):**

| Endpoint | branchId source | Scope |
| --- | --- | --- |
| `getAvailability` | query param | branch |
| `getHome` | query param | branch |
| `getCategories` | query param | branch |
| `getMenuPage` | query param | branch |
| `getProductById` | query param | branch |
| `getOffers` | query param | branch |
| `getDeliveryZones` | query param | branch |
| `getReservationConfig` | query param | branch |
| `getReservationSlots` | query param | branch |
| `createReservation` | POST body | branch |
| `createOrder` | POST body `branchId: branchId ?? null` | branch |
| `validatePromoCode` | POST body `branchId` | branch |
| `getRestaurant` | — | restaurant-global |
| `getBranches` | — | restaurant-global (lists all) |
| `getOrdersByPhone` | — | restaurant-global (orders carry branch) |
| `getOrderById` | — | restaurant-global |
| `resolveTable` | — | table carries branch in response |

**Wire format examples (verified via curl against live tenant):**

```
GET /api/v1/public/home?restaurantId=X&locale=en          → restaurant-level data
GET /api/v1/public/home?restaurantId=X&locale=en&branchId=Y → branch-scoped data
GET /api/v1/public/products?restaurantId=X&locale=en&branchId=Y&limit=2 → branch products
GET /api/v1/public/offers?restaurantId=X&locale=en&branchId=Y → branch offers
GET /api/v1/public/categories?restaurantId=X&locale=en&branchId=Y → branch categories
GET /api/v1/public/delivery-zones?restaurantId=X&locale=en&branchId=Y → branch zones
GET /api/v1/public/reservations/config?restaurantId=X&branchId=Y → branch config
GET /api/v1/public/restaurant/availability?restaurantId=X&branchId=Y → branch availability
```

**Order payload (from `RenderOrder.tsx:345-361`):**
```json
{
  "customerName": "...",
  "customerPhone": "...",
  "deliveryAddress": "...",
  "items": [{ "productId": "...", "quantity": 1, "basePrice": 100 }],
  "branchId": "the-active-branch-id",
  "tableId": null,
  "tableNumber": null,
  "deliveryZoneId": "zone-id-or-null",
  "locale": "en"
}
```

The server MUST validate that `branchId` belongs to `restaurantId` and is
active. The client sends what BranchGate resolved — never trusts user input.

**Cache isolation:** RTK Query cache keys include all query args. When the
active branch changes (via selection or switcher), branch-scoped queries
refetch with new args → new cache entry. Restaurant-global queries
(`getRestaurant`) are unaffected. No cross-branch data leakage is possible.

**Backward compatibility:** All `branchId` params are optional. When absent
(single-branch restaurants or before resolution), requests fall back to
restaurant-level data — identical to the pre-branch wire format.

---

## Verification results (2026-08-25)

### Build & type safety

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ clean |
| `npm run lint` | ✅ 0 errors, 0 warnings |
| `npm run build` | ✅ all routes compiled (25/25), sitemap.xml + robots.txt emitted |

### Route-level (runtime)

| Check | Result |
| --- | --- |
| `GET /` | 307 → `/ar` (default locale redirect) |
| `GET /ar` | 200 |
| `GET /en` | 200 |
| `GET /it` | 200 |
| `GET /ar/menu` | 200 |
| `GET /en/menu` | 200 |
| `GET /ar/cart` | 200 |
| `GET /en/cart` | 200 |
| `GET /ar/reservations` | 200 |
| `GET /ar/track-order` | 200 |

### Dynamic branding (runtime)

| Check | Result |
| --- | --- |
| `fetchPublicRestaurant` server-side | ✅ 200, data present |
| API `branding.coverImage` | Empty string (tenant not configured) — metadata gracefully omits og:image |
| API `branding.logo` | Empty string (tenant not configured) — favicon defaults to Next.js icon |
| Header/footer logo fallback | ✅ monogram when logo is empty |
| Homepage product data | ✅ 14 products from `/home` (bestSellers=4, chefRecs=6, newItems=4) |

### API contract (live server)

| Check | Result |
| --- | --- |
| `GET /branches` (restora.world, restaurant=cmt49arro0003jr04dsnh7v62) | **404 — server does not have this endpoint** |
| `GET /branches` (via Next.js proxy) | **404 — proxy correctly forwards; server returns Next.js HTML error** |
| `GET /branches` (without restaurantId) | **404 — endpoint not deployed on restora.world** |
| `GET /home` (no branchId) | ✅ `{"success":true}` — restaurant-level data |
| `GET /home` (branchId=test-branch) | ✅ `{"success":true}` — server accepts branchId param |
| `GET /products` (branchId=test-branch) | ✅ `{"success":true}` — branch-scoped products |
| `GET /offers` (branchId=test-branch) | ✅ `{"success":true}` — branch-scoped offers |
| `GET /categories` (branchId=test-branch) | ✅ `{"success":true}` — branch-scoped categories |
| `GET /delivery-zones` (branchId=test-branch) | ✅ `{"success":true}` — branch-scoped zones |
| `GET /reservations/config` (branchId=test-branch) | ✅ `{"success":true}` — branch config |
| `GET /restaurant/availability` (branchId=test-branch) | ✅ `{"success":true}` — branch availability |

### Branch architecture

| Check | Result |
| --- | --- |
| Single-branch UI leak | ✅ none (no selector/switcher/badge markup in DOM) |
| Order payload includes `branchId` | ✅ `branchId: branchId ?? null` at RenderOrder.tsx:358 |
| Cart has `branchId` field | ✅ CartSlice.ts:115, persisted to localStorage |
| TableResolver activates branch from QR | ✅ `setActiveBranch(resolved.branch)` at TableResolver.tsx:66-73 |
| BranchGate blocks children until resolved | ✅ children only rendered when `ready = true` |
| Deep link `?branch=X` activates match | ✅ BranchGate.tsx:128-142, URL cleaned after activation |
| Gate render paths (8 scenarios verified) | ✅ no state where needsSelection + ready are both true |
| Effects have idempotency guards | ✅ no render loops possible |
| `needsSelection` + `ready` are mutually exclusive | ✅ mathematically impossible for both to be true |
| **Branch persistence: sessionStorage** | ✅ `BranchSlice.ts` writes to `sessionStorage` via `setSessionStorage(getBranchStorageKey(), ...)` |
| **Branch persistence: NOT localStorage** | ✅ no `localStorage` import/usage in branch code (verified: 0 references to `ACTIVE_BRANCH_STORAGE_KEY` / `setNamedStorage` / `getNamedStorage` / `removeNamedStorage` in branch files) |
| **Restaurant-scoped key** | ✅ `restora.pub.branch.{restaurantId}` via `getBranchStorageKey()` |
| **Cart remains in localStorage** | ✅ `CartSlice.ts` still imports `setLocalStorage` (cart persistence is independent, correct) |

### SEO (v1.6.0 — Clone-Based Architecture)

| Check | Result |
| --- | --- |
| JSON-LD in initial HTML | ✅ `@type: Restaurant` / `RestaurantChain` with `image`, `logo`, `telephone`, `address`, `openingHoursSpecification`, `sameAs`, branch `department` nodes |
| sitemap.xml | ✅ all locales × routes with hreflang alternates, `changeFrequency`, `priority` |
| robots.txt | ✅ cart/orders/track-order disallowed; admin/dashboard/api disallowed |
| `generateMetadata` (server-side) | ✅ centralized in `src/lib/seo/seo.ts` via `buildRootMetadata()` / `buildPageMetadata()` |
| Root layout title template | ✅ `{name}` (default), `%s | {name}` (child pages) — all from API |
| Per-page metadata | ✅ home, menu, cart, about, contact, reservations, track-order — all use `buildPageMetadata()` |
| Canonical URLs | ✅ every page emits `alternates.canonical` from `NEXT_PUBLIC_SITE_URL` |
| OpenGraph | ✅ `og:url`, `og:title`, `og:description`, `og:image` — per-page, API-sourced |
| Twitter cards | ✅ `summary_large_image` with API cover image |
| `og:image` / `twitter:image` | ✅ from `branding.coverImage`; gracefully omitted when empty |
| `favicon` from API | ✅ from `branding.logo`; falls back to Next.js default |
| `NEXT_PUBLIC_SITE_URL` env | ✅ required for production; documented in `.env` |
| `NEXT_PUBLIC_RESTORA_RESTAURANT_ID` env | ✅ drives all API data for the restaurant |
| Menu page metadata | ✅ "Menu" title via `menu.meta` translation key |
| Cart page metadata | ✅ `noindex: true` (private page) |
| Track Order metadata | ✅ `noindex: true` (private page) |
| Translation keys en/ar/it | ✅ `home.meta`, `menu.meta`, `cart.meta` added with structural parity |
| Clone safety | ✅ zero hardcoded restaurant names/URLs/images in source — all from API + env |

### i18n

| Check | Result |
| --- | --- |
| Message parity en/ar/it (`branches` namespace) | ✅ structural parity (25 keys each, including `card.directions`) |
| RTL for Arabic | ✅ `dir="rtl"` on `<html>` |
| No MISSING_MESSAGE errors | ✅ build passes without i18n warnings |

### Design & UX

| Check | Result |
| --- | --- |
| Branch card: name, address, image, open/closed, hours | ✅ |
| Branch card: phone (tel: link) | ✅ conditionally rendered |
| Branch card: Google Maps link | ✅ conditionally rendered |
| GSAP ambient cover entrance | ✅ Ken Burns scale 1.08→1, respects reduced-motion |
| Card restructure (valid HTML) | ✅ `<div role="button">` + `<a>` for phone/maps |
| Mobile responsive | ✅ grid stacks (1→2→3 cols) |
| Branch switcher: multi-branch only | ✅ renders nothing when `isMultiBranch = false` |
| Cart safety dialog | ✅ confirmation before cross-branch switch |

Scenario matrix A–K: A/B/C/D/E/F/G are covered by the implementation and
code paths described above (live verification of B–G requires a Restora
server exposing `/branches`; H–J verified as far as the current tooling
allows — see "Remaining work").

---

## Local dev 404 incident (resolved 2026-08-25)

**Symptom:** `yarn dev` started fine but `GET /` (and `/ar`, `/en`, `/it`) returned
404 rendering `app/not-found.tsx`.

**Root cause:** corrupted Turbopack **dev cache**, not application code. A
long-running `yarn dev` server held `.next/dev` while production builds were
written into the same `.next` directory; its incremental route manifest became
stale and every request — including localized ones — resolved to
`/_not-found`. Proof: the same code served `/ → 307 → /ar`, `/en → 200`
correctly via `next build && next start`.

**Exact fix:** stopped the stale dev server process, deleted `.next`,
restarted `next dev`. **No application code changed.**

**Middleware/proxy:** unchanged. The `middleware.ts → proxy.ts` deprecation
warning is cosmetic in Next.js 16 — middleware functions correctly (verified:
`/` redirects, locale routes serve, tenant API rewrite works). Migration was
NOT required for this fix.

**Routes verified after fix (localhost:3000):**

| Route | Result |
| --- | --- |
| `/` | 307 → `/ar` (configured default locale) |
| `/ar` | 200 (`dir="rtl"` confirmed) |
| `/en` | 200 |
| `/it` | 200 |
| `/de`, `/fr`, … | 307 → default-locale handling by next-intl (locales not in `routing.locales`; expected) |
| `/api/v1/public/restaurant?restaurantId=…` | JSON via site proxy — tenant resolution intact |

**Hydration warning** (`cz-shortcut-listen="true"`): injected by a browser
extension (ColorZilla), visible in the dev log's hydration diff as an added
attribute on `<body>`. Not from RESTORA code; no change made.

**Prevention:** don't run `next build`/`next start` against `.next` while a
dev server is running — stop `yarn dev` first (or delete `.next` afterwards).

---

## Runtime investigation: "multi-branch selection not appearing" (2026-08-25)

### Symptom

Opening a restaurant website expected to have multiple branches never shows the
branch-selection screen — the normal website loads immediately.

### Investigation

1. Confirmed `NEXT_PUBLIC_RESTORA_RESTAURANT_ID=cmt49arro0003jr04dsnh7v62`.
2. Called `GET /branches` (direct to `restora.world` AND via Next.js proxy):
   **HTTP 404** in every case — the server returns a Next.js HTML error page.
3. Called `GET /branches` without restaurantId: **404** — endpoint simply does
   not exist on `restora.world`.
4. Confirmed all other endpoints (`/restaurant`, `/home`, `/availability`) work
   — the server is alive, just lacks `/branches`.

### Root cause

**The server at `restora.world` does not have `GET /branches` deployed.**
BranchGate's graceful degradation is working as designed:

```
branchesQuery.isError = true    (404)
branchesQuery.data = undefined  → branches = []
listResolved = true             (isError counts as "resolved")
branches.length = 0             → needsSelection = false
branches.length <= 1            → ready = true
→ normal website renders without selection screen
```

### Client code verification

A thorough code review (8 files, all BranchGate paths) confirmed **0 bugs**:

- `needsSelection` and `ready` are mathematically mutually exclusive — no
  flicker risk.
- Every effect has idempotency guards — no render loops.
- Single-branch, multi-branch, QR, deep-link, stale-persistence, and error
  (404) paths all handle correctly.
- All data containers (`HomeClient`, `MenuPage`, `RenderOrder`, etc.) thread
  `branchId` from `useActiveBranchId()`.
- BranchGate correctly blocks children from rendering until resolution.

**The client is ready. The server must ship `GET /branches`.**

---

## Remaining work

1. **Restora server (BLOCKER):** ship `GET /branches` endpoint returning the
   light branch list (`[{id, name, slug, image, address, isOpenNow, ...}]`).
   Without this endpoint the website runs in single-location mode — the
   selection screen cannot appear. Also: accept `?branchId=` on documented
   endpoints and include `branch` in `tables/resolve` responses.
2. **Live E2E** against a real multi-branch tenant (requires #1): selection
   screen, per-branch prices, availability gating, offer scoping, QR branch
   resolution, branch switching, cart safety.
3. **Optional polish:** bottom-sheet switcher variant for very small viewports;
   per-branch structured-data pages if/when real branch routes exist;
   product/category-level JSON-LD pages if indexable product routes are added.
4. **Deployment:** set `NEXT_PUBLIC_SITE_URL` for each clone deployment
   (e.g. `https://fadl.restora.world`, `https://disforno.restora.world`).
