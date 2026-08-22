"use client";

import { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Utensils, X } from "lucide-react";
import { RootState } from "@/src/store/store";
import {
  clearCart,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  hydrateCart,
  setDeliveryZone,
  clearDeliveryZone,
  clearDineInTable,
  removeOfferGroup,
  increaseOfferQuantity,
  decreaseOfferQuantity,
  type ICartProduct,
  type ICartDeliveryZone,
} from "@/src/store/features/CartSlice";
import { calcSubtotal, cartItemToLine, calculateOrderSummary } from "@/lib/utils";
import type { IPricingLineInput } from "@/src/lib/pricing";
import { isValidEgyptianPhone } from "@/lib/phoneValidation";
import { motion } from "framer-motion";
import { pageVariants } from "./ShoppingCart/CartAnimations";
import { toast } from "@/lib/toast";
import { getLocalStorage } from "@/lib/localStorageHandle";
import {
  useGetDeliveryZonesQuery,
  useLazyGetProductByIdQuery,
  useCreateOrderMutation,
} from "@/src/store/api/publicApi";
import {
  apiErrorMessage,
  type ICreateOrderItem,
  type ICreateOrderOffer,
} from "@/src/store/api/types";
import { useActiveTable } from "@/src/Providers/TableProvider";

import { Button } from "@/components/ui/button";
import CartHeader from "./ShoppingCart/CartHeader";
import CartItems from "./ShoppingCart/CartItems";
import CartSummary from "./ShoppingCart/CartSummary";
import CheckoutForm, { ICheckoutFields } from "./ShoppingCart/CheckoutForm";
import SubmitOrderButton from "./ShoppingCart/SubmitOrderButton";
import EmptyCart from "./ShoppingCart/EmptyCart";
import { CartOfferGroup } from "./ShoppingCart/CartOfferGroup";
import { AddToCartDialog } from "@/src/Components/Product/AddToCartDialog";
import type { IProductWithOptions } from "@/src/Components/Product/AddToCartDialog/types";
import { DeliveryZoneSelector } from "@/src/Components/Cart/DeliveryZones/DeliveryZoneSelector";
import { DeliverySummaryCard } from "@/src/Components/Cart/DeliveryZones/DeliverySummaryCard";
import { RestaurantClosedBanner } from "@/src/Components/Cart/RestaurantClosedBanner";
import type { IDeliveryZoneCardData } from "@/src/Components/Cart/DeliveryZones";
import PromoCodeInput from "./ShoppingCart/PromoCodeInput";

