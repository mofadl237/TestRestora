# RESTORA Execution Plan

**Scope:** Restaurant Public Website — multi-branch support + refinement of
the existing website.

**Principle:** ADD intelligent multi-branch support on top of the existing
architecture. Never rebuild, never duplicate the API client, cart, checkout,
pricing or localization systems.

---

## 1. Where we started

The template already provided (and still owns):

- Tenant resolution via `NEXT_PUBLIC_RESTORA_RESTAURANT_ID`
  (`x-restaurant-id` header + `?restaurantId=`) — `src/store/api/publicApi.ts`.
- Single RTK Query client (`restoraPublicApi`) with envelope unwrapping.
- Redux cart with localStorage persistence and server-side pricing.
- Checkout engine (`src/Components/Cart/RenderOrder.tsx`), QR table flow
  (`TableResolver` + `TableProvider`), reservations, delivery zones.
- next-intl (ar/en/it, `localePrefix: always`, RTL for Arabic).
- GSAP ScrollTrigger rails + Framer Motion micro-interactions.
- Branding from `GET /restaurant` (`--primary` CSS var injection in
  `MarketingChrome`).

## 2. Multi-branch execution (completed)

| Phase | What was delivered |
| --- | --- |
| Understand | Full audit of tenant/API/cart/QR/i18n/animation systems before coding. |
| Single branch | Silent auto-resolution in `BranchGate`; zero branch UI. |
| Multi-branch first experience | Premium `BranchSelection` screen (logo reveal, headline, staggered cards, open/closed pills, branded imagery). |
| Selection design | Restaurant logo, API primary color via existing `--primary` vars, branch images w/ monogram fallback (no stock photos). Branch cards show name, address, open/closed pill, hours, phone (tel: link), Google Maps link. |
| Animation | Framer Motion staggered cards + hover lift + image zoom + directional CTA icon; GSAP ambient cover reveal (Ken Burns scale); `useReducedMotion` honored; fast (< 0.6 s to interactive). |
| Branch context | Active branch persisted (`BranchSlice`); catalog/offers/zones/reservations/orders scoped with `branchId`. |
| Switcher | Compact header pill (`BranchSwitcher`) rendered only when multi-branch. |
| Safe switching | Cart tagged with owning `branchId`; confirmation dialog when switching with items; confirmed switch clears the cart. |
| Menu | Branch-scoped products/prices/availability through existing endpoints. |
| Offers | Branch-scoped `getOffers`; no cross-branch leakage. |
| Ordering | "Ordering from 📍" badge; `branchId` in order payload; pricing stays server-side. |
| QR | Gate bypassed on `?tableId=`; resolved table's branch activates silently. |
| Table context | Existing dine-in banner retained; branch shown subtly where available. |
| Reservations | Slots/config/creation scoped to active branch; location badge on form. |
| Delivery | Zones per branch; stale zone selections auto-cleared. |
| SEO | JSON-LD (Restaurant / RestaurantChain+departments), metadataBase, hreflang alternates, Open Graph, sitemap.xml, robots.txt. |
| Deep linking | Shareable `?branch=<slug>` URLs activate the correct branch then clean themselves. |
| Mobile | Full-width touch-first cards; compact truncated switcher pill. |
| Localization | `branches.*` namespace added to en/ar/it with structural parity (including `card.directions`); RTL preserved. |
| Performance | Light `/branches` payload only pre-selection; children unmounted until resolved; `next/image` everywhere. |
| Design | Existing RESTORA identity kept; orange as accent, token-based surfaces, no AI-generic decoration. |

## 3. Files changed

**New**
- `src/store/features/BranchSlice.ts`
- `src/Components/Branch/BranchGate.tsx` (+ `useBranchContext`)
- `src/Components/Branch/BranchSelection.tsx`
- `src/Components/Branch/BranchSplash.tsx`
- `src/Components/Branch/BranchSwitcher.tsx`
- `src/Components/Branch/BranchSwitchDialog.tsx`
- `src/Components/Branch/ActiveBranchBadge.tsx`
- `src/Components/Branch/index.ts`
- `src/Components/Seo/RestaurantJsonLd.tsx`
- `src/lib/seo/structuredData.ts`
- `app/sitemap.ts`, `app/robots.ts`
- `STATUS.md`, this file

