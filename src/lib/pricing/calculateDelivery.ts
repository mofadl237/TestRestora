import type { IDeliveryInput } from "./pricing.types";

/**
 * Effective delivery fee for a summary.
 *
 * Rules, in priority order:
 *  1. A free-delivery campaign/threshold is active AND the subtotal qualifies → 0.
 *  2. A delivery zone is selected → its `deliveryPrice` (immutable snapshot).
 *  3. Fallback flat fee (settings / legacy path) when no zone exists.
 *
 * Future campaigns (e.g. "free delivery for a specific zone") plug in here
 * without changing the engine's public shape.
 */
export function calcDeliveryFee(input: IDeliveryInput): number {
  const rawFee = input.zone?.deliveryPrice ?? input.fallbackFee ?? 0;
  const fee = Math.max(0, rawFee);

  if (fee <= 0) return 0;

  const threshold = input.freeDeliveryThreshold;
  if (threshold && threshold > 0 && (input.subtotal ?? 0) >= threshold) return 0;

  return fee;
}

/** Whether free delivery applies for the given summary inputs. */
export function isFreeDelivery(input: IDeliveryInput): boolean {
  return calcDeliveryFee(input) === 0 && (input.zone?.deliveryPrice ?? input.fallbackFee ?? 0) > 0;
}
