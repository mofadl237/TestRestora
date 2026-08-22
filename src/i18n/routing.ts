import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * Supported locales ship with the template. The DEFAULT locale is configurable
 * via `NEXT_PUBLIC_DEFAULT_LOCALE` so the template is not locked to the
 * restaurant used to build it (defaults to English).
 */
export const routing = defineRouting({
  locales: ['ar', 'en', 'it'],
  defaultLocale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE === 'ar' ? 'ar' : 'en',
  localePrefix: 'always',
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
