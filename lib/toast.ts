"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  /** Stable group id — toasts sharing a key update in place instead of stacking. */
  key?: string;
  type: ToastType;
  message: string;
}

const TOAST_DURATION = 4000;

let globalAddToast: ((msg: Omit<ToastMessage, "id">) => void) | null = null;

/** Call this from anywhere (client side) to show a toast. */
export const toast = {
  success: (message: string, key?: string) =>
    globalAddToast?.({ type: "success", message, key }),
  error: (message: string, key?: string) =>
    globalAddToast?.({ type: "error", message, key }),
  info: (message: string, key?: string) =>
    globalAddToast?.({ type: "info", message, key }),
};

export function useToastState() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastsRef = useRef<ToastMessage[]>([]);
  const timersRef = useRef<Record<string, number>>({});

  const scheduleDismiss = useCallback((id: string) => {
    if (timersRef.current[id]) {
      window.clearTimeout(timersRef.current[id]);
    }
    timersRef.current[id] = window.setTimeout(() => {
      toastsRef.current = toastsRef.current.filter((t) => t.id !== id);
      setToasts(toastsRef.current);
      delete timersRef.current[id];
    }, TOAST_DURATION);
  }, []);

  // De-duplicated add: a toast with the same `key` (or same type + message)
  // updates in place and refreshes its timer instead of stacking a duplicate
  // (e.g. adding the same product twice: "…1 item added" becomes
  // "…2 items added" in the same toast).
  const addToast = useCallback(
    (msg: Omit<ToastMessage, "id">) => {
      const existing = msg.key
        ? toastsRef.current.find(
            (toast) => toast.key === msg.key && toast.type === msg.type,
          )
        : toastsRef.current.find(
            (toast) => toast.type === msg.type && toast.message === msg.message,
          );

      if (existing) {
        if (existing.message !== msg.message) {
          existing.message = msg.message;
          toastsRef.current = [...toastsRef.current];
          setToasts(toastsRef.current);
        }
        scheduleDismiss(existing.id);
        return;
      }

      const id = crypto.randomUUID();
      const next = [...toastsRef.current, { ...msg, id }];
      toastsRef.current = next;
      setToasts(next);
      scheduleDismiss(id);
    },
    [scheduleDismiss],
  );

  useEffect(() => {
    globalAddToast = addToast;
    return () => {
      globalAddToast = null;
    };
  }, [addToast]);

  const dismiss = useCallback((id: string) => {
    toastsRef.current = toastsRef.current.filter((t) => t.id !== id);
    setToasts(toastsRef.current);
    if (timersRef.current[id]) {
      window.clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  return { toasts, dismiss };
}
