import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { getI18nRuntimeConfig } from './config';

export default getRequestConfig(async ({ requestLocale }) => {
  const { defaultLocale } = await getI18nRuntimeConfig();

  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
