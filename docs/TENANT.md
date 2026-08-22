# Tenant Configuration — Restora Website Template v1.0.0

The template is **multi-tenant ready**: one copy of this code can serve any
number of restaurants. The tenant is chosen by **configuration, never by code**.

```
Restaurant Website
    ↓
restaurantId configuration (NEXT_PUBLIC_RESTORA_RESTAURANT_ID)
    ↓
RTK Query (src/store/api/publicApi.ts)
    ↓
Restora Public API  →  tenant-scoped data
```

---

## How it works

1. **Configure** `NEXT_PUBLIC_RESTORA_RESTAURANT_ID` in `.env.local`
   (see `.env.example`).
2. **RTK Query injects it automatically** in `src/store/api/publicApi.ts`:
   - `prepareHeaders` → sets `x-restaurant-id` header on every request.
   - each endpoint → also appends `?restaurantId=` as a query parameter.
3. **Restora resolves the tenant** in this order:
   1. `?restaurantId=` query param (preferred for GET — cache-friendly),
   2. `x-restaurant-id` header (preferred for POST — survives intermediaries),
   3. the default restaurant (single-tenant fallback).
4. Every underlying Restora server function enforces the tenant in its data
   queries, so the API layer only resolves and delegates.

This is the **actual mechanism implemented by the Public API** — the template
does not invent a second tenant system and never hardcodes a restaurant id.

---

## Per-restaurant usage

| Website | Configuration |
| --- | --- |
| Website A | `NEXT_PUBLIC_RESTORA_RESTAURANT_ID=A` |
| Website B | `NEXT_PUBLIC_RESTORA_RESTAURANT_ID=B` |
| Website C | `NEXT_PUBLIC_RESTORA_RESTAURANT_ID=C` |

Same template, same API, different tenant. The Dashboard supplies the
restaurant data; the Website just renders it.

---

## Rules

- NEVER hardcode a restaurant id inside a React component.
- NEVER add a runtime restaurant-picker (the Website is bound to exactly one
  restaurant per deployment).
- If the variable is unset, requests carry no tenant → Restora falls back to
  the default restaurant. Set it explicitly in production.

---

## Relevant code

- `src/store/api/publicApi.ts` — `RESTAURANT_ID` const, `prepareHeaders`,
  per-endpoint `params`.
- `.env.example` — documented env var.
