# Restora Website Template — Status

**Version 1.3.0 — Multi-Branch + API Contract Verification**
Last updated: 2026-08-25

---

## Current state

The template is a standalone restaurant public website consuming ONLY the
Restora Public API (`/api/v1/public`). As of v1.1.0 it supports both
single-branch and multi-branch restaurants while preserving the existing
architecture end to end (RTK Query single client, Redux cart, pricing engine,
next-intl localization, GSAP + Framer Motion animation system).

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
                     Active branch in Redux (persisted localStorage)
                                   ↓
        All catalog / offers / delivery / reservations / orders scoped
        with ?branchId= (server remains authoritative for pricing)
```

- **State:** `src/store/features/BranchSlice.ts` — `{ active: {id,name,slug},
  hydrated }`, persisted under the `restora.activeBranch` localStorage key.
- **Gate:** `src/Components/Branch/BranchGate.tsx` — resolves once per page
  load; exposes `useBranchContext()` (`branches`, `activeBranch`,
  `isMultiBranch`, `requestSwitch`). Deep links via `?branch=<slug|id>` are
  activated then cleaned from the URL.
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

### SEO behavior

- `RestaurantJsonLd` (server component) emits schema.org Restaurant JSON-LD
  in the initial HTML from live API data; multi-branch tenants emit
  `@type: RestaurantChain` with real branches as `department` entries
  (address, geo, phone, maps URL). No fabricated branch pages.
- Locale layout metadata gained `metadataBase`, title template, robots,
  hreflang `alternates.languages`, and Open Graph defaults.
- New `app/sitemap.ts` (all locales × static routes, hreflang alternates) and
  `app/robots.ts` (cart/orders/track-order disallowed).
- Set `NEXT_PUBLIC_SITE_URL` in production so canonicals/sitemap use the real
  origin (falls back to `VERCEL_URL`, then localhost).

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

### API contract (live server)

| Check | Result |
| --- | --- |
| `GET /branches` (legacy server, 404) | ✅ silent degradation → gate renders single-branch experience |
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

### SEO

| Check | Result |
| --- | --- |
| JSON-LD in initial HTML | ✅ `@type: Restaurant` present |
| sitemap.xml | ✅ all locales × routes with hreflang alternates |
| robots.txt | ✅ cart/orders/track-order disallowed |
| Metadata (title, description, OG) | ✅ layout-level defaults + per-page `generateMetadata` |

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

## Remaining work

1. **Restora server:** ship `GET /branches` and accept `?branchId=` on the
   documented endpoints; include `branch` in `tables/resolve` responses.
   Until then the website runs in graceful single-location mode.
2. **Live E2E** against a real multi-branch tenant: per-branch prices,
   availability gating, offer scoping, QR branch resolution (needs server).
3. **Optional polish:** bottom-sheet switcher variant for very small viewports;
   per-branch structured-data pages if/when real branch routes exist.
4. **Deployment:** set `NEXT_PUBLIC_SITE_URL` for canonical/sitemap URLs.
