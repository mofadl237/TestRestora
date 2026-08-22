"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  useGetOrderByIdQuery,
  useGetRestaurantQuery,
} from "@/src/store/api/publicApi";
import {
  buildInvoice,
  buildRestaurant,
  mapOrderDetail,
} from "@/src/lib/orderDisplay";
import OrderDetailsClient from "./OrderDetailsClient";

export default function OrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const locale = useLocale();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const orderId = params?.orderId;

  const { data: order, isLoading, isError } = useGetOrderByIdQuery(
    { id: orderId ?? "", locale },
    { skip: !mounted || !orderId },
  );
  const { data: settings } = useGetRestaurantQuery(
    { locale },
    { skip: !mounted },
  );

  useEffect(() => {
    if (!mounted) return;
    if (isLoading) return;
    if (isError || order === null || order === undefined) {
      notFound();
    }
  }, [mounted, isLoading, isError, order, orderId]);

  if (!mounted || isLoading || !order || !settings) {
    return (
      <div className="container marginSection flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading order</span>
      </div>
    );
  }

  const currencyCode = settings.currency || null;
  const orderDetail = mapOrderDetail(order, locale, currencyCode);
  const invoice = buildInvoice(order, locale, currencyCode);
  const restaurant = buildRestaurant(settings);

  return (
    <OrderDetailsClient
      order={orderDetail}
      invoice={invoice}
      restaurant={restaurant}
    />
  );
}
