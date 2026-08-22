"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, MapPin, Search } from "lucide-react";

import { cn, formattePrice } from "@/lib/utils";
import type { IDeliveryZoneCardData } from "./types";

interface IProps extends React.ComponentProps<"button"> {
  open: boolean;
  selectedZone: IDeliveryZoneCardData | null;
  freeDelivery: boolean;
}

/**
 * Premium delivery area trigger. Rendered through the `render` prop of the
 * Base UI Popover/Drawer triggers so focus, aria and click handling stay native.
 */
export const DeliveryZoneTrigger = React.forwardRef<HTMLButtonElement, IProps>(
  function DeliveryZoneTrigger(
    { open, selectedZone, freeDelivery, className, ...rest },
    ref,
  ) {
    const t = useTranslations("cart");

    return (
      <button
        ref={ref}
        data-open={open || undefined}
        {...rest}
        type="button"
        className={cn(
          "group flex h-12 w-full items-center gap-3 rounded-xl border border-border bg-card px-4 text-start text-sm shadow-sm outline-none transition-[border-color,box-shadow,background-color] duration-300 hover:border-primary/40 focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring/30",
          "data-[open=true]:border-primary/60 data-[open=true]:ring-2 data-[open=true]:ring-ring/30",
          className,
        )}
      >
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300",
            selectedZone
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {selectedZone ? (
            <MapPin className="size-4" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
        </span>

        <span className="min-w-0 flex-1">
          {selectedZone ? (
            <span className="block truncate text-sm font-semibold text-foreground">
              {selectedZone.name}
            </span>
          ) : (
            <span className="block truncate text-sm text-muted-foreground">
              {t("searchDeliveryArea")}
            </span>
          )}
        </span>

        {selectedZone && (
          <span
            className={cn(
              "shrink-0 text-sm font-bold",
              freeDelivery ? "text-accent" : "text-foreground",
            )}
          >
            {freeDelivery
              ? t("free")
              : formattePrice(selectedZone.deliveryPrice)}
          </span>
        )}

        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>
    );
  },
);
