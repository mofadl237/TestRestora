"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToastState, type ToastType } from "@/lib/toast";

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />,
  error: <XCircle className="h-4 w-4 shrink-0 text-destructive" />,
  info: <Info className="h-4 w-4 shrink-0 text-primary" />,
};

const borderMap: Record<ToastType, string> = {
  success: "border-accent/30",
  error: "border-destructive/30",
  info: "border-primary/30",
};

export function ToastProvider() {
  const { toasts, dismiss } = useToastState();
  const t = useTranslations("common");

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-0 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col items-center gap-2 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:bottom-6 sm:left-auto sm:w-80 sm:translate-x-0 sm:items-end sm:pb-0 sm:end-6"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 28, scale: 0.92, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              y: 18,
              scale: 0.94,
              filter: "blur(4px)",
            }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 32,
              mass: 0.9,
            }}
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-2xl border bg-card/95 px-4 py-3 backdrop-blur-xl ${borderMap[toast.type]}`}
            style={{
              boxShadow:
                "0 16px 40px -12px oklch(0.215 0.017 28 / 0.28), 0 4px 12px -4px oklch(0.215 0.017 28 / 0.14)",
            }}
          >
            {iconMap[toast.type]}
            <p className="flex-1 text-sm font-medium leading-snug text-foreground">
              {toast.message}
            </p>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t("dismissNotification")}
              type="button"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
