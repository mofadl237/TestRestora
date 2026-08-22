/**
 * Shape of a delivery zone as exposed to the checkout UI.
 * Mirrors the server DTO (see src/server/deliveryZones.ts) minus `isActive`,
 * which is filtered server-side by `getActiveDeliveryZones`.
 */
export interface IDeliveryZoneCardData {
  id: string;
  name: string;
  deliveryPrice: number;
  estimatedTimeMin: number;
  estimatedTimeMax: number;
  minimumOrder: number;
}
