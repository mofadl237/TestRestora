import type { IInvoiceData } from "./types";

/**
 * Pure client-safe mapper between an order-shaped object and the Document
 * Engine's `IInvoiceData` DTO. Shared by the server documents layer and the
 * dashboard screens so the invoice shape is produced in exactly one place.
 */

export interface IInvoiceItemSource {
  name: string;
  variantName: string | null;
  options: string[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
}

export interface IInvoiceOrderSource {
  orderNumber: string;
  orderType: string;
  tableNumber: string | null;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  deliveryZoneName: string | null;
  estimatedDeliveryTimeMin: number | null;
  estimatedDeliveryTimeMax: number | null;
  paymentMethod: string | null;
  paymentStatus: string;
  currencyCode: string | null;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalPrice: number;
  items: IInvoiceItemSource[];
}

export function toInvoiceData(
  source: IInvoiceOrderSource,
  paymentMethodLabel?: string | null,
): IInvoiceData {
  return {
    orderNumber: source.orderNumber,
    orderType: source.orderType,
    tableNumber: source.tableNumber,
    createdAt: source.createdAt,
    customerName: source.customerName,
    customerPhone: source.customerPhone,
    deliveryAddress: source.deliveryAddress,
    city: source.city,
    deliveryZone: source.deliveryZoneName
      ? {
          name: source.deliveryZoneName,
          estimatedTimeMin: source.estimatedDeliveryTimeMin,
          estimatedTimeMax: source.estimatedDeliveryTimeMax,
        }
      : null,
    paymentMethod: paymentMethodLabel ?? source.paymentMethod ?? null,
    paymentStatus: source.paymentStatus,
    currencyCode: source.currencyCode,
    lines: source.items.map((item) => ({
      name: item.name,
      variantName: item.variantName
        ? [item.variantName, ...item.options].filter(Boolean).join(" · ")
        : item.options.length > 0
          ? item.options.join(" · ")
          : null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes,
    })),
    totals: {
      subtotal: source.subtotal,
      deliveryFee: source.deliveryFee,
      tax: source.tax,
      discount: source.discount,
      total: source.totalPrice,
    },
  };
}