**Modified**
- `src/Components/Branch/BranchSelection.tsx` — card restructure (`<button>` →
  `<div role="button">` + `<a>` for phone/maps); GSAP ambient cover entrance;
  phone + Google Maps link display.
- `src/store/api/types.ts` — `IApiBranch`, `IApiBranchRef`, `branchId` inputs,
  `IResolvedTable.branch`.
- `src/store/api/publicApi.ts` — `getBranches`, `tenantParams`/`branchParams`
  helpers, `Branches` tag, optional `branchId` across endpoints.
- `src/store/store.ts` — registered `branch` reducer.
- `lib/localStorageHandle.ts` — named-key helpers +
  `ACTIVE_BRANCH_STORAGE_KEY`.
- `src/store/features/CartSlice.ts` — cart `branchId` binding, object-style
  `persist(state)` refactor, `setCartBranch`.
- `app/[locale]/MarketingChrome.tsx` — wraps chrome in `BranchGate`.
- `app/[locale]/layout.tsx` — SEO metadata + JSON-LD mount.
- `src/Components/header/Header.tsx` — switcher placement (desktop + mobile).
- `src/Components/Table/TableResolver.tsx` — silent branch activation from QR.
- Branch-aware containers: `HomeClient`, `MenuPage`, `OffersHorizontalRail`,
  `PromoBanner`, `PublicOffers`, `BestProduct`, `AddToCartButton`,
  `RenderOrder`, `RestaurantClosedBanner`, `PromoCodeInput`,
  `PublicReservations`.
- `messages/en.json`, `messages/ar.json`, `messages/it.json` — `branches.*`
  (including `card.directions`).
- `docs/API_ENDPOINTS.md` — `/branches`, `branchId`, table `branch`.

## 4. Behavior contracts

- **Single branch:** normal website; no selector, no switcher; nothing in the
  DOM reveals branches. Internally, the only branch is auto-resolved silently
  and all requests carry `branchId` — the customer never notices.
- **Multi-branch:** gate → selection → website; switcher appears; deep links
  work; returning customers skip selection.
- **QR:** never shows selection; restaurant→branch→table resolve silently.
  Order is stamped with the table's branch.
- **Cart safety:** orders can never silently across locations.
- **Pricing:** client displays estimates; Restora recomputes authoritatively.

## 5. API contract & data flow

Every branch-scoped RTK Query endpoint includes `branchId` in its query args.
RTK Query uses the full args object as the cache key, so different branches
produce different cache entries automatically.

**Endpoints that accept `branchId`:**
`getAvailability`, `getHome`, `getCategories`, `getMenuPage`, `getProductById`,
`getOffers`, `getDeliveryZones`, `getReservationConfig`, `getReservationSlots`,
`createReservation` (body), `createOrder` (body), `validatePromoCode` (body).

**Endpoints that are restaurant-global:**
`getRestaurant`, `getBranches`, `getOrdersByPhone`, `getOrderById`,
`resolveTable` (table carries branch in response).

**Order payload includes `branchId: branchId ?? null`.** The server MUST
validate that `branchId` belongs to `restaurantId` and is active. The client
sends what BranchGate resolved — never trusts user input.

**Backward compatibility:** All `branchId` params are optional. Single-branch
restaurants work identically to pre-branch wire format when `branchId` is
absent.

## 6. Verification

See `STATUS.md` → "Verification results". Typecheck, lint, production build,
runtime smoke tests against a live tenant (including legacy-server 404
degradation), and API-level contract verification all pass. Every branch-scoped
endpoint was tested with and without `branchId` — the server accepts both.
Scenario matrix A–K is implemented; live multi-branch E2E awaits server-side
`/branches` endpoint.

## 6. Remaining work

1. Restora server: expose `GET /branches`, accept `?branchId=`, return
   `branch` on `tables/resolve` (backward-compatible additions).
2. Live E2E vs a real multi-branch tenant (prices, availability, offers, QR).
3. Optional: bottom-sheet switcher variant; per-branch SEO landing routes if
   product later wants real branch pages.
4. Set `NEXT_PUBLIC_SITE_URL` at deploy time for canonical URLs.
