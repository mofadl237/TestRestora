"use client";

import * as React from "react";
import { Drawer } from "@base-ui/react/drawer";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import { DeliveryZoneSearch } from "./DeliveryZoneSearch";
import { DeliveryZoneTrigger } from "./DeliveryZoneTrigger";
import type { IDeliveryZoneCardData } from "./types";

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zones: IDeliveryZoneCardData[];
  selectedId: string | null;
  selectedZone: IDeliveryZoneCardData | null;
  freeDelivery: boolean;
  onSelect: (zone: IDeliveryZoneCardData) => void;
}

/**
 * Mobile delivery area picker — a bottom sheet (Base UI Drawer) so the full
 * list stays touch friendly. Hidden from the `sm` breakpoint up.
 */
export function DeliveryZoneSheet({
  open,
  onOpenChange,
  zones,
  selectedId,
  selectedZone,
  freeDelivery,
  onSelect,
}: IProps) {
  const t = useTranslations("cart");

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="down">
      <Drawer.Trigger
        render={
          <DeliveryZoneTrigger
            open={open}
            selectedZone={selectedZone}
            freeDelivery={freeDelivery}
          />
        }
      />

      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 z-50 bg-black/40 supports-backdrop-filter:backdrop-blur-sm data-[starting-style]:animate-in data-[starting-style]:fade-in-0 data-[ending-style]:animate-out data-[ending-style]:fade-out-0" />

        <Drawer.Popup className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[calc(100dvh-4rem)] w-full max-w-lg flex-col rounded-t-3xl border-t border-border bg-background pb-[env(safe-area-inset-bottom)] shadow-2xl outline-none data-[starting-style]:animate-in data-[starting-style]:slide-in-from-bottom data-[ending-style]:animate-out data-[ending-style]:slide-out-to-bottom">
          {/* Drag handle */}
          <div
            className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-border"
            aria-hidden="true"
          />

          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-5 pt-4 pb-1">
            <Drawer.Title className="font-heading text-base font-bold tracking-tight text-foreground">
              {t("deliveryZone")}
            </Drawer.Title>
            <Drawer.Close
              aria-label={t("closeSelector")}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground outline-none transition-colors duration-200 hover:bg-muted/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
            >
              <X className="size-4" aria-hidden="true" />
            </Drawer.Close>
          </div>

          <DeliveryZoneSearch
            key={open ? "search-open" : "search-closed"}
            zones={zones}
            selectedId={selectedId}
            onSelect={onSelect}
            autoFocus
          />
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
