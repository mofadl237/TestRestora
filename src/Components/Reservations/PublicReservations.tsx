"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { CalendarClock, Users, Clock, Phone, Mail, User, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

import {
  useGetReservationSlotsQuery,
  useCreateReservationMutation,
} from "@/src/store/api/publicApi";
import {
  apiErrorDetailCode,
  apiErrorKey,
  apiErrorShortfall,
} from "@/src/store/api/types";
import type { IApiReservationSlot as IReservationSlot } from "@/src/store/api/types";
import type { ReservationSlotReason as SlotClosedReason } from "@/src/store/api/types";
import { useLocaleDirection } from "@/src/lib/i18n/useLocaleDirection";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

function heatLevel(used: number, capacity: number): 0 | 1 | 2 | 3 {
  if (capacity <= 0) return 3;
  const ratio = used / capacity;
  if (ratio <= 0) return 0;
  if (ratio < 0.5) return 1;
  if (ratio < 1) return 2;
  return 3;
}

const HEAT_CLASSES: Record<0 | 1 | 2 | 3, string> = {
  0: "border-border/60 bg-card text-foreground hover:border-primary/60 hover:bg-primary/5",
  1: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  2: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  3: "border-destructive/30 bg-destructive/10 text-destructive opacity-70",
};

export function PublicReservations() {
  const t = useTranslations("reservations");
  const locale = useLocale();
  const { isRTL } = useLocaleDirection();

  const todayKey = new Date().toISOString().slice(0, 10);
  const [date, setDate] = React.useState(todayKey);

  const {
    data: slotsData,
    isFetching: slotsLoading,
    isError: slotsError,
  } = useGetReservationSlotsQuery({ date: `${date}T12:00:00` });
  const slots: IReservationSlot[] | null = slotsError ? null : slotsData ?? [];

  const [createReservation] = useCreateReservationMutation();

  const [selectedSlot, setSelectedSlot] = React.useState<IReservationSlot | null>(null);
  const [form, setForm] = React.useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    partySize: "2",
    notes: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [errorKey, setErrorKey] = React.useState<string | null>(null);
  const [shortfall, setShortfall] = React.useState<number | undefined>(undefined);
  const [done, setDone] = React.useState(false);

  const onDateChange = (value: string) => {
    setDate(value || todayKey);
    setSelectedSlot(null);
  };

  const party = Number(form.partySize) || 0;

  const canSubmit =
    !busy &&
    form.customerName.trim().length > 0 &&
    form.customerPhone.trim().length > 0 &&
    party >= 1 &&
    selectedSlot !== null;

  const submit = async () => {
    if (!selectedSlot) return;
    setBusy(true);
    setErrorKey(null);
    setShortfall(undefined);
    setDone(false);
    try {
      await createReservation({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail.trim() || undefined,
        partySize: party,
        date: new Date(selectedSlot.date).toISOString(),
        notes: form.notes.trim() || undefined,
      }).unwrap();
      setDone(true);
      setSelectedSlot(null);
    } catch (err) {
      const key = apiErrorKey(apiErrorDetailCode(err));
      setErrorKey(key);
      setShortfall(apiErrorShortfall(err));
    } finally {
      setBusy(false);
    }
  };

  const errorText = React.useMemo(() => {
    if (!errorKey) return null;
    const params: Record<string, string | number> = {};
    if (shortfall != null) params.shortfall = shortfall;
    return t(`valid.${errorKey}`, params);
  }, [errorKey, shortfall, t]);

  const inputClass =
    "h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <section id="reserve" className="relative overflow-hidden pb-20 pt-10 md:pt-14">
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-2/3 w-2/3 rounded-full bg-primary/6 blur-[100px]" />
      </div>

      <div className="mx-auto w-full max-w-3xl px-4">
        <motion.div
          className="flex flex-col items-center gap-5 text-center"
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            <span className="mr-2 text-primary">—</span>
            {t("hero.kicker")}
            <span className="ml-2 text-primary">—</span>
          </p>
          <h1 className="max-w-2xl font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            {t("hero.titleStart")}{" "}
            <span className="text-primary">{t("hero.titleHighlight")}</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hero.description")}
          </p>
        </motion.div>

        <motion.div
          className="mt-10 rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        >
          {done ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-7" aria-hidden="true" />
              </span>
              <h2 className="font-heading text-2xl font-semibold text-foreground">
                {t("success.title")}
              </h2>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                {t("success.description")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setForm({
                    customerName: "",
                    customerPhone: "",
                    customerEmail: "",
                    partySize: "2",
                    notes: "",
                  });
                }}
                className="mt-2 inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-5 text-xs font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-muted"
              >
                {t("success.another")}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Date + slots */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pub-res-date"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  <CalendarClock className="size-3.5" aria-hidden="true" />
                  {t("form.date")}
                </label>
                <input
                  id="pub-res-date"
                  type="date"
                  value={date}
                  min={todayKey}
                  onChange={(e) => onDateChange(e.target.value)}
                  className={cn(inputClass, "w-48 cursor-pointer")}
                />
              </div>

              {slotsLoading ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/60" />
                  ))}
                </div>
              ) : slots === null ? (
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4" aria-hidden="true" />
                  {t("form.loadFailed")}
                </p>
              ) : slots.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                  {t("form.noSlots")}
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {t("form.pickSlot")}
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {slots.map((slot) => {
                      const level = heatLevel(slot.used, slot.capacity);
                      const closed = !slot.open;
                      return (
                        <button
                          key={slot.date}
                          type="button"
                          disabled={closed || party < 1 || slot.available < party}
                          onClick={() => setSelectedSlot(slot)}
                          aria-pressed={selectedSlot?.date === slot.date}
                          title={
                            closed
                              ? t(`slotReason.${(slot.reason ?? "outsideHours") as SlotClosedReason}`)
                              : `${slot.available} / ${slot.capacity}`
                          }
                          className={cn(
                            "flex h-16 flex-col items-center justify-center gap-0.5 rounded-xl border px-2 text-center transition-all",
                            HEAT_CLASSES[level],
                            !closed && "hover:scale-[1.03]",
                            closed && "cursor-not-allowed opacity-60",
                            selectedSlot?.date === slot.date &&
                              "border-primary bg-primary/15 ring-2 ring-primary/30",
                          )}
                        >
                          <span className="text-sm font-bold tracking-wider">{slot.label}</span>
                          <span className="text-[10px] font-semibold tracking-wider">
                            {closed
                              ? t(`slotReason.${(slot.reason ?? "outsideHours") as SlotClosedReason}`)
                              : `${slot.available}/${slot.capacity}`}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected slot summary */}
              {selectedSlot && (
                <p className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-foreground">
                  <Clock className="size-4 text-primary" aria-hidden="true" />
                  {new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(new Date(selectedSlot.date))}
                </p>
              )}

              {/* Contact form */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <LabeledField icon={<User className="size-3.5" aria-hidden="true" />} label={t("form.name")}>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={(e) => setForm((p) => ({ ...p, customerName: e.target.value }))}
                    placeholder={t("form.namePlaceholder")}
                    className={inputClass}
                  />
                </LabeledField>
                <LabeledField icon={<Phone className="size-3.5" aria-hidden="true" />} label={t("form.phone")}>
                  <input
                    type="tel"
                    value={form.customerPhone}
                    onChange={(e) => setForm((p) => ({ ...p, customerPhone: e.target.value }))}
                    placeholder={t("form.phonePlaceholder")}
                    className={inputClass}
                    dir="ltr"
                  />
                </LabeledField>
                <LabeledField icon={<Mail className="size-3.5" aria-hidden="true" />} label={t("form.email")}>
                  <input
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setForm((p) => ({ ...p, customerEmail: e.target.value }))}
                    placeholder={t("form.emailPlaceholder")}
                    className={inputClass}
                    dir="ltr"
                  />
                </LabeledField>
                <LabeledField icon={<Users className="size-3.5" aria-hidden="true" />} label={t("form.partySize")}>
                  <input
                    type="number"
                    min={1}
                    value={form.partySize}
                    onChange={(e) => setForm((p) => ({ ...p, partySize: e.target.value }))}
                    className={inputClass}
                  />
                </LabeledField>
              </div>

              <LabeledField icon={<Sparkles className="size-3.5" aria-hidden="true" />} label={t("form.notes")}>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder={t("form.notesPlaceholder")}
                  rows={3}
                  className="w-full resize-y rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </LabeledField>

              {errorText && (
                <p
                  className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  <AlertCircle className="size-4" aria-hidden="true" />
                  {errorText}
                </p>
              )}

              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className={cn(
                  "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold uppercase tracking-widest text-primary-foreground transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  isRTL && "flex-row",
                )}
              >
                {t("form.submit")}
              </button>

              <p className="text-center text-[11px] text-muted-foreground">
                {t("form.disclaimer")}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function LabeledField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}