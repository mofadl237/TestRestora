# Reservations — Restora Website Template v1.0.0

The reservation experience is fully API-driven — no reservation business logic
exists in this template.

```
Reservations page
    ↓
useGetReservationConfigQuery   GET /reservations/config
useGetReservationSlotsQuery    GET /reservations/slots?date=
useCreateReservationMutation   POST /reservations
    ↓
Success state (confirmation request received)
```

---

## Data

| Endpoint | Purpose |
| --- | --- |
| `GET /reservations/config` | `{ enabled, capacity, maxGuests, intervalMinutes, windowDays }` — drives the UI shape. |
| `GET /reservations/slots?date=YYYY-MM-DD` | Slot grid for a day: `{ dateKey, hasSlots, slots: [{ date, label, capacity, used, available, open, reason }] }`. |
| `POST /reservations` | Create — body `{ customerName, customerPhone, customerEmail?, partySize, date, durationMinutes?, notes? }`. Returns `201 { id }`. |

---

## Flow (`src/Components/Reservations/PublicReservations.tsx`)

1. Load config → renders the booking form (guests, date, time slots).
2. On date change → fetch slots; open slots selectable, closed slots rendered
   disabled with a localized reason.
3. Validate inputs (zod + field checks), then `createReservation().unwrap()`.
4. Handle API errors:
   - `400` / `422` — localized message (closed, outside booking window, …).
   - `409` capacity full — show shortfall via `apiErrorShortfall`.
   - Machine codes are decoded with `apiErrorKey` → mapped to
     `reservations.slotReason` / `reservations.valid` keys.
5. Success → confirmation card ("Request received … will be confirmed").

---

## Slot reasons

`outsideHours | closedHoliday | closedTemporary | past | outsideWindow | disabled | full`
→ localized labels in `messages/reservations.slotReason`.

---

## Components

```
PublicReservations.tsx   container: config + slots + submit + success state
```

The page (`app/[locale]/(website)/reservations/page.tsx`) renders the component
with localized metadata (`reservations.meta`).

---

## Rules

- NEVER recreate reservation business logic (capacity, window, availability) in
  the frontend — Restora is authoritative.
- Reservations start as **PENDING**; the Dashboard approves them.
- Keep the form/success design isolated from the data flow
  (`docs/CUSTOMIZATION.md`).
