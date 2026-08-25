import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans,
  Playfair_Display,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/src/i18n/routing";
import { getI18nRuntimeConfig } from "@/src/i18n/config";
import { getSiteUrl } from "@/src/lib/seo/structuredData";
import { fetchPublicRestaurant } from "@/src/lib/seo/serverData";
import RestaurantJsonLd from "@/src/Components/Seo/RestaurantJsonLd";
import "../globals.css";
import { cn } from "@/lib/utils";
import { MarketingChrome } from "./MarketingChrome";
import { Providers } from "@/src/Providers/Providers";
import { ToastProvider } from "@/src/Providers/ToastProvider";

const playfairDisplayHeading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = getSiteUrl();

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const restaurant = await fetchPublicRestaurant(locale);

  const name = restaurant?.restaurantName?.trim() || "Restaurant";
  const description = restaurant?.contact?.address
    ? `${name} — ${restaurant.contact.address}`
    : `Order from ${name} online.`;
  const coverImage = restaurant?.branding?.coverImage || null;
  const logo = restaurant?.branding?.logo || null;

  const images = coverImage ? [{ url: coverImage, width: 1200, height: 630, alt: name }] : [];
  const icons = logo ? { icon: logo } : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description,
    icons,
    robots: { index: true, follow: true },
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`]),
      ),
    },
    openGraph: {
      type: "website",
      siteName: name,
      title: name,
      description,
      ...(images.length ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      ...(images.length ? { images: images.map((i) => i.url) } : {}),
    },
  };
}

export async function generateStaticParams() {
  const { locales } = await getI18nRuntimeConfig();
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        notoSans.variable,
        playfairDisplayHeading.variable,
      )}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {/* Structured data is emitted server-side from the Public API. */}
        <RestaurantJsonLd locale={locale} />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <MarketingChrome>{children}</MarketingChrome>
            <ToastProvider />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
