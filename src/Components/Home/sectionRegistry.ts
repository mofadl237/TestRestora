import type { ComponentType } from "react";

export interface SectionSlotProps {
  name: string;
  products?: unknown[];
  [key: string]: unknown;
}

export type SectionComponent = ComponentType<SectionSlotProps>;

interface SectionEntry {
  component: SectionComponent;
  hasData: (section: SectionSlotProps) => boolean;
}

const registry = new Map<string, SectionEntry>();

export function registerSection(
  key: string,
  component: SectionComponent,
  hasData: (section: SectionSlotProps) => boolean = (s) =>
    Array.isArray(s.products) && s.products.length > 0,
) {
  registry.set(key, { component, hasData });
}

export function getSection(key: string): SectionEntry | undefined {
  return registry.get(key);
}

export function hasSection(key: string): boolean {
  return registry.has(key);
}