const RenderOrder = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("cart");
  const { clearTable } = useActiveTable();

  const { items, offerGroups = [], promoCode, deliveryZone = null, table = null, tax = 0, discount = 0 } =
    useSelector((state: RootState) => state.cart);

  const isDineIn = table !== null;

  // Live delivery zones from the Public API. Free-delivery thresholds are not
  // part of the public contract, so the checkout renders the raw zone fee.
  const { data: zones = [], isLoading: zonesLoading } =
    useGetDeliveryZonesQuery({ locale });
  const freeDeliveryThreshold = 0;

  const [checkoutFields, setCheckoutFields] = useState<ICheckoutFields>({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    apartment: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [restaurantOpen, setRestaurantOpen] = useState<boolean | null>(null);

  // Edit dialog state
  const [editItem, setEditItem] = useState<ICartProduct | null>(null);
  const [editProduct, setEditProduct] = useState<IProductWithOptions | null>(
    null,
  );
  const [editLoading, setEditLoading] = useState(false);

  const [fetchProduct] = useLazyGetProductByIdQuery();
  const [createOrder] = useCreateOrderMutation();

  // Load persisted cart from localStorage after mount so server and client
  // render identical markup on the initial pass (fixes hydration mismatch).
  // Supports the legacy bare-array shape as well as `{ items, deliveryZone, table }`.
  useEffect(() => {
    const raw = getLocalStorage();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        if (parsed.length) dispatch(hydrateCart(parsed));
      } else if (Array.isArray(parsed?.items) && parsed.items.length) {
        dispatch(hydrateCart(parsed));
      }
    } catch {
      // Ignore malformed localStorage data
    }
  }, [dispatch]);

  // If the persisted zone is no longer offered, drop the selection.
  useEffect(() => {
    if (!deliveryZone) return;
    if (!zones.some((z) => z.id === deliveryZone.id)) {
      dispatch(clearDeliveryZone());
    }
  }, [zones, deliveryZone, dispatch]);

  const offersTotal = offerGroups.reduce(
    (sum, og) => sum + og.finalPrice * og.quantity,
    0,
  );
  const subtotal = calcSubtotal(items) + offersTotal;

  // Delivery fee always flows through the Pricing Engine (never in JSX).
  const deliveryInput = isDineIn
    ? null
    : deliveryZone
      ? {
          zone: {
            deliveryPrice: deliveryZone.deliveryPrice,
            minimumOrder: deliveryZone.minimumOrder,
          },
          freeDeliveryThreshold,
          subtotal,
        }
      : { fallbackFee: 0, freeDeliveryThreshold, subtotal };

  // Include offer groups as a single synthetic line so the summary's subtotal
  // and total incorporate the offer final price alongside normal items.
  const offerLine: IPricingLineInput | null =
    offersTotal > 0
      ? { basePrice: offersTotal, options: [], quantity: 1 }
      : null;

  const summary = calculateOrderSummary({
    lines: offerLine
      ? [...items.map(cartItemToLine), offerLine]
      : items.map(cartItemToLine),
    delivery: deliveryInput,
    discount,
    tax,
  });

  const handleSelectZone = useCallback(
    (zone: IDeliveryZoneCardData) => {
      const selection: ICartDeliveryZone = {
        id: zone.id,
        name: zone.name,
        deliveryPrice: zone.deliveryPrice,
        minimumOrder: zone.minimumOrder,
        estimatedTimeMin: zone.estimatedTimeMin,
        estimatedTimeMax: zone.estimatedTimeMax,
      };
      dispatch(setDeliveryZone(selection));
    },
    [dispatch],
  );

  const handleRemove = useCallback(
    (id: string) => dispatch(removeItem(id)),
    [dispatch],
  );

  const handleIncrease = useCallback(
    (id: string) => dispatch(increaseQuantity(id)),
    [dispatch],
  );

  const handleDecrease = useCallback(
    (id: string) => dispatch(decreaseQuantity(id)),
    [dispatch],
  );

  const handleClearCart = useCallback(() => dispatch(clearCart()), [dispatch]);

  const handleRemoveOffer = useCallback(
    (id: string) => dispatch(removeOfferGroup(id)),
    [dispatch],
  );

  const handleIncreaseOffer = useCallback(
    (id: string) => dispatch(increaseOfferQuantity(id)),
    [dispatch],
  );

  const handleDecreaseOffer = useCallback(
    (id: string) => dispatch(decreaseOfferQuantity(id)),
    [dispatch],
  );

  const handleLeaveTable = useCallback(() => {
    clearTable();
    dispatch(clearDineInTable());
    toast.success(t("tableLeft"));
  }, [clearTable, dispatch, t]);

  /** Open the edit dialog: fetch the full product from the API first. */
  const handleEdit = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      setEditLoading(true);
      try {
        const product = await fetchProduct({
          id: item.productId,
          locale,
        }).unwrap();
        if (!product) {
          toast.error(t("errorLoadProduct"));
          return;
        }
        setEditItem(item);
        setEditProduct(product as IProductWithOptions);
      } catch {
        toast.error(t("errorFailedLoadProduct"));
      } finally {
        setEditLoading(false);
      }
    },
    [items, locale, t, fetchProduct],
  );

  const handleEditClose = useCallback(() => {
    setEditItem(null);
    setEditProduct(null);
  }, []);

  /** Submit the order via the Public API, then clear cart and navigate. */
  const handleSubmit = useCallback(async () => {
    if (loading) return;

    if (!checkoutFields.customerName.trim()) {
      toast.error(t("errorNameRequired"));
      return;
    }
    if (!checkoutFields.phone.trim()) {
      toast.error(t("errorPhoneRequired"));
      return;
    }
    if (!isValidEgyptianPhone(checkoutFields.phone)) {
      toast.error(t("errorPhoneInvalid"));
      return;
    }
    if (!isDineIn) {
      if (!checkoutFields.address.trim()) {
        toast.error(t("errorAddressRequired"));
        return;
      }
      if (!checkoutFields.city.trim()) {
        toast.error(t("errorCityRequired"));
        return;
      }
      if (zones.length > 0 && !deliveryZone) {
        toast.error(t("serverErrorZoneRequired"));
        return;
      }
    }
    if (restaurantOpen === false) {
      toast.error(t("serverErrorClosed"));
      return;
    }

    setLoading(true);

    // Build order payload outside try so catch can log it on failure.
    // Normal cart products
    const normalItems: ICreateOrderItem[] = items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      quantity: item.quantity,
      basePrice: item.basePrice,
      variant: item.variant
        ? {
            id: item.variant.id,
            name: item.variant.name,
            price: item.variant.price,
          }
        : undefined,
      options: (item.options ?? []).map((option) => ({
        id: option.id,
        name: option.name,
        price: option.price,
      })),
      note: item.note,
    }));

    // Offer participating products must also appear in items[] so the
    // backend's "items must be a non-empty array" validation passes even
    // for offer-only carts. The `offers` array carries the offer metadata.
    const offerProductItems: ICreateOrderItem[] = offerGroups.flatMap((og) =>
      og.products.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        productImage: p.productImage,
        quantity: og.quantity,
        basePrice: p.basePrice,
      })),
    );

    const orderItems: ICreateOrderItem[] = [
      ...normalItems,
      ...offerProductItems,
    ];

    const orderOffers: ICreateOrderOffer[] = offerGroups.map((og) => ({
      offerId: og.offerId,
      offerType: og.offerType,
      offerName: og.offerName,
      quantity: og.quantity,
      products: og.products.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        role: p.role,
        basePrice: p.basePrice,
      })),
    }));

    try {

      const payload = {
        customerName: checkoutFields.customerName,
        customerPhone: checkoutFields.phone,
        deliveryAddress: isDineIn ? "" : checkoutFields.address,
        city: isDineIn ? "" : checkoutFields.city,
        notes: checkoutFields.notes || undefined,
        items: orderItems,
        offers: orderOffers.length > 0 ? orderOffers : undefined,
        promoCode: promoCode?.code,
        deliveryZoneId: isDineIn ? null : (deliveryZone?.id ?? null),
        tax,
        discount,
        locale,
        tableId: table?.id ?? null,
        tableNumber: table?.number ?? null,
      };

      console.log("[ORDER] Submitting payload:", JSON.stringify({
        itemCount: payload.items.length,
        offerCount: payload.offers?.length ?? 0,
        promoCode: payload.promoCode ?? "(none)",
        deliveryZoneId: payload.deliveryZoneId ?? "(none)",
        tax: payload.tax,
        discount: payload.discount,
        tableId: payload.tableId ?? "(none)",
        items: payload.items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          basePrice: i.basePrice,
          hasVariant: !!i.variant,
          optionCount: i.options?.length ?? 0,
        })),
      }, null, 2));

      const result = await createOrder(payload).unwrap();

      console.log("[ORDER] Success response:", JSON.stringify(result, null, 2));

      if (!result?.orderId) {
        console.error("[ORDER] No orderId in response", result);
        toast.error(t("errorSomethingWrong"));
        return;
      }

      // Persist minimal order reference for guest re-access (no PII stored)
      localStorage.setItem(
        "lastOrder",
        JSON.stringify({
          orderId: result.orderId,
          orderNumber: result.orderNumber,
        }),
      );
      dispatch(clearCart());
      router.push(`/orders/${result.orderId}`);
    } catch (err) {
      // ── Comprehensive error logging ────────────────────────────────────
      const raw = err as Record<string, unknown>;
      const errData = raw?.data as Record<string, unknown> | undefined;
      const errBody = errData?.error as Record<string, unknown> | undefined;

      console.group("[ORDER] CREATE FAILED");
      console.log("HTTP status:", raw?.status);
      console.log("raw error:", raw?.error);
      console.log("raw message:", raw?.message);
      console.log("response data:", errData);
      console.log("response data.error:", errBody);
      console.log("full error object keys:", Object.keys(raw));
      if (errData) console.log("full data object keys:", Object.keys(errData));
      console.groupEnd();
      // ── End error logging ──────────────────────────────────────────────

      toast.error(apiErrorMessage(err, t("errorSomethingWrong")));
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    checkoutFields,
    items,
    offerGroups,
    promoCode,
    deliveryZone,
    zones.length,
    tax,
    discount,
    locale,
    dispatch,
    router,
    t,
    restaurantOpen,
    isDineIn,
    table,
    createOrder,
  ]);

  if (!items.length && !offerGroups.length) {
    return <EmptyCart />;
  }

  const isSubmitDisabled =
    restaurantOpen === false ||
    (!items.length && !offerGroups.length) ||
    !checkoutFields.customerName.trim() ||
    !checkoutFields.phone.trim() ||
    (!isDineIn &&
      (!checkoutFields.address.trim() ||
        !checkoutFields.city.trim() ||
        (zones.length > 0 && !deliveryZone))) ||
    loading;

  return (
    <>
      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="container marginSection"
      >
        <RestaurantClosedBanner onStatusChange={setRestaurantOpen} />

        {/* Two-column on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start xl:grid-cols-[1fr_420px]">
          {/* ── LEFT: Cart items + Delivery Zone ── */}
          <div className="min-w-0 space-y-6">
            <CartHeader
              itemCount={items.length}
              offerGroupCount={offerGroups.length}
              onClearCart={handleClearCart}
            />
            <CartItems
              items={items}
              onRemove={handleRemove}
              onEdit={handleEdit}
              onIncrease={handleIncrease}
              onDecrease={handleDecrease}
              editLoading={editLoading}
            />

            {/* Offer Groups — each is ONE logical transaction */}
            {offerGroups.length > 0 && (
              <div className="space-y-3">
                {offerGroups.map((group) => (
                  <CartOfferGroup
                    key={group.id}
                    group={group}
                    onRemove={handleRemoveOffer}
                    onIncrease={handleIncreaseOffer}
                    onDecrease={handleDecreaseOffer}
                  />
                ))}
              </div>
            )}

            {!isDineIn &&
              (zonesLoading ? (
                <div className="space-y-3" aria-hidden="true">
                  <div className="h-4 w-36 animate-pulse rounded bg-muted/70" />
                  <div className="h-12 w-full animate-pulse rounded-xl border border-border/70 bg-muted/40" />
                </div>
              ) : (
                <DeliveryZoneSelector
                  zones={zones}
                  selectedId={deliveryZone?.id ?? null}
                  subtotal={subtotal}
                  freeDeliveryThreshold={freeDeliveryThreshold}
                  onSelect={handleSelectZone}
                />
              ))}

            {!isDineIn && deliveryZone && (
              <DeliverySummaryCard
                zone={deliveryZone}
                freeDelivery={
                  freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold
                }
                freeDeliveryThreshold={freeDeliveryThreshold}
              />
            )}
          </div>

          {/* ── RIGHT: Summary + Checkout + Submit ── */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-6">
            <CartSummary
              subtotal={summary.subtotal}
              delivery={summary.deliveryFee}
              tax={summary.tax}
              discount={summary.discount}
              total={summary.total}
              promoCode={promoCode}
            />

            {/* Promo Code Input */}
            <PromoCodeInput cartSubtotal={subtotal} />

            {isDineIn && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Utensils className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                        {t("dineInLabel")}
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {t("tableLabel", { number: table?.number })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLeaveTable}
                    aria-label={t("leaveTable")}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            <CheckoutForm
              fields={checkoutFields}
              onChange={setCheckoutFields}
              isDineIn={isDineIn}
            />

            {/* Sticky submit on mobile — normal flow on desktop */}
            <div className="sticky bottom-4 z-10 lg:static lg:bottom-auto lg:z-auto">
              <SubmitOrderButton
                total={summary.total}
                loading={loading}
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit dialog — mounted outside the grid so it overlays correctly */}
      {editItem && editProduct && (
        <AddToCartDialog
          mode="edit"
          cartItem={editItem}
          product={editProduct}
          open={true}
          onClose={handleEditClose}
        />
      )}
    </>
  );
};

export default RenderOrder;
