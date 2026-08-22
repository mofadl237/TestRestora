// Plain serialisable data shapes for the Document Engine. Documents never
// receive Prisma models or Redux state — only these DTOs, so they stay
// renderable from a server component, a print dialog or a future PDF pipeline.

export interface IInvoiceRestaurant {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface IInvoiceLine {
  name: string;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string | null;
}

export interface IInvoiceTotals {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
}

export interface IInvoiceZone {
  name: string;
  estimatedTimeMin: number | null;
  estimatedTimeMax: number | null;
}

export interface IInvoiceData {
  orderNumber: string;
  orderType: string;
  tableNumber: string | null;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  deliveryZone: IInvoiceZone | null;
  paymentMethod: string | null;
  paymentStatus: string;
  currencyCode: string | null;
  lines: IInvoiceLine[];
  totals: IInvoiceTotals;
}
