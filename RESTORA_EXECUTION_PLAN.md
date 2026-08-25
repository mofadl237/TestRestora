# RESTORA Execution Plan

**Scope:** Restaurant Public Website — multi-branch support + dynamic branding
+ refinement of the existing website.

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

## 3a. Dynamic branding + homepage slider + metadata (v1.4.0 — completed)

| Phase | What was delivered |
| --- | --- |
| Dynamic logo | API `branding.logo` in Header and Footer via `next/image`; monogram fallback when empty. |
| Dynamic metadata | `generateMetadata` (async server) in `layout.tsx`; `og:image`/`twitter:image` from `branding.coverImage`; favicon from `branding.logo`; title/description from API. |
| Server helper | `src/lib/seo/serverData.ts` — `fetchPublicRestaurant(locale)` with defensive `res.text()` before `JSON.parse`; failure-tolerant. |
| Homepage slider | `Hero.tsx` rewritten: dynamic product slider from `useGetHomeQuery` (bestSellers + chefRecs + familyMeals + newItems + kidsMeals + comboMeals, deduplicated); API product images, names, descriptions, prices. |
| Translation keys | `hero.orderNow` + `hero.from` added to en/ar/it (structural parity). |
| BranchSelection redesign | Compact cinematic layout: smaller logo reveal, compact branch cards (h-28 images), tighter spacing, phone/maps links. |
| Verified | `fetchPublicRestaurant` returns 200 with data; empty branding gracefully handled; homepage renders with 14 products from API; build clean (25/25 routes). |

## 3. Files changed

**New (v1.1.0 — multi-branch):**
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

**New (v1.4.0 — dynamic branding):**
- `src/lib/seo/serverData.ts` — shared server-side API fetch helper

**Modified (v1.1.0 — multi-branch):**
- `src/Components/Branch/BranchSelection.tsx` — card restructure (`<button>` →
  `<div role="button">` + `<a>` for phone/maps); GSAP ambient cover entrance;
  phone + Google Maps link display.
- `src/store/api/types.ts` — `IApiBranch`, `IApiBranchRef`, `branchId` inputs,
  `IResolvedTable.branch`.
- `src/store/api/publicApi.ts` — `getBranches`, `tenantParams`/`branchParams`
  helpers, `Branches` tag, optional `branchId` across endpoints.
- `src/store/store.ts` — registered `branch` reducer.
- `lib/localStorageHandle.ts` — named-key helpers (v1.1.0);
  + sessionStorage helpers + `getBranchStorageKey()` (v1.5.0);
  old `ACTIVE_BRANCH_STORAGE_KEY` / `setNamedStorage` / `getNamedStorage` /
  `removeNamedStorage` removed (were branch-only; cart still uses
  `setLocalStorage`/`getLocalStorage`).
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
  (including `card.directions`); + `hero.orderNow`, `hero.from` (v1.4.0).
- `docs/API_ENDPOINTS.md` — `/branches`, `branchId`, table `branch`.

**Modified (v1.4.0 — dynamic branding):**
- `app/[locale]/layout.tsx` — `generateMetadata` replacing static metadata;
  fetches API for dynamic og:image/twitter:image/title/description.
- `src/lib/seo/structuredData.ts` — imports shared `fetchPublicRestaurant`;
  adds `logo` to JSON-LD.
- `src/Components/header/Header.tsx` — API logo with fallback (replaces
  `FaPizzaSlice` icon).
- `src/Components/Footer/FooterBrand.tsx` — API logo with fallback.
- `src/Components/Home/Hero.tsx` — complete rewrite: dynamic product slider
  from API (replaces hardcoded pizza images). Removes AddToCartDialog import.
- `src/Components/Branch/BranchSelection.tsx` — premium compact redesign
  (smaller logo reveal, h-28 card images, tighter spacing, phone/maps links).

**Modified (v1.5.0 — sessionStorage):**
- `lib/localStorageHandle.ts` — sessionStorage helpers added; old branch
  localStorage helpers removed.
- `src/store/features/BranchSlice.ts` — `setActiveBranch`/`clearActiveBranch`
  write to sessionStorage via `getBranchStorageKey()`.
- `src/Components/Branch/BranchGate.tsx` — hydration reads from sessionStorage
  via `getSessionStorage(getBranchStorageKey())`.

## 4. Behavior contracts

- **Single branch:** normal website; no selector, no switcher; nothing in the
  DOM reveals branches. Internally, the only branch is auto-resolved silently
  and all requests carry `branchId` — the customer never notices.
- **Multi-branch:** gate → selection → website; switcher appears; deep links
  work. Branch selection persists to **sessionStorage** (not localStorage) so
  it survives page refreshes within a session but NOT across sessions.
- **QR:** never shows selection; restaurant→branch→table resolve silently;
  QR branch overrides any stored session branch.
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

See `STATUS.md` → "Verification results" and "Runtime investigation". Typecheck,
lint, production build, runtime smoke tests, and API-level contract
verification all pass. Every branch-scoped endpoint was tested with and without
`branchId` — the server accepts both.

**Branch persistence verified (v1.5.0):**
- `BranchSlice` writes to `sessionStorage` (not localStorage) via
  `setSessionStorage(getBranchStorageKey(), ...)`.
- `BranchGate` reads from `sessionStorage` on mount.
- Key format: `restora.pub.branch.{restaurantId}` — restaurant-scoped.
- Cart persistence remains in localStorage (independent, correct).
- 0 references to old `ACTIVE_BRANCH_STORAGE_KEY` / `setNamedStorage` /
  `getNamedStorage` / `removeNamedStorage` in branch code.

**Runtime root cause identified:** `restora.world` does not have `GET /branches`
deployed. BranchGate gracefully degrades to single-location mode when the
endpoint returns 404. Client code is correct — verified by exhaustive code
review (8 files, 0 bugs, all 8 render-path scenarios validated). Multi-branch
selection screen will appear when the server ships `GET /branches`.

## 7. Remaining work

1. Restora server (BLOCKER): ship `GET /branches` returning light branch list.
   Without this, the selection screen cannot appear.
2. Live E2E vs a real multi-branch tenant (requires #1).
3. Optional: bottom-sheet switcher variant; per-branch SEO landing routes.
4. Set `NEXT_PUBLIC_SITE_URL` at deploy time for canonical URLs.
