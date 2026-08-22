"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { itemVariants, timelineStepVariants, EASE } from "./OrderAnimations";

interface IProps {
  currentStatus: string;
  orderType?: string;
}

const DELIVERY_STEPS = [
  { key: "PENDING", emoji: "🕐" },
  { key: "CONFIRMED", emoji: "✅" },
  { key: "PREPARING", emoji: "👨‍🍳" },
  { key: "READY", emoji: "🧾" },
  { key: "OUT_FOR_DELIVERY", emoji: "🛵" },
  { key: "DELIVERED", emoji: "📦" },
  { key: "COMPLETED", emoji: "🎉" },
] as const;

const DINE_IN_STEPS = [
  { key: "PENDING", emoji: "🕐" },
  { key: "CONFIRMED", emoji: "✅" },
  { key: "PREPARING", emoji: "👨‍🍳" },
  { key: "READY", emoji: "🧾" },
  { key: "COMPLETED", emoji: "🎉" },
] as const;

const getStepState = (
  stepKey: string,
  currentStatus: string,
  steps: readonly { key: string; emoji: string }[],
): "completed" | "active" | "upcoming" => {
  if (currentStatus === "CANCELLED") return "upcoming";
  const stepOrder = steps.map((s) => s.key);
  const currentIdx = stepOrder.indexOf(currentStatus);
  const stepIdx = stepOrder.indexOf(stepKey);
  if (currentIdx === -1) return "upcoming";
  if (stepIdx < currentIdx) return "completed";
  if (stepIdx === currentIdx) return "active";
  return "upcoming";
};

export function OrderTimeline({ currentStatus, orderType = "DELIVERY" }: IProps) {
  const t = useTranslations("order");
  const isDineIn = orderType === "DINE_IN";
  const steps = isDineIn ? DINE_IN_STEPS : DELIVERY_STEPS;
  const isCancelled = currentStatus === "CANCELLED";

  return (
    <motion.div
      variants={itemVariants}
      className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm"
      style={{
        boxShadow:
          "0 1px 6px 0 oklch(0.62 0.2 50 / 0.05), 0 1px 2px 0 oklch(0.215 0.017 28 / 0.03)",
      }}
    >
      <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {t("orderProgress")}
      </h3>

      {isCancelled ? (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/6 px-4 py-3">
          <span className="text-lg">❌</span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("orderCancelled")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("cancelledDescription")}
            </p>
          </div>
        </div>
      ) : (
        <ol className="relative space-y-0">
          {steps.map((step, i) => {
            const state = getStepState(step.key, currentStatus, steps);
            const isLast = i === steps.length - 1;

            return (
              <motion.li
                key={step.key}
                custom={i}
                variants={timelineStepVariants}
                initial="hidden"
                animate="visible"
                className="relative flex gap-4"
              >
                {/* Vertical connector line */}
                {!isLast && (
                  <div className="absolute left-[17px] top-[34px] h-[calc(100%-10px)] w-px">
                    <motion.div
                      className="h-full w-full origin-top rounded-full"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.5,
                        ease: EASE,
                        delay: i * 0.07 + 0.3,
                      }}
                      style={{
                        background:
                          state === "completed"
                            ? "var(--primary)"
                            : "var(--border)",
                      }}
                    />
                  </div>
                )}

                {/* Step icon */}
                <div className="relative z-10 shrink-0 pb-6">
                  <motion.div
                    animate={{
                      backgroundColor:
                        state === "completed"
                          ? "var(--primary)"
                          : state === "active"
                            ? "color-mix(in oklch, var(--primary) 15%, var(--card))"
                            : "var(--muted)",
                      borderColor:
                        state === "active"
                          ? "var(--primary)"
                          : state === "completed"
                            ? "var(--primary)"
                            : "var(--border)",
                    }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm"
                  >
                    {state === "completed" ? (
                      <Check className="h-4 w-4 text-primary-foreground" />
                    ) : (
                      <span
                        className={
                          state === "active"
                            ? "text-base"
                            : "text-base opacity-50"
                        }
                      >
                        {step.emoji}
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* Step text */}
                <div className="pb-6 pt-1.5">
                  <p
                    className={`text-sm font-semibold leading-none ${
                      state === "active"
                        ? "text-primary"
                        : state === "completed"
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {t(`statuses.${step.key}`)}
                    {state === "active" && (
                      <motion.span
                        animate={{ opacity: [1, 0.4, 1] }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                        className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-primary align-middle"
                        aria-label={t("currentStepAria")}
                      />
                    )}
                  </p>
                  {state === "completed" && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {t("complete")}
                    </p>
                  )}
                  {state === "active" && (
                    <p className="mt-0.5 text-[10px] font-medium text-primary">
                      {t("currentStatus")}
                    </p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      )}
    </motion.div>
  );
}
