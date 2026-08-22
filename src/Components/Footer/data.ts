"use client";

import { useLocale } from "next-intl";
import { useGetRestaurantQuery } from "@/src/store/api/publicApi";
import type { IPublicSettings } from "@/src/store/api/types";

/**
 * Shared client-side snapshot of the restaurant's public settings. Backed by
 * RTK Query — every consumer on the page reuses the same cached payload, so
 * the footer, contact page and marketing chrome stay in sync without repeated
 * API calls.
 */
export function usePublicSettings(enabled = true): IPublicSettings | null {
  const locale = useLocale();
  const { data } = useGetRestaurantQuery({ locale }, { skip: !enabled });
  return data ?? null;
}
