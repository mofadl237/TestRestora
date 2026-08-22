"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";

import { zoneSelectorVariants } from "./DeliveryZonesAnimations";
import { DeliveryZoneCombobox } from "./DeliveryZoneCombobox";
import { DeliveryZoneSheet } from "./DeliveryZoneSheet";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { IDeliveryZoneCardData } from "./types";

interface IProps {
  zones: IDeliveryZoneCardData[];
  selectedId: string | null;
  subtotal: number;
  freeDeliveryThreshold: number;
  onSelect: (zone: IDeliveryZoneCardData) => void;
}

/**
 * Checkout Delivery Zone picker — a premium searchable selector.
 * Desktop renders a searchable popover (DeliveryZoneCombobox); mobile renders a
 * bottom sheet (DeliveryZoneSheet). Both share the same searchable list and
 * write back through the existing `onSelect` contract.
 */
export function DeliveryZoneSelector({
  zones,
  selectedId,
  subtotal,
  freeDeliveryThreshold,
  onSelect,
}: IProps) {
  const t = useTranslations("cart");
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  if (!zones.length) return null;

  const selectedZone = zones.find((zone) => zone.id === selectedId) ?? null;
  const freeDelivery =
    freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold;

  const handleSelect = (zone: IDeliveryZoneCardData) => {
    setOpen(false);
    onSelect(zone);
  };

  return (
    <motion.div
      variants={zoneSelectorVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <MapPin className="size-4 text-primary" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          {t("deliveryZone")}
        </h3>
      </div>

      {isDesktop ? (
        <DeliveryZoneCombobox
          open={open}
          onOpenChange={setOpen}
          zones={zones}
          selectedId={selectedId}
          selectedZone={selectedZone}
          freeDelivery={freeDelivery}
          onSelect={handleSelect}
        />
      ) : (
        <DeliveryZoneSheet
          open={open}
          onOpenChange={setOpen}
          zones={zones}
          selectedId={selectedId}
          selectedZone={selectedZone}
          freeDelivery={freeDelivery}
          onSelect={handleSelect}
        />
      )}
    </motion.div>
  );
}
