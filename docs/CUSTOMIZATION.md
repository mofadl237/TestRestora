# Customization — Restora Website Template v1.0.0

The template is built so you can **completely redesign the Website without
rewriting the data architecture.**

```
Data / API / RTK / Business flows        UI / Design / Layout / Animations
─────────────────────────────────        ───────────────────────────────────
Public API client (src/store/api)        src/Components/**
Tenant configuration (env vars)          app/globals.css (colors, fonts)
Cart (src/store/features/CartSlice)      components/ui/** (shadcn primitives)
Checkout (RenderOrder + createOrder)     Slider + hero design
Orders / Tracking / Documents            Footer, Header design
Reservations (config/slots/create)       messages/*.json (copy)
Delivery (zones from API)                animations, icons, typography
Pricing Engine (src/lib/pricing)
Domain types (src/Interfaces, lib/restaurant)
Validation (src/Validations)
```

---

## What belongs to DESIGN (safe to change freely)

- **UI components** — everything under `src/Components/**`.
- **Colors / fonts / tokens** — `app/globals.css` (Tailwind v4 theme) and the
  font imports in `app/[locale]/layout.tsx`.
- **shadcn primitives** — `components/ui/**`.
- **Copy** — `messages/*.json` (edit both `en` and `ar`).
- **Hero/slider design** — `src/Components/Slider/*` and slider media in
  `public/images/` + `src/data/index.ts`.
- **Animations** — `src/Components/**/animations.ts`, variants files.

## What belongs to DATA (keep intact)

- `src/store/api/publicApi.ts` + `types.ts` — API contract.
- `src/store/features/CartSlice.ts` — cart state + persistence.
- `src/lib/pricing/*` — money math (must match Restora server pricing).
- `src/lib/restaurant.ts` — availability logic.
- `src/Validations/*` — schemas.
- Env variables — tenant resolution.

---

## Redesigning a page — the safe way

1. Find the page in `app/[locale]/(website)/` and its container component.
2. Keep the container's data hooks (`useGet…Query` / `use…Mutation`) as-is.
3. Replace or restyle the **presentation** sub-components underneath.
4. Keep business logic in `lib/` / hooks — never move it into JSX.

Example: to redesign the Home page, change `src/Components/Slider/*`,
`BestSeller/*`, `Offers/*` and the section layout in `app/[locale]/page.tsx` —
but keep `useGetHomeQuery` / `useGetOffersQuery` feeding them.

---

## Branding per restaurant

- Primary color + name come from the Dashboard via the API
  (`docs/BRANDING.md`).
- Per-restaurant fonts/design: edit `app/globals.css` and
  `app/[locale]/layout.tsx`.
- Never hardcode a restaurant's name/logo/colors/cuisine/contact in components.

---

## Copy per restaurant

All marketing copy (hero, about, contact, footer) lives in
`messages/en.json` / `messages/ar.json`. The template ships **neutralized**
demo copy (no restaurant identity). Replace it per restaurant — keep both files
in sync.

---

## Unused leftovers (safe to delete)

- `src/lib/whatsapp/whatsappProvider.ts` — unimported module (requires
  `META_WHATSAPP_*` env vars only if you wire it up).
- `messages` namespaces `Auth`, `admin`, `dashboard` — inert copy inherited
  from the Restora source Website; not referenced by any template page.
- `public/images/*.mp4` — stray asset, not referenced by any component.

---

## Deployment notes

- The template is a standard Next.js app — deploy on Vercel or any Node host.
- Set `NEXT_PUBLIC_RESTORA_API_URL` and `NEXT_PUBLIC_RESTORA_RESTAURANT_ID`
  in the hosting platform. No database, no secrets.
