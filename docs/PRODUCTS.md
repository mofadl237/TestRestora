# Products / Categories / Variants / Options — Restora Website Template v1.0.0

The catalog comes entirely from the Restora Public API. The template does not
simplify or duplicate the product model.

---

## Data sources

| Data | RTK hook | HTTP |
| --- | --- | --- |
| Categories | `useGetCategoriesQuery` | `GET /categories` |
| Products (paginated) | `useGetMenuPageQuery` | `GET /products?categoryId&page&limit` |
| Single product (variants + options) | `useGetProductByIdQuery` / `useLazyGetProductByIdQuery` | `GET /products/[id]` |
| Home rails | `useGetHomeQuery` | `GET /home` |

---

## Domain types (`src/Interfaces/index.ts`)

- `ICategory` — id, name (locale-resolved), displayOrder.
- `IProduct` — id, name, description, image, order, basePrice, isAvailable,
  isFeatured, categoryId.
- `IProductVariant` — id, name, price, displayOrder (e.g. sizes).
- `IOptionGroup` — id, name, required, multipleSelection, minimumSelection,
  maximumSelection, displayOrder.
- `IOption` — id, name, price, isAvailable, displayOrder (add-ons).
- `IProductWithOptions` = `IProduct + variants + optionGroups`.
- `IHomeProduct` — product + category + homeSections (best sellers).
- `IHomeSection` — dashboard-managed homepage rail.

The template also carries translation-row types
(`ICategoryTranslation`, …) purely as documentation of the API's source shape —
components always receive the flattened, locale-resolved DTOs.

---

## Menu page

- `src/Components/Menu/MenuPage.tsx` (client container):
  - `useGetHomeQuery` → menu sections (grouped rails),
  - `useGetCategoriesQuery` → category tabs,
  - `useGetMenuPageQuery({ locale, page, limit })` → paginated grid.
- `MenuPageClient.tsx` — tabs, search (`MenuSearch`), grid
  (`MenuProductsGrid` + `MenuProductCard`), infinite pagination via `meta`,
  empty state (`MenuEmpty`).

## Product card & details

- `src/Components/Product/CardProduct.tsx` — menu/list card, opens the add dialog.
- `src/Components/BestSeller/BestProduct.tsx` — home rail card.
- `AddToCartDialog` (`src/Components/Product/AddToCartDialog/`):
  - `VariantSelector` — pick a variant (price updates via Pricing Engine),
  - `OptionGroup` — add-ons with required/min/max enforcement,
  - `QuantitySelector`,
  - `Footer` — add-to-cart with computed total.
  - Works in `add` and `edit` modes (edit re-fetches via
    `useLazyGetProductByIdQuery`).

---

## Pricing

Unit price = `basePrice + variantPrice + selected options` — always via the
Pricing Engine (`calcUnitPrice`, `calcTotalPriceOneProduct`), never inline in
JSX. The authoritative price is recomputed server-side at order creation.

---

## Rules

- NEVER invent a simplified product model.
- NEVER hardcode products/categories/offers.
- Product availability, options and prices are managed in the Dashboard; the
  template only renders what the API returns.
