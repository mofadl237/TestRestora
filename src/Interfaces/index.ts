import { ReactElement } from "react";

export interface IDataNavBar {
  path: string;
  label: string;
  icon?: ReactElement;
}

// ─── Hero Section ─────────────────────────────────────────────────────────────

// Static, locale-independent slide data (images live in src/data).
export interface SlideMedia {
  id: number;
  image: string;
  thumbnail: string;
}

// Translated slide copy, sourced from next-intl (messages/*.json -> hero.slides).
export interface SlideContent {
  subtitle: string;
  title: string;
  description: string;
}

export interface Slide extends SlideMedia, SlideContent {}

export interface SliderControlProps {
  slides: Slide[];
  activeIndex: number;
  goToSlide: (index: number) => void;
  isPaused?: boolean;
  duration: number;
  autoplayKey: number;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

/**
 * Raw translation rows — one per locale, as stored in the Translation tables.
 * These are only consumed by src/server mappers; components always receive
 * the already-resolved (flattened) shapes below (ICategory, IProduct, ...).
 */
export interface ICategoryTranslation {
  id: string;
  locale: string;
  name: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProductTranslation {
  id: string;
  locale: string;
  name: string;
  description: string;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProductVariantTranslation {
  id: string;
  locale: string;
  name: string;
  productVariantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOptionGroupTranslation {
  id: string;
  locale: string;
  name: string;
  optionGroupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IOptionTranslation {
  id: string;
  locale: string;
  name: string;
  optionId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * ICategory — grouping for products (e.g., Pizza, Burger, Drink).
 * Prisma model: `Category`. `name` is already resolved for one locale by
 * the src/server mapper (mapCategory) — components never touch translations.
 */
export interface ICategory {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;

  // Optional relations
  products?: IProduct[];
}

/**
 * IProduct — flat Product record as stored in the database.
 * Prisma model: `Product`
 */
export interface IProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  order: number;
  basePrice: number;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;

  // ── Optional relations ───────────────────────────────────────────────────
  category?: ICategory;
  variants?: IProductVariant[];
  optionGroups?: IOptionGroup[];
}

/**
 * IProductVariant — one purchasable size or portion of a Product.
 * Prisma model: `ProductVariant`
 */
export interface IProductVariant {
  id: string;
  name: string;
  price: number;
  displayOrder: number;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * IOptionGroup — a named section of configurable Options for a Product.
 * Prisma model: `OptionGroup`
 */
export interface IOptionGroup {
  id: string;
  name: string;
  required: boolean;
  multipleSelection: boolean;
  minimumSelection: number;
  maximumSelection: number | null;
  displayOrder: number;
  productId: string;
  createdAt: string;
  updatedAt: string;

  // Options are always present when fetched for dialogs
  options: IOption[];
}

/**
 * IOption — one selectable item inside an OptionGroup.
 * Prisma model: `Option`
 */
export interface IOption {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  displayOrder: number;
  optionGroupId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * IProductWithOptions — a Product fully loaded with variants and option groups.
 * Use getProductWithOptions(id, locale) from src/server to obtain this shape.
 */
export interface IProductWithOptions extends IProduct {
  variants: IProductVariant[];
  optionGroups: IOptionGroup[];
}

// ─── Home Sections ────────────────────────────────────────────────────────────

/**
 * Raw translation row for a Home Section — one per locale.
 * Prisma model: `HomeSectionTranslation`
 */
export interface IHomeSectionTranslation {
  id: string;
  locale: string;
  name: string;
  homeSectionId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * IHomeSection — a curated, dashboard-manageable homepage rail
 * (e.g. Best Sellers, Chef Recommendations). `key` is the stable,
 * code-facing identifier; `name` is already resolved for one locale.
 * Prisma model: `HomeSection`
 */
export interface IHomeSection {
  id: string;
  key: string;
  name: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * IHomeProduct — a Product enriched for homepage rails: fully loaded
 * (variants, option groups) plus its Category and the Home Sections it
 * belongs to. Returned by every function in src/server/home.ts.
 */
export interface IHomeProduct extends IProductWithOptions {
  category: ICategory;
  homeSections: IHomeSection[];
}
