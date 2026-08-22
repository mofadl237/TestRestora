# Localization — Restora Website Template v1.0.0

Localization is first-class: every user-facing string comes from the
localization system, and the template ships **English (LTR)** and
**Arabic (RTL)** in sync.

---

## Architecture (next-intl)

| File | Role |
| --- | --- |
| `src/i18n/routing.ts` | `defineRouting({ locales: ['ar','en'], defaultLocale, localePrefix: 'always' })` + `createNavigation`. Default locale is configurable via `NEXT_PUBLIC_DEFAULT_LOCALE`. |
| `middleware.ts` | next-intl middleware on the `routing` matcher (excludes `api`, `trpc`, `_next`, files). |
| `src/i18n/request.ts` | `getRequestConfig` → validates the locale, falls back to default, loads `messages/{locale}.json`. |
| `src/i18n/config.ts` | static runtime config (`locales`, `defaultLocale`) — the template cannot query the DB, so this is derived from `routing`. |
| `app/[locale]/layout.tsx` | `<html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>`, `NextIntlClientProvider`, `getMessages`. |
| `messages/en.json` + `messages/ar.json` | UI copy. **Keep both structurally identical.** |

---

## Content that comes from the API

Translated product/category/zone/offer names and descriptions are returned by
the Public API via `?locale=` on every request — the template never hardcodes
catalog translations.

## Content that lives in the template

- Page chrome: header, footer, hero copy, cart, checkout, orders, reservations,
  contact, about — in `messages/*.json`.
- Metadata: each page's `generateMetadata` uses `getTranslations` (e.g.
  `about.meta`, `contact.meta`, `reservations.meta`, `trackOrder.meta`).

---

## RTL / LTR rules

- The `<html dir>` attribute flips layout automatically (Tailwind logical
  properties are used throughout).
- Directional icons flip via `src/lib/i18n/DirectionalIcons.tsx`
  (`IconBack`, `IconForward`, …) — never hardcode a mirrored icon for RTL.
- `src/lib/i18n/useLocaleDirection.ts` provides the current direction for
  animations; `AnimationHelpers.ts` and `src/lib/i18n/locales.ts` support the
  directional variants.
- Verify spacing, alignment, padding, margins, icons, dropdowns, dialogs,
  inputs and navigation in **both** languages after any UI change.

---

## Adding a string

1. Add the key to `messages/en.json` **and** `messages/ar.json` (same path).
2. Use it via `useTranslations('namespace')` (client) or `getTranslations`
   (server).
3. Never hardcode user-facing text in components.

---

## RTL-aware slider

The hero slider (`src/Components/Slider/`) composes media from
`src/data/index.ts` with translated copy from `hero.slides` and adapts its
pagination direction via `getPizzaVariants(isRTL)` / directional helpers.

---

## Rules

- NEVER write `<Button>Save</Button>` — always `{t('Common.save')}`.
- Never leave one language incomplete; every PR touching copy must update both
  files and keep structural parity.
- Placeholders, toasts, validation messages, empty/loading states and
  accessibility labels must all be localized.
