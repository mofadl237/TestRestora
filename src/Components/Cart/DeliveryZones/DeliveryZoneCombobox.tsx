"use client";

import * as React from "react";
import { Popover } from "@base-ui/react/popover";

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
 * Desktop delivery area picker — a searchable popover anchored to the trigger.
 */
export function DeliveryZoneCombobox({
  open,
  onOpenChange,
  zones,
  selectedId,
  selectedZone,
  freeDelivery,
  onSelect,
}: IProps) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger
        render={
          <DeliveryZoneTrigger
            open={open}
            selectedZone={selectedZone}
            freeDelivery={freeDelivery}
          />
        }
      />

      <Popover.Portal>
        <Popover.Positioner
          sideOffset={8}
          align="start"
          collisionPadding={8}
          className="z-50 w-[min(26rem,calc(100vw-2rem))]"
        >
          <Popover.Popup className="overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-lg outline-none data-[starting-style]:animate-in data-[starting-style]:fade-in-0 data-[starting-style]:zoom-in-95 data-[ending-style]:animate-out data-[ending-style]:fade-out-0 data-[ending-style]:zoom-out-95">
            <DeliveryZoneSearch
              key={open ? "search-open" : "search-closed"}
              zones={zones}
              selectedId={selectedId}
              onSelect={onSelect}
              autoFocus
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
