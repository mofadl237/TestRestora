"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Search, Loader2, Info, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/src/i18n/routing";
import { IconNextCircle } from "@/src/lib/i18n/DirectionalIcons";
import { toast } from "@/lib/toast";
import { isValidEgyptianPhone } from "@/lib/phoneValidation";
import {
  useLazyGetOrdersByPhoneQuery,
  useLazyGetOrderByIdQuery,
} from "@/src/store/api/publicApi";
import type { IOrderSummaryRow as OrderSummary } from "@/src/store/api/types";
import { EASE } from "../Order/OrderAnimations";
import { StatusBadge } from "../Order/StatusBadge";
import { OrderCard } from "./OrderCard";

const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
};

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function TrackOrderClient() {
  const t = useTranslations("trackOrder");
  const locale = useLocale();
  const [fetchOrders] = useLazyGetOrdersByPhoneQuery();
  const [fetchOrderById] = useLazyGetOrderByIdQuery();

  const storedPhone = useSyncExternalStore(
    () => () => {},
    () => window.localStorage.getItem("lastTrackedPhone") ?? "",
    () => "",
  );
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderSummary | null>(null);
  const [loadingLast, setLoadingLast] = useState(true);

  // Pre-fill the phone input from the last tracked number once it hydrates
  const [prevStoredPhone, setPrevStoredPhone] = useState(storedPhone);
  if (storedPhone !== prevStoredPhone) {
    setPrevStoredPhone(storedPhone);
    setPhone(storedPhone);
  }

  // Load lastOrder on mount
  useEffect(() => {
    const fetchLast = async () => {
      const saved = localStorage.getItem("lastOrder");
      if (!saved) {
        setLoadingLast(false);
        return;
      }
      try {
        const { orderId } = JSON.parse(saved);
        if (orderId) {
          const detail = await fetchOrderById({ id: orderId, locale }).unwrap();
          if (detail) {
            setLastOrder({
              id: detail.id,
              orderNumber: detail.orderNumber,
              status: detail.status,
              paymentStatus: detail.paymentStatus,
              customerName: detail.customerName,
              deliveryAddress: detail.deliveryAddress,
              city: detail.city,
              totalPrice: detail.totalPrice,
              createdAt: detail.createdAt,
              itemCount: detail.items.reduce(
                (sum, item) => sum + item.quantity,
                0,
              ),
            });
          }
        }
      } catch {
        // Validation fails securely and silently
      } finally {
        setLoadingLast(false);
      }
    };
    fetchLast();
  }, [locale, fetchOrderById]);

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const trimmed = phone.trim();

      if (!trimmed) {
        toast.error(t("errorEmptyPhone"));
        return;
      }
      if (!isValidEgyptianPhone(trimmed)) {
        toast.error(t("errorPhoneInvalid"));
        return;
      }

      setLoading(true);
      setHasSearched(true);

      try {
        const results = await fetchOrders({
          phone: trimmed,
          locale,
        }).unwrap();
        setOrders(results);
        localStorage.setItem("lastTrackedPhone", trimmed);
      } catch {
        toast.error(t("errorSearch"));
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [phone, locale, t, fetchOrders],
  );

  const activeOrders = orders.filter(
    (o) => o.status !== "COMPLETED" && o.status !== "CANCELLED",
  );

  const completedOrders = orders.filter(
    (o) => o.status === "COMPLETED" || o.status === "CANCELLED",
  );

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="container marginSection mx-auto max-w-4xl min-h-[60vh]"
    >
      <motion.div variants={itemVariants} className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
          {t("description")}
        </p>
      </motion.div>

      {/* Last Order Banner */}
      <AnimatePresence>
        {!loadingLast && lastOrder && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 32 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                    {t("continueTracking")}
                  </h3>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-primary">
                      {lastOrder.orderNumber}
                    </span>
                    <span className="text-muted-foreground/60">|</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(lastOrder.createdAt)}
                    </span>
                    <span className="text-muted-foreground/60">|</span>
                    <StatusBadge status={lastOrder.status} size="sm" />
                  </div>
                </div>
                <Link
                  href={`/orders/${lastOrder.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 sm:w-auto"
                >
                  {t("continue")}
                  <IconNextCircle className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSearch}
        className="mx-auto mb-12 flex flex-col md:flex-row max-w-2xl items-center gap-3 lg:gap-4"
      >
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <Search
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("placeholder")}
            className="h-14 w-full rounded-2xl border border-input bg-card ps-11 pe-12 text-base text-foreground shadow-sm placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {storedPhone && storedPhone === phone && (
            <button
              type="button"
              onClick={() => {
                setPhone("");
                localStorage.removeItem("lastTrackedPhone");
              }}
              className="absolute inset-y-0 right-4 flex items-center justify-center text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none"
              aria-label={t("clearSearch")}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !phone.trim()}
          className="flex h-14 min-w-[120px] cursor items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-primary-foreground shadow transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("track")}
        </button>
      </motion.form>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl bg-muted/60"
                />
              ))}
            </div>
          </motion.div>
        )}

        {!loading && hasSearched && orders.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Info className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              {t("noOrdersFound")}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("noOrdersDesc")}
            </p>
          </motion.div>
        )}

        {!loading && hasSearched && orders.length > 0 && (
          <motion.div
            key="results"
            className="space-y-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {activeOrders.length > 0 && (
              <section>
                <div className="mb-5 flex items-center gap-2 border-b border-border/60 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {t("activeOrders")}
                  </h2>
                  <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {activeOrders.length}
                  </span>
                </div>
                {/* Start */}

                {activeOrders.map((order) => (
                  <div
                    key={order.id}
                    className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-3 md:p-5 shadow-sm  mb-2"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="mt-2 flex flex-col md:flex-row items-center gap-1 md:gap-3">
                          <span className="font-mono text-sm font-semibold text-primary">
                            {order.orderNumber}
                          </span>
                          <span className="text-muted-foreground/60">|</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="text-muted-foreground/60">|</span>
                          <StatusBadge status={order.status} size="sm" />
                        </div>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 sm:w-auto"
                      >
                        {t("continue")}
                        <IconNextCircle className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
                {/*End */}
              </section>
            )}

            {completedOrders.length > 0 && (
              <section>
                <div className="mb-5 flex items-center gap-2 border-b border-border/60 pb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {t("completedOrders")}
                  </h2>
                  <span className="ms-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {completedOrders.length}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 opacity-95">
                  {completedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} isCompleted />
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
