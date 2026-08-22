import { routing } from "./routing";

/**
 * i18n runtime config for the standalone website template.
 *
 * The full Restora app resolves this from the restaurant's saved
 * `localization` Setting via Prisma. This template cannot touch the database,
 * so it derives the config statically from `routing`. The restaurant's own
 * localization preferences are still applied at runtime by the Public API
 * (`?locale=`), which is the single source of truth for translated content.
 */

export interface II18nRuntimeConfig {
  locales: string[];
  defaultLocale: string;
}

export function invalidateI18nRuntimeConfig(): void {
  // No-op: the template has no runtime-mutable i18n state.
}

export async function getI18nRuntimeConfig(): Promise<II18nRuntimeConfig> {
  return {
    locales: [...routing.locales],
    defaultLocale: routing.defaultLocale,
  };
}
