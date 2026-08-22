/**
 * Client-safe mapping from the Public API's order DTOs to the presentation
 * types consumed by the Order / Invoice components.
 *
 * The API deliberately hides `customerPhone` (privacy) and `paymentMethod`
 * from public order responses, so those fields default to safe empty values
 * here — the UI falls back to localized "not specified" labels.
 */

import type {
  IApiOrderItem,
  IOrderDetailPayload,
  IPublicSettings,
} from "@/src/store/api/types";
import type {
  IOrderDetail,
  IOrderItem,
} from "@/src/Components/Order/types";
import type {
  IInvoiceData,
  IInvoiceRestaurant,
} from "@/src/Components/Documents";

/** Pick the translation for `locale`, falling back to the first available. */
function pickName(
  translations: Array<{ locale: string; name: string }>,
  locale: string,
): string {
  return (
    translations.find((t) => t.locale === locale)?.name ??
    translations[0]?.name ??
    ""
  );
}

/** Map one API order line to the display shape used by OrderItemsList/Invoice. */
export function mapOrderItem(
  item: IApiOrderItem,
  locale: string,
): IOrderItem {
  return {
    id: item.id,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    totalPrice: item.totalPrice,
    notes: item.notes,
    productName: item.product
      ? pickName(item.product.translations, locale)
      : "",
    productImage: item.product?.image ?? "",
    variantName: item.productVariant
      ? pickName(item.productVariant.translations, locale)
      : null,
    options: (item.options ?? []).map(({ option }) => ({
      id: option.id,
      name: pickName(option.translations, locale),
      price: option.price,
    })),
  };
}

/** Map an API order detail to the full presentation type. */
export function mapOrderDetail(
  order: IOrderDetailPayload,
  locale: string,
  currencyCode: string | null,
): IOrderDetail {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: null,
    customerName: order.customerName,
    customerPhone: "",
    deliveryAddress: order.deliveryAddress,
    city: order.city,
    tableNumber: order.tableNumber,
    notes: order.notes,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    tax: order.tax,
    discount: order.discount,
    totalPrice: order.totalPrice,
    currencyCode,
    createdAt: order.createdAt,
    deliveryZone: order.deliveryZoneSnapshot
      ? {
          name: order.deliveryZoneSnapshot.name,
          estimatedTimeMin: order.deliveryZoneSnapshot.estimatedTimeMin,
          estimatedTimeMax: order.deliveryZoneSnapshot.estimatedTimeMax,
        }
      : null,
    items: order.items.map((item) => mapOrderItem(item, locale)),
  };
}

/** Build the invoice document payload from an API order detail. */
export function buildInvoice(
  order: IOrderDetailPayload,
  locale: string,
  currencyCode: string | null,
): IInvoiceData {
  return {
    orderNumber: order.orderNumber,
    orderType: order.orderType,
    tableNumber: order.tableNumber,
    createdAt: order.createdAt,
    customerName: order.customerName,
    customerPhone: "",
    deliveryAddress: order.deliveryAddress,
    city: order.city,
    deliveryZone: order.deliveryZoneSnapshot
      ? {
          name: order.deliveryZoneSnapshot.name,
          estimatedTimeMin: order.deliveryZoneSnapshot.estimatedTimeMin,
          estimatedTimeMax: order.deliveryZoneSnapshot.estimatedTimeMax,
        }
      : null,
    paymentMethod: null,
    paymentStatus: order.paymentStatus,
    currencyCode,
    lines: order.items.map((item) => {
      const display = mapOrderItem(item, locale);
      return {
        name: display.productName,
        variantName: display.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        notes: item.notes,
      };
    }),
    totals: {
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      tax: order.tax,
      discount: order.discount,
      total: order.totalPrice,
    },
  };
}

/** Build the invoice header block from public restaurant settings. */
export function buildRestaurant(
  settings: IPublicSettings,
): IInvoiceRestaurant {
  return {
    name: settings.restaurantName || "Restaurant",
    phone: settings.contact?.phone ?? null,
    email: settings.contact?.email ?? null,
    address: settings.contact?.address ?? null,
  };
}
