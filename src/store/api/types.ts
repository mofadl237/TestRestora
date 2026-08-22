/**
 * Public API types for the Restora website template.
 *
 * These mirror the DTOs returned by the Restora Public API
 * (`/api/v1/public`), NOT Prisma models. Dates are ISO strings because the
 * JSON wire format serializes every `Date` to a string.
 *
 * The envelope helpers (`unwrap`/`listUnwrap`) strip the `{ success, data }`
 * wrapper so every endpoint's query hook returns the payload directly.
 */

import type {
  IBusinessDay,
  IBrandingSettings,
  IContactSettings,
  IReservationSettings,
  ISocialSettings,
} from "@/lib/restaurant";
import type {
  ICategory,
  IHomeProduct,
  IHomeSection,
  IProductWithOptions,
} from "@/src/Interfaces";

// ─── Response envelope ──────────────────────────────────────────────────────

export interface IApiListMeta {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage?: boolean;
}

export interface IApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface IApiOkBody<T> {
  success: true;
  data: T;
  meta?: IApiListMeta;
}

export type IApiResponse<T> = IApiOkBody<T> | IApiErrorBody;

/** Pull the localized message out of an RTK Query error (falls back to `fallback`). */
export function apiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const body = (error as { data?: unknown })?.data;
  if (!body) return fallback;

  // Restora envelope: { success, error: { message } }
  const envelope = body as { error?: { message?: string } };
  if (envelope.error?.message) return envelope.error.message;

  // NestJS validation pipe: { statusCode, message: string | string[], error }
  const nest = body as { message?: string | string[] };
  if (nest.message) {
    return Array.isArray(nest.message) ? nest.message.join(", ") : nest.message;
  }

  return fallback;
}

/** Pull the machine-readable error code out of an RTK Query error. */
export function apiErrorCode(error: unknown): string | null {
  const body = (error as { data?: IApiErrorBody } | undefined)?.data;
  return body?.error?.code ?? null;
}

/** Machine error codes are namespaced (e.g. `reservations.capacityFull`). */
export function apiErrorKey(code: string | null): string | null {
  if (!code) return null;
  return code.startsWith("reservations.") ? code.slice("reservations.".length) : code;
}

/** `shortfall` from a capacityFull conflict, when present. */
export function apiErrorShortfall(error: unknown): number | undefined {
  const details = (error as { data?: IApiErrorBody } | undefined)?.data?.error
    ?.details;
  if (!details || typeof details !== "object") return undefined;
  const value = (details as { shortfall?: unknown }).shortfall;
  return typeof value === "number" ? value : undefined;
}

/**
 * A localized machine code carried in `error.details.code` (used by the
 * reservations endpoint, which keeps the code that maps to the website's own
 * translation keys inside details rather than at the top level).
 */
export function apiErrorDetailCode(error: unknown): string | null {
  const details = (error as { data?: IApiErrorBody } | undefined)?.data?.error
    ?.details;
  if (!details || typeof details !== "object") return null;
  const value = (details as { code?: unknown }).code;
  return typeof value === "string" && value ? value : null;
}

// ─── Restaurant ─────────────────────────────────────────────────────────────

export interface ICountry {
  id: string;
  code: string;
  name: Record<string, string>;
  currencyCode: string;
  currencySymbol: string;
  defaultTimezone: string;
  defaultLocale: string;
  phoneCode: string;
}

export interface ILocalizationSettings {
  defaultLanguage: string;
  supportedLanguages: string[];
}

export interface IPublicSettings {
  restaurantName: string;
  country: ICountry | null;
  currency: string;
  timezone: string;
  businessHours: IBusinessDay[];
  branding: IBrandingSettings;
  contact: IContactSettings;
  social: ISocialSettings;
  localization: ILocalizationSettings;
}

export interface IApiAvailability {
  isOpenNow: boolean;
  status: "open" | "closed_hours" | "closed_holiday" | "closed_temporary";
  reason: string | null;
  closedUntil: string | null;
  message: Record<string, string>;
  nextOpeningAt: string | null;
}

// ─── Home ───────────────────────────────────────────────────────────────────

export interface IHomePayload {
  bestSellers: IHomeProduct[];
  chefRecommendations: IHomeProduct[];
  familyMeals: IHomeProduct[];
  kidsMeals: IHomeProduct[];
  newItems: IHomeProduct[];
  comboMeals: IHomeProduct[];
  sections: IHomeSection[];
  offers: IApiOffer[];
  branding: IBrandingSettings;
}

// ─── Offers ─────────────────────────────────────────────────────────────────

