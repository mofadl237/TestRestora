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

export const metadata: Metadata = {
  title: "Restaurant",
  description: "Order your favorite meals online.",
};

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
