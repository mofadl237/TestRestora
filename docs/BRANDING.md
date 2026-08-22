# Branding — Restora Website Template v1.0.0

The template does **not** belong to any single restaurant. Brand identity comes
dynamically from the Restora Public API.

```
Restora Dashboard (branding settings)
    ↓
GET /api/v1/public/restaurant   (also bundled in GET /home)
    ↓
usePublicSettings()  →  branding.primaryColor
    ↓
MarketingChrome  →  CSS variables (--primary, --ring)
    ↓
Header / Footer / buttons re-theme automatically
```

---

## What is driven by the API

- **Restaurant name** — shown in the Header (`Header.tsx`) and Footer
  (`FooterBrand`, `FooterBottom`) from `publicSettings.restaurantName`
  (fallback: generic `common.brandName`).
- **Primary color** — `branding.primaryColor`.
- Contact info, social links, business hours — rendered on the Contact page /
  Footer via `usePublicSettings`.
- All products, categories, offers, sections — API data (see
  `docs/PRODUCTS.md`, `docs/API_ENDPOINTS.md`).

## What is NOT hardcoded

❌ restaurant name, ❌ logo, ❌ colors, ❌ cuisine, ❌ contact info,
❌ social links, ❌ products, ❌ categories, ❌ offers.

The default UI copy in `messages/*.json` is generic (the demo About/Contact
copy was neutralized — customize it per restaurant).

---

## Implementation

- `src/Components/Footer/data.ts` exports `usePublicSettings(enabled)` →
  `useGetRestaurantQuery` (shared RTK cache — every consumer reuses one
  request).
- `app/[locale]/MarketingChrome.tsx`:

  ```tsx
  const primaryColor = publicSettings?.branding.primaryColor;
  const brandStyle = primaryColor
    ? ({ "--primary": primaryColor, "--ring": primaryColor } as React.CSSProperties)
    : undefined;
  // <div style={brandStyle}>…Header + page + Footer…</div>
  ```

  Setting the CSS vars re-themes the whole page (Tailwind `primary`/`ring`
  tokens).

- `MarketingChrome` also guards `dashboard`/`admin` route segments (renders
  children bare, without the marketing chrome).

---

## Re-theming

Change the primary color (or logo/cover) in the Restora Dashboard → the Website
updates on next load. No code change.

To go further (per restaurant): edit `app/globals.css` design tokens, fonts in
`app/[locale]/layout.tsx`, and copy in `messages/*.json` — all isolated from
the data layer (`docs/CUSTOMIZATION.md`).
