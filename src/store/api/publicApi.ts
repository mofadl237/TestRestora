/**
 * RTK Query slice for the Restora Public API.
 *
 * Every request is tenant-scoped: the `x-restaurant-id` header (and the
 * `restaurantId` query param) are injected automatically from the
 * `NEXT_PUBLIC_RESTORA_RESTAURANT_ID` env var. The restaurant's hosted UI
 * language is passed per-request as `?locale=` so translations come back from
 * the API in the requested language.
 *
 * The API wraps every response in `{ success: true, data, meta? }` (or
 * `{ success: false, error }`), so each endpoint unwraps `data` in its
 * transform and surfaces `meta` for pagination. Errors are handled by RTK
 * Query automatically and can be read with `apiErrorMessage`.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import type {
  IApiAvailability,
  IApiCategory,
  IApiOffer,
  IApiResponse,
  IApiReservationConfig,
  IApiReservationSlot,
  ICreateOrderInput,
  ICreateOrderResult,
  ICreateReservationInput,
  IDeliveryZone,
  IHomePayload,
  IMenuPageArg,
  IMenuPageResult,
  IOrderDetailPayload,
  IOrderSummaryRow,
  IPromoCodeValidateInput,
  IPromoCodeValidateResult,
  IPublicSettings,
  IResolvedTable,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_RESTORA_API_URL ?? "";
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTORA_RESTAURANT_ID ?? "";

export const RESTORA_API_ROOT = API_URL;

export const publicApi = createApi({
  reducerPath: "restoraPublicApi",
  baseQuery: fetchBaseQuery({
    // Same-origin path — proxied to the Restora Public API by a rewrite in
    // next.config.ts. The API host sends no CORS headers, so cross-origin
    // fetches are blocked by the browser; proxying keeps the browser request
    // same-origin while the server forwards to the Public API.
    baseUrl: "/api/v1/public",
    prepareHeaders: (headers)=> {
      if (RESTAURANT_ID) headers.set("x-restaurant-id", RESTAURANT_ID);
      return headers;
    },
  }),
  tagTypes: [
    "Restaurant",
    "Availability",
    "Home",
    "Categories",
    "Products",
    "Offers",
    "DeliveryZones",
    "Reservations",
    "Orders",
    "Tables",
  ],
  endpoints: (builder) => ({
    // ─── Restaurant ────────────────────────────────────────────────────────
    getRestaurant: builder.query<IPublicSettings, { locale?: string }>({
      query: ({ locale }) => ({
        url: "/restaurant",
        params: {
          locale,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<IPublicSettings>) => {
        if (!response.success) return {} as IPublicSettings;
        return response.data;
      },
      providesTags: ["Restaurant"],
    }),

    getAvailability: builder.query<IApiAvailability, void>({
      query: () => ({
        url: "/restaurant/availability",
        params: RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {},
      }),
      transformResponse: (response: IApiResponse<IApiAvailability>) => {
        if (!response.success) return {} as IApiAvailability;
        return response.data;
      },
      providesTags: ["Availability"],
    }),

    // ─── Home ─────────────────────────────────────────────────────────────
    getHome: builder.query<IHomePayload, { locale: string }>({
      query: ({ locale }) => ({
        url: "/home",
        params: {
          locale,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<IHomePayload>) => {
        if (!response.success) return { bestSellers: [], chefRecommendations: [], familyMeals: [], kidsMeals: [], newItems: [], comboMeals: [], sections: [], offers: [], branding: { primaryColor: "", logo: "", coverImage: "" } };
        return response.data;
      },
      providesTags: ["Home"],
    }),

    // ─── Catalog ──────────────────────────────────────────────────────────
    getCategories: builder.query<IApiCategory[], { locale: string }>({
      query: ({ locale }) => ({
        url: "/categories",
        params: {
          locale,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<IApiCategory[]>) => {
        if (!response.success) return [];
        return response.data;
      },
      providesTags: ["Categories"],
    }),

    getMenuPage: builder.query<IMenuPageResult, IMenuPageArg>({
      query: ({ locale, categoryId, page = 1, limit = 50 }) => ({
        url: "/products",
        params: {
          locale,
          ...(categoryId ? { categoryId } : {}),
          page,
          limit,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (
        response: IApiResponse<unknown>,
        _meta,
        arg,
      ): IMenuPageResult => {
        const body = response as IApiResponse<IMenuPageResult["items"]>;
        if (!body.success) return { items: [], meta: { page: arg.page ?? 1, pageSize: arg.limit ?? 50, total: 0, hasNextPage: false } };
        return {
          items: body.data,
          meta: body.meta ?? { page: arg.page ?? 1, pageSize: arg.limit ?? 50, total: body.data.length, hasNextPage: false },
        };
      },
      providesTags: ["Products"],
    }),

    getProductById: builder.query<
      IMenuPageResult["items"][number] | null,
      { id: string; locale: string }
    >({
      query: ({ id, locale }) => ({
        url: `/products/${id}`,
        params: {
          locale,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<IMenuPageResult["items"][number]>) => {
        if (!response.success) return null;
        return response.data;
      },
      providesTags: ["Products"],
    }),

    getOffers: builder.query<IApiOffer[], { locale: string }>({
      query: ({ locale }) => ({
        url: "/offers",
        params: {
          locale,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<IApiOffer[]>) => {
        if (!response.success) return [];
        return response.data;
      },
      providesTags: ["Offers"],
    }),

    // ─── Delivery zones ────────────────────────────────────────────────────
    getDeliveryZones: builder.query<IDeliveryZone[], { locale: string }>({
      query: ({ locale }) => ({
        url: "/delivery-zones",
        params: {
          locale,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<IDeliveryZone[]>) => {
        if (!response.success) return [];
        return response.data;
      },
      providesTags: ["DeliveryZones"],
    }),

    // ─── Reservations ──────────────────────────────────────────────────────
    getReservationConfig: builder.query<IApiReservationConfig, void>({
      query: () => ({
        url: "/reservations/config",
        params: RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {},
      }),
      transformResponse: (response: IApiResponse<IApiReservationConfig>) => {
        if (!response.success) {
          return { enabled: true, capacity: 50, maxGuests: 8, intervalMinutes: 30, windowDays: 14 };
        }
        return response.data;
      },
      providesTags: ["Reservations"],
    }),

    getReservationSlots: builder.query<IApiReservationSlot[], { date: string }>({
      query: ({ date }) => ({
        url: "/reservations/slots",
        params: {
          date,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<{ slots: IApiReservationSlot[] }>) => {
        if (!response.success) return [];
        return response.data.slots;
      },
      providesTags: ["Reservations"],
    }),

    createReservation: builder.mutation<
      { id: string },
      ICreateReservationInput
    >({
      query: (body) => ({
        url: "/reservations",
        method: "POST",
        body,
        params: RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {},
      }),
      invalidatesTags: ["Reservations"],
    }),

    // ─── Tables (dine-in / QR) ─────────────────────────────────────────────
    resolveTable: builder.query<IResolvedTable | null, { tableId: string }>({
      query: ({ tableId }) => ({
        url: "/tables/resolve",
        params: {
          tableId,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<IResolvedTable>) => {
        if (!response.success) return null;
        return response.data;
      },
      providesTags: ["Tables"],
    }),

    // ─── Orders ────────────────────────────────────────────────────────────
    getOrdersByPhone: builder.query<IOrderSummaryRow[], { phone: string; locale: string }>({
      query: ({ phone, locale }) => ({
        url: "/orders",
        params: {
          phone,
          locale,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<IOrderSummaryRow[]>) => {
        if (!response.success) return [];
        return response.data;
      },
      providesTags: ["Orders"],
    }),

    getOrderById: builder.query<
      IOrderDetailPayload | null,
      { id: string; locale: string }
    >({
      query: ({ id, locale }) => ({
        url: `/orders/${id}`,
        params: {
          locale,
          ...(RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {}),
        },
      }),
      transformResponse: (response: IApiResponse<IOrderDetailPayload>) => {
        if (!response.success) return null;
        return response.data;
      },
      providesTags: ["Orders"],
    }),

    createOrder: builder.mutation<ICreateOrderResult, ICreateOrderInput>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
        params: RESTAURANT_ID ? { restaurantId: RESTAURANT_ID } : {},
      }),
      transformResponse: (response: IApiResponse<ICreateOrderResult>) => {
        if (!response.success) return {} as ICreateOrderResult;
        return response.data;
      },
      invalidatesTags: ["Orders"],
    }),

    // ─── Promo Code ──────────────────────────────────────────────────────
    validatePromoCode: builder.mutation<
      IPromoCodeValidateResult,
      IPromoCodeValidateInput
    >({
      query: (body) => ({
        url: "/offers/validate",
        method: "POST",
        body: { ...body, restaurantId: RESTAURANT_ID },
      }),
      transformResponse: (response: IApiResponse<IPromoCodeValidateResult>) => {
        if (!response.success) return {} as IPromoCodeValidateResult;
        return response.data;
      },
    }),
  }),
});

export const {
  useGetRestaurantQuery,
  useGetAvailabilityQuery,
  useGetHomeQuery,
  useGetCategoriesQuery,
  useGetMenuPageQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useGetOffersQuery,
  useGetDeliveryZonesQuery,
  useGetReservationConfigQuery,
  useGetReservationSlotsQuery,
  useCreateReservationMutation,
  useResolveTableQuery,
  useLazyResolveTableQuery,
  useGetOrdersByPhoneQuery,
  useLazyGetOrdersByPhoneQuery,
  useGetOrderByIdQuery,
  useLazyGetOrderByIdQuery,
  useCreateOrderMutation,
  useValidatePromoCodeMutation,
} = publicApi;

// Re-export types that components consume from the API layer.
export type { IApiOrderItem } from "./types";
