# RTK Query — Restora Website Template v1.0.0

RTK Query is the **standard server-data access layer** and the **only API
client** in this template.

- Slice: `src/store/api/publicApi.ts` (`reducerPath: "restoraPublicApi"`).
- Types + envelope helpers: `src/store/api/types.ts`.
- Store wiring: `src/store/store.ts` (reducer + middleware).

---

## Base query

```ts
baseQuery: fetchBaseQuery({
  baseUrl: `${API_URL}/api/v1/public`,          // NEXT_PUBLIC_RESTORA_API_URL
  prepareHeaders: (headers) => {
    if (RESTAURANT_ID) headers.set("x-restaurant-id", RESTAURANT_ID);
    return headers;
  },
})
```

Every GET endpoint also passes `?restaurantId=` via `params` (cache-friendly
tenant resolution). See `docs/TENANT.md`.

---

## Envelope unwrapping

Restora wraps responses in `{ success: true, data, meta? }`. Each endpoint
unwraps `data` in `transformResponse`, so hooks return **plain typed payloads**
(empty array / null on failure rather than throwing for reads). Errors still
surface on the RTK error field for mutations.

Helpers in `src/store/api/types.ts`:
- `apiErrorMessage(error, fallback)` — localized API message or fallback.
- `apiErrorCode(error)` — machine code (e.g. `BAD_REQUEST`).
- `apiErrorKey(code)` — strips `reservations.` prefix for localized keys.
- `apiErrorShortfall(error)` — capacity shortfall number.
- `apiErrorDetailCode(error)` — machine code nested in `details.code`.

---

## Queries

| Hook | HTTP | Provides tag |
| --- | --- | --- |
| `useGetRestaurantQuery` | GET `/restaurant` | `Restaurant` |
| `useGetAvailabilityQuery` | GET `/restaurant/availability` | `Availability` |
| `useGetHomeQuery` | GET `/home` | `Home` |
| `useGetCategoriesQuery` | GET `/categories` | `Categories` |
| `useGetMenuPageQuery` | GET `/products` | `Products` |
| `useGetProductByIdQuery` | GET `/products/[id]` | `Products` |
| `useLazyGetProductByIdQuery` | (lazy) same | `Products` |
| `useGetOffersQuery` | GET `/offers` | `Offers` |
| `useGetDeliveryZonesQuery` | GET `/delivery-zones` | `DeliveryZones` |
| `useGetReservationConfigQuery` | GET `/reservations/config` | `Reservations` |
| `useGetReservationSlotsQuery` | GET `/reservations/slots` | `Reservations` |
| `useGetOrdersByPhoneQuery` | GET `/orders?phone=` | `Orders` |
| `useLazyGetOrdersByPhoneQuery` | (lazy) same | `Orders` |
| `useGetOrderByIdQuery` | GET `/orders/[id]` | `Orders` |
| `useLazyGetOrderByIdQuery` | (lazy) same | `Orders` |

## Mutations

| Hook | HTTP | Invalidates |
| --- | --- | --- |
| `useCreateOrderMutation` | POST `/orders` | `Orders` |
| `useCreateReservationMutation` | POST `/reservations` | `Reservations` |

## Tag types

`Restaurant, Availability, Home, Categories, Products, Offers, DeliveryZones,
Reservations, Orders`.

Invalidation is **targeted**: creating an order invalidates only `Orders`;
creating a reservation invalidates only `Reservations`. There is no
"refetch everything" behavior.

---

## Loading / error patterns

Every data-driven component renders proper states:

- Loading — skeleton/pulse placeholders or `Loader2` spinner.
- Error — localized message via `apiErrorMessage` + toast (mutations).
- Empty — dedicated empty state (e.g. `EmptyCart`, `MenuEmpty`,
  `noOrdersFound`).

Never expose raw backend errors to the user.

---

## Adding a query / mutation

1. Check `docs/API_ENDPOINTS.md` — reuse an existing endpoint if possible.
2. Add the endpoint to `publicApi.ts` with correct `providesTags` /
   `invalidatesTags`.
3. Type the payload in `src/store/api/types.ts` (mirror the API DTO).
4. Export the generated hook and use it in a container component.

Do **not** create a second API client or a second client-side caching library.
