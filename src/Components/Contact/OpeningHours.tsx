"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import type { IBusinessDay } from "@/lib/restaurant";
import { usePublicSettings } from "../Footer/data";
import { itemVariants } from "./animations";

interface DaySlot {
  day: string;
  hours: string;
}

const emptySubscribe = () => () => {};

const getToday = () => new Date().getDay();

const getServerToday = () => null;

function hoursLabel(
  day: IBusinessDay | undefined,
  closed: string,
  open24: string,
): string | null {
  if (!day) return null;
  if (day.status === "closed" || day.shifts.length === 0) return closed;
  if (day.status === "24") return open24;
  return day.shifts.map((shift) => `${shift.open} – ${shift.close}`).join(", ");
}

export function OpeningHours() {
  const t = useTranslations("contact.hours");
  const days = t.raw("days") as DaySlot[];
  const today = useSyncExternalStore(emptySubscribe, getToday, getServerToday);
  const publicSettings = usePublicSettings();
  const businessHours = publicSettings?.businessHours ?? [];

  return (
    <motion.div
      variants={itemVariants}
      className="rounded-2xl border border-border/70 bg-card p-6 shadow-[0_2px_8px_0_oklch(0.493_0.128_33_/_0.05)]"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground">
          {t("title")}
        </h3>
      </div>

      <ul className="space-y-1">
        {days.map((slot, index) => {
          const isToday = today === index;
          const settingDay = businessHours.find((d) => d.day === (index + 6) % 7);
          const hours = hoursLabel(settingDay, t("closed"), t("open24")) ?? slot.hours;
          return (
            <li
              key={slot.day}
              aria-current={isToday ? "date" : undefined}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors ${
                isToday
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {slot.day}
                {isToday && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
                    {t("today")}
                  </span>
                )}
              </span>
              <span className="text-sm tabular-nums">{hours}</span>
            </li>
          );
        })}
      </ul>

      <p className="mt-5 border-t border-border/70 pt-4 text-xs leading-relaxed text-muted-foreground">
        {t("note")}
      </p>
    </motion.div>
  );
}
