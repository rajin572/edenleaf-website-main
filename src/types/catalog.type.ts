/**
 * Catalog contracts — products, categories and collections.
 *
 * Mirrors `/api/v1/products` and `/api/v1/categories` (Part 04). Prices are
 * integer poisha end to end, per CODING_RULES §1.4 — `formatPriceFromPoisha`
 * is the only place that converts to a display string.
 */

/** The badge ribbon drawn on a product card. */
export type TProductBadge = "new" | "sale" | "bestsell" | "combo" | "outOfStock";

/** The fixed, admin-curated product sets. Each one is a `/collections/:slug` page. */
export type TCollectionSlug =
  | "combos"
  | "best-sales"
  | "new-arrivals"
  | "featured-products"
  | "offers";

/** Dictionary key under `catalog.collections` — camelCase, unlike the URL slug. */
export type TCollectionKey =
  | "combos"
  | "bestSales"
  | "newArrivals"
  | "featuredProducts"
  | "offers";

export interface ISubCategory {
  _id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ICategory {
  _id: string;
  /** URL segment — ASCII, lowercase, hyphenated. Catalog names stay Bengali. */
  slug: string;
  name: string;
  description: string;
  image: string;
  /** False means the navbar links straight to `/category/:slug` with no dropdown. */
  hasSub: boolean;
  subCategories: ISubCategory[];
}

export interface IProductVariant {
  _id: string;
  productId: string;
  name: string;
  sku: string;
  priceInPoisha: number;
  comparePriceInPoisha?: number;
  stock: number;
  unit: string;
  attributes: Record<string, string>;
  isDefault: boolean;
}

export interface IProduct {
  _id: string;
  name: string;
  /** Kept for SEO copy and the JSON-LD payload; the route key is `_id`. */
  slug: string;
  sku: string;
  description: string;
  /** Full gallery for the detail page. */
  images: string[];
  /** Card image, and the image swapped in on hover. */
  image: string;
  secondaryImage?: string;
  /** Denormalized from the default variant — correct for the card grid; once
   *  a shopper picks a non-default variant, read from that variant instead. */
  priceInPoisha: number;
  comparePriceInPoisha?: number;
  stock: number;
  unit: string;
  avgRating: number;
  reviewCount: number;
  categorySlug: string;
  subCategorySlug?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  variants: IProductVariant[];
  /** ISO 8601 — drives the "latest" sort. */
  createdAt: string;
  openGraph?: { title: string; description: string; image: string; url: string };
  /**
   * Dummy-catalog-only fields — present on `DUMMY_PRODUCTS` (still backing
   * the combos/best-sales/offers collections until Part 05/13 land),
   * undefined on real `/products` responses. Real pages derive a badge/sort
   * instead of reading these directly (see ProductCard's `renderBadge`,
   * CatalogBrowser's "popularity" sort) so nothing here gets faked.
   */
  badge?: TProductBadge;
  collections?: TCollectionSlug[];
  soldCount?: number;
  /** Rich structured data for the product details tab — dummy-only; real
   *  products fall back to the plain `description`. */
  productDetails?: {
    title?: string;
    description?: string;
    keyFeatures?: string[];
    healthBenefits?: string[];
    usageStorage?: string[];
  };
}

export interface IProductReview {
  _id: string;
  productId: string;
  variantId: string;
  reviewer: { name: string };
  rating: number;
  text: string;
  /** Only orders marked delivered can leave one — shown as a badge. */
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A `/collections/:slug` page's own identity: copy key plus banner. */
export interface ICollection {
  slug: TCollectionSlug;
  titleKey: TCollectionKey;
  image: string;
}

export type TCatalogSort =
  | "default"
  | "popularity"
  | "latest"
  | "priceAsc"
  | "priceDesc";

export type TAvailabilityFilter = "all" | "inStock" | "outOfStock";
