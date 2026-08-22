// Shared serialisable order type passed from the Server Component downward.
// Never includes Prisma model objects — only plain data.

export interface IOrderOption {
  id: string;
  name: string;
  price: number;
}

export interface IOrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
  productName: string;
  productImage: string;
  variantName: string | null;
  options: IOrderOption[];
}

export interface IDeliveryZoneSnapshot {
  name: string;
  estimatedTimeMin: number | null;
  estimatedTimeMax: number | null;
}

export interface IOrderDetail {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  tableNumber: string | null;
  notes: string | null;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  totalPrice: number;
  currencyCode: string | null;
  createdAt: string;
  deliveryZone: IDeliveryZoneSnapshot | null;
  items: IOrderItem[];
}
