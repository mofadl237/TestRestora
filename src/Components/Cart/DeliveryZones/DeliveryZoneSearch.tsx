"use client";

import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { useTranslations } from "next-intl";
import { Check, MapPin, Search, SearchX } from "lucide-react";

import { formattePrice } from "@/lib/utils";
import type { IDeliveryZoneCardData } from "./types";

interface IProps {
  zones: IDeliveryZoneCardData[];
  selectedId: string | null;
  onSelect: (zone: IDeliveryZoneCardData) => void;
  autoFocus?: boolean;
}

/**
 * Searchable delivery area list. Rendered inside the desktop popover and the
 * mobile bottom sheet. Built on the Base UI Combobox (inline mode) so search,
 * arrow-key navigation and Enter selection behave identically on both.
 */
export function DeliveryZoneSearch({
  zones,
  selectedId,
  onSelect,
  autoFocus,
}: IProps) {
  const t = useTranslations("cart");
  const selectedZone = zones.find((zone) => zone.id === selectedId) ?? null;

  return (
    <Combobox.Root
      inline
      items={zones}
      value={selectedZone}
      onValueChange={(zone) => {
        if (zone) onSelect(zone);
      }}
      isItemEqualToValue={(a, b) => a?.id === b?.id}
      itemToStringLabel={(zone) => zone.name}
      itemToStringValue={(zone) => zone.id}
      autoHighlight
      highlightItemOnHover
    >
      <div className="p-2">
        <div className="relative">
        <Search
          className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Combobox.Input
          autoFocus={autoFocus}
          aria-label={t("searchDeliveryArea")}
          placeholder={t("searchDeliveryArea")}
          className="h-11 w-full rounded-xl border border-border bg-background pe-4 ps-10 text-sm text-foreground shadow-none outline-none transition-colors duration-200 placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-2 focus:ring-ring/30"
        />
      </div>

      <Combobox.List className="mt-1 max-h-72 overflow-y-auto py-1 outline-none">
        {(zone: IDeliveryZoneCardData) => (
          <Combobox.Item
            key={zone.id}
            value={zone}
            className="group/item flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-start outline-none transition-colors duration-150 data-[highlighted]:bg-muted focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/80 text-muted-foreground transition-colors duration-150 group-data-[highlighted]/item:bg-primary/10 group-data-[highlighted]/item:text-primary">
              <MapPin className="size-4" aria-hidden="true" />
            </span>

            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
              {zone.name}
            </span>

            <span className="shrink-0 text-sm font-bold text-foreground">
              {formattePrice(zone.deliveryPrice)}
            </span>

            {selectedId === zone.id && (
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
                aria-hidden="true"
              >
                <Check className="size-3" strokeWidth={3} />
              </span>
            )}
          </Combobox.Item>
        )}
      </Combobox.List>

      <Combobox.Empty className="px-3 py-8 text-center">
        <SearchX
          className="mx-auto mb-2 size-6 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-sm font-semibold text-foreground">
          {t("noZonesFound")}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t("noZonesFoundHint")}
        </p>
      </Combobox.Empty>
      </div>
    </Combobox.Root>
  );
}