export interface IApiOfferProductRef {
  productId: string;
  role: string;
  product: { id: string; image: string; basePrice: number; name: string };
}

export interface IApiOffer {
  id: string;
  type: string;
  discountType: string | null;
  value: number;
  priority: number;
  image: string;
  endsAt: string | null;
  name: string;
  description: string;
  config: Record<string, unknown> | null;
  products: IApiOfferProductRef[];
}

// ─── Catalog ────────────────────────────────────────────────────────────────

export type IApiCategory = ICategory;

export type IApiProductWithOptions = IProductWithOptions;

export interface IMenuPageArg {
  locale: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface IMenuPageResult {
  items: IProductWithOptions[];
  meta: IApiListMeta;
}

// ─── Delivery zones ─────────────────────────────────────────────────────────

export interface IDeliveryZone {
  id: string;
  name: string;
  deliveryPrice: number;
  estimatedTimeMin: number;
  estimatedTimeMax: number;
  minimumOrder: number;
}

// ─── Reservations ───────────────────────────────────────────────────────────

export type IApiReservationConfig = IReservationSettings;

export type ReservationSlotReason =
  | "outsideHours"
  | "closedHoliday"
  | "closedTemporary"
  | "past"
  | "outsideWindow"
  | "disabled"
  | "full";

export interface IApiReservationSlot {
  date: string;
  label: string;
  open: boolean;
  reason: ReservationSlotReason | null;
  used: number;
  capacity: number;
  available: number;
}

export interface ICreateReservationInput {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  partySize: number;
  date: string;
  durationMinutes?: number;
  notes?: string;
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export interface IOrderSummaryRow {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  deliveryAddress: string;
  city: string;
  totalPrice: number;
  createdAt: string;
  itemCount: number;
}

export interface IOrderItemTranslation {
  locale: string;
  name: string;
  description?: string;
}

export interface IApiOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
  product: {
    id: string;
    image: string;
    basePrice: number;
    translations: IOrderItemTranslation[];
  } | null;
  productVariant: {
    id: string;
    price: number;
    translations: IOrderItemTranslation[];
  } | null;
  options: {
    option: { id: string; price: number; translations: IOrderItemTranslation[] };
  }[];
}

export interface IOrderDetailPayload {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  customerName: string;
  deliveryAddress: string;
  city: string;
  tableNumber: string | null;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  items: IApiOrderItem[];
  deliveryZoneSnapshot: {
    id: string;
    name: string;
    estimatedTimeMin: number | null;
    estimatedTimeMax: number | null;
  } | null;
}

export interface ICreateOrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  basePrice: number;
  variant?: { id: string; name: string; price: number };
  options?: { id: string; name: string; price: number }[];
  note?: string;
}

/** An offer as a single logical transaction in the order payload. */
export interface ICreateOrderOffer {
  offerId: string;
  offerType: string;
  offerName: string;
  quantity: number;
  products: {
    productId: string;
    productName: string;
    role: "trigger" | "reward" | "included";
    basePrice: number;
  }[];
}

export interface ICreateOrderInput {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  notes?: string;
  deliveryZoneId?: string | null;
  discount?: number;
  tax?: number;
  locale?: string;
  /** Dine-in table context established by the QR entry flow. */
  tableId?: string | null;
  tableNumber?: string | null;
  items: ICreateOrderItem[];
  /** Offer transactions — each is ONE logical offer, not individual products. */
  offers?: ICreateOrderOffer[];
  /** Applied promo code — server revalidates and recalculates. */
  promoCode?: string;
}

export interface ICreateOrderResult {
  orderId: string;
  orderNumber: string;
  customerName: string;
  totalPrice: number;
}

// ─── Promo Code ────────────────────────────────────────────────────────────

export interface IPromoCodeValidateInput {
  code: string;
  phone?: string;
  cartSubtotal: number;
}

export type IPromoCodeStatus =
  | "valid"
  | "invalid"
  | "expired"
  | "not_started"
  | "disabled"
  | "exhausted"
  | "already_used"
  | "first_order_only"
  | "minimum_order_not_met";

export interface IPromoCodeValidateResult {
  status: IPromoCodeStatus;
  offerId?: string;
  offerName?: string;
  offerType?: string;
  discountType?: string;
  discountValue?: number;
  /** Server-computed estimated discount for the given subtotal (preview only). */
  estimatedDiscount?: number;
  /** Server message for display. */
  message?: string;
  /** Minimum order required (when minimum_order_not_met). */
  minimumOrder?: number;
}

// ─── Tables (dine-in / QR) ──────────────────────────────────────────────────

export interface IResolvedTable {
  id: string;
  number: string;
  isActive: boolean;
}
