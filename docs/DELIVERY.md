# Delivery — Restora Website Template v1.0.0

Delivery zones and fees are **always** loaded from the Public API — they are
never hardcoded.

```
Cart checkout (RenderOrder.tsx)
    ↓
useGetDeliveryZonesQuery  →  GET /api/v1/public/delivery-zones
    ↓
DeliveryZoneSelector (choose a zone)  →  stored in Cart slice
    ↓
createOrder  { deliveryZoneId }   →  Restora validates zone + computes fee
```

---

## Data

`GET /api/v1/public/delivery-zones` returns active zones:

```json
[{ "id": "…", "name": "North Riyadh", "deliveryPrice": 15,
   "estimatedTimeMin": 30, "estimatedTimeMax": 45, "minimumOrder": 50 }]
```

RTK endpoint: `useGetDeliveryZonesQuery` (`src/store/api/publicApi.ts`),
tag `DeliveryZones`.

---

## Flow in checkout

1. `RenderOrder.tsx` loads zones and shows a skeleton while loading.
2. `DeliveryZoneSelector` (see `src/Components/Cart/DeliveryZones/`) lets the
   guest pick a zone — search, combobox, sheet, trigger.
3. The chosen zone is stored in the Cart slice via `setDeliveryZone`
   (`ICartDeliveryZone` snapshot: id, name, deliveryPrice, minimumOrder, ETA).
4. If the persisted zone is no longer offered, it is cleared automatically.
5. `DeliverySummaryCard` shows the selected zone fee + free-delivery state.
6. At submit, only `deliveryZoneId` is sent to `POST /orders`. Restora:
   - validates the zone is active and matchable,
   - requires a zone when zones are configured,
   - computes the delivery fee and minimum-order check server-side.

---

## Pricing

- Client-side fee preview uses the Pricing Engine
  (`calculateOrderSummary` with the zone's `deliveryPrice`); free-delivery
  thresholds are not part of the public contract, so the raw zone fee is shown.
- The **authoritative** fee is always the one Restora returns in the created
  order and in `GET /orders/[id]`.

---

## Components

```
src/Components/Cart/DeliveryZones/
  DeliveryZoneSelector.tsx    main selector
  DeliveryZoneSearch.tsx      filter input
  DeliveryZoneCombobox.tsx    accessible listbox
  DeliveryZoneSheet.tsx       mobile sheet
  DeliveryZoneTrigger.tsx     trigger button
  DeliveryZoneCard? (summary) DeliverySummaryCard.tsx
  types.ts                    IDeliveryZoneCardData
```

---

## Rules

- NEVER hardcode zones or fees in the template.
- NEVER invent a second delivery system — the API + Pricing Engine are the only
  source of truth.
