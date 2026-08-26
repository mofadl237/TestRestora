/**
 * Centralized SEO helpers for the Restora website template.
 *
 * All metadata, canonical URL, OpenGraph and page-title logic lives here.
 * Pages call these helpers from their own `generateMetadata` exports so
 * every clone gets restaurant-specific SEO with ZERO source-code changes.
 *
 * Architecture:
 *   Clone -> set RESTAURANT_ID + SITE_URL -> deploy -> SEO adapts automatically.
 */

import type { Metadata } from "next";
import type { IPublicSettings } from "@/src/store/api/types";
import { fetchPublicRestaurant } from "./serverData";
import { routing } from "@/src/i18n/routing";

// --- Site URL ----------------------------------------------------------------

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

/**
 * Absolute origin for canonical URLs, sitemap, OG and JSON-LD.
 *
 * Priority: NEXT_PUBLIC_SITE_URL -> VERCEL_URL -> localhost (dev fallback).
 * In production builds the env var MUST be set.
 */
export function getSiteUrl(): string {
  if (SITE_URL) return SITE_URL;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

// --- Restaurant data (server-side) -------------------------------------------

export async function getRestaurantForSeo(
  locale: string,
): Promise<IPublicSettings | null> {
  return fetchPublicRestaurant(locale);
}

// --- Canonical helpers -------------------------------------------------------

/**
 * Build a canonical URL for the given locale + optional path.
 *
 *   canonicalUrl("en")          -> https://example.com/en
 *   canonicalUrl("ar", "/menu") -> https://example.com/ar/menu
 */
export function canonicalUrl(locale: string, path: string = ""): string {
  const base = getSiteUrl();
  const normalisedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}/${locale}${normalisedPath}`;
}

// --- Hreflang helpers --------------------------------------------------------

/**
 * Build hreflang alternates for a given page path across all configured locales.
 * Includes `x-default` pointing to the default locale.
 *
 *   buildHreflangAlternates("en", "/menu") ->
 *     { ar: "https://…/ar/menu", en: "https://…/en/menu", it: "https://…/it/menu",
 *       x-default: "https://…/en/menu" }
 */
export function buildHreflangAlternates(
  currentLocale: string,
  pagePath: string = "",
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = canonicalUrl(l, pagePath);
  }
  // x-default always points to the default locale
  languages["x-default"] = canonicalUrl(routing.defaultLocale, pagePath);
  return languages;
}

// --- Metadata builders -------------------------------------------------------

/** Default page description generated from restaurant name + address. */
function defaultDescription(
  name: string,
  address?: string | null,
): string {
  if (address) return `${name} — ${address}`;
  return `Order from ${name} online.`;

}

/**
 * Build the root layout metadata (title template + global OG / Twitter).
 *
 * The `template` pattern ensures every child page inherits restaurant
 * branding automatically: `%s | Disforno`, `%s | Fadl`, etc.
 */
export function buildRootMetadata(
  restaurant: IPublicSettings | null,
): Metadata {
  const name = restaurant?.restaurantName?.trim() || "Restaurant";
  const description = defaultDescription(
    name,
    restaurant?.contact?.address,
  );
  const coverImage = restaurant?.branding?.coverImage || null;
  const logo = restaurant?.branding?.logo || null;
  const siteUrl = getSiteUrl();

  const images = coverImage
    ? [{ url: coverImage, width: 1200, height: 630, alt: name }]
    : [];
  const icons = logo ? { icon: logo } : undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: name,
      template: `%s | ${name}`,
    },
    description,
    icons,
    robots: { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl(routing.defaultLocale),
      languages: buildHreflangAlternates(routing.defaultLocale),
    },
    openGraph: {
      type: "website",
      siteName: name,
      title: name,
      description,
      url: siteUrl,
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

/**
 * Build metadata for a named page (e.g. "Menu", "About Us").
 *
 * Returns the page title (will be wrapped by the root layout template
 * `%s | RestaurantName`) plus the locale-scoped canonical + OG overrides.
 */
export function buildPageMetadata(
  restaurant: IPublicSettings | null,
  locale: string,
  pagePath: string,
  opts: {
    title: string;
    description?: string;
    noindex?: boolean;
  },
): Metadata {
  const name = restaurant?.restaurantName?.trim() || "Restaurant";
  const description =
    opts.description ||
    defaultDescription(name, restaurant?.contact?.address);
  const coverImage = restaurant?.branding?.coverImage || null;

  const images = coverImage
    ? [{ url: coverImage, width: 1200, height: 630, alt: name }]
    : [];

  return {
    title: opts.title,
    description,
    robots: opts.noindex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl(locale, pagePath),
      languages: buildHreflangAlternates(locale, pagePath),
    },
    openGraph: {
      title: `${opts.title} | ${name}`,
      description,
      url: canonicalUrl(locale, pagePath),
      ...(images.length ? { images } : {}),
    },
    twitter: {
      title: `${opts.title} | ${name}`,
      description,
      ...(images.length ? { images: images.map((i) => i.url) } : {}),
    },
  };
}
