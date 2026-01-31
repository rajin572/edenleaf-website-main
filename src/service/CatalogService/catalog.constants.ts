/**
 * The collection route set.
 *
 * Unlike products and categories this is NOT dummy data — the five slugs are
 * the actual `/collections/:collectionSlug` URLs, wired to the navbar, the hero
 * CTA and every homepage "View All". A product joins a collection through its
 * `collections` array; the admin flags it, the storefront never derives it.
 */

import type { ICollection, TCollectionSlug } from "@/types";

export const COLLECTIONS: ICollection[] = [
  {
    slug: "combos",
    titleKey: "combos",
    image: "https://loremflickr.com/1200/400/spices,basket/all?lock=901",
  },
  {
    slug: "best-sales",
    titleKey: "bestSales",
    image: "https://loremflickr.com/1200/400/honey,jar/all?lock=902",
  },
  {
    slug: "new-arrivals",
    titleKey: "newArrivals",
    image: "https://loremflickr.com/1200/400/grocery,shelf/all?lock=903",
  },
  {
    slug: "featured-products",
    titleKey: "featuredProducts",
    image: "https://loremflickr.com/1200/400/organic,food/all?lock=904",
  },
  {
    slug: "offers",
    titleKey: "offers",
    image: "https://loremflickr.com/1200/400/market,sale/all?lock=905",
  },
];

export const COLLECTION_SLUGS = COLLECTIONS.map((c) => c.slug);

export const findCollection = (slug: string): ICollection | undefined =>
  COLLECTIONS.find((collection) => collection.slug === slug);

export const isCollectionSlug = (value: string): value is TCollectionSlug =>
  COLLECTION_SLUGS.includes(value as TCollectionSlug);

/** Where a collection's "View All" lives. Used by the homepage rows and the navbar. */
export const collectionHref = (slug: TCollectionSlug) => `/collections/${slug}`;

/** `/category/:categorySlug` or `/category/:categorySlug/:subCategorySlug`. */
export const categoryHref = (categorySlug: string, subCategorySlug?: string) =>
  subCategorySlug
    ? `/category/${categorySlug}/${subCategorySlug}`
    : `/category/${categorySlug}`;

/** The detail route is keyed on the product id, not the slug. */
export const productHref = (productId: string) => `/product/${productId}`;

/** The combo detail route is keyed on its slug (combos have no separate id-based route). */
export const comboHref = (slug: string) => `/combo/${slug}`;
