/**
 * Catalog reads for Server Components and `generateMetadata`.
 *
 * SERVER ONLY — it reaches `serverFetch`, which imports `next/headers`.
 * Client components receive catalog data as props from their server parent
 * (see `(mainLayout)/layout.tsx` handing the category tree to `Header`).
 *
 * Category and Product are both wired to the real backend (Parts 02 and 04).
 * "offers" is real too: `GET /products?hasOffer=true` (products whose default
 * variant has a compare price above its price). Only "best-sales" stays on the
 * dummy catalog when read through `getProducts()` — combos aren't Products at
 * all (Part 05's own module). The homepage's own Best Sellers row reads real
 * DELIVERED-order aggregation via `getHomepage()` below, not
 * `getProducts({collection:'best-sales'})` — the standalone
 * `/collections/best-sales` listing page still uses the dummy filter.
 */

import { apiGet } from "@/lib/serverFetch";
import TagTypes from "@/helpers/TagTypes";
import { DUMMY_PRODUCTS } from "./catalog.dummy";
import type { BannerPlacement, IBanner, ICategory, ICombo, IHomepageData, IMeta, IProduct, IProductReview, TCollectionSlug } from "@/types";

export interface ProductFilter {
  collection?: TCollectionSlug;
  categorySlug?: string;
  subCategorySlug?: string;
}

// "combos" is deliberately excluded here — the collections page never calls
// getProducts({collection:"combos"}), it branches to real getCombos() before
// reaching this function (combos aren't Products at all, Part 05's own module).
const DUMMY_ONLY_COLLECTIONS: TCollectionSlug[] = ["best-sales"];

export async function getCategories(): Promise<ICategory[]> {
  const res = await apiGet<ICategory[]>("/categories", {
    query: { limit: 100 },
    tags: [TagTypes.categories],
    revalidate: 600,
  });
  return res.data ?? [];
}

/** GET /homepage — public aggregation (banners/categories/best sellers/new
 *  arrivals/featured/combos). Only `bestSellers` and the featured-category
 *  fields are consumed here; the rest stay driven by their own accessors to
 *  avoid two competing data paths for the same product lists. */
export async function getHomepage(): Promise<IHomepageData> {
  const res = await apiGet<IHomepageData>("/homepage", {
    tags: [TagTypes.homepage],
    revalidate: 60, // matches the backend's own Cache-Control: max-age=60
  });
  return res.data ?? { showFeaturedCategories: false, activeCategoryCount: 0, featuredCategories: [], bestSellers: [] };
}

export async function getCategoryBySlug(
  slug: string
): Promise<ICategory | undefined> {
  const res = await apiGet<ICategory>(`/categories/${slug}`, {
    tags: [TagTypes.categories],
    revalidate: 600,
  });
  return res.data ?? undefined;
}

export async function getProducts(
  filter: ProductFilter = {}
): Promise<IProduct[]> {
  if (filter.collection && DUMMY_ONLY_COLLECTIONS.includes(filter.collection)) {
    return DUMMY_PRODUCTS.filter((product) => product.collections?.includes(filter.collection!));
  }

  const res = await apiGet<IProduct[]>("/products", {
    query: {
      categorySlug: filter.categorySlug,
      subCategorySlug: filter.subCategorySlug,
      isFeatured: filter.collection === "featured-products" ? true : undefined,
      isNewArrival: filter.collection === "new-arrivals" ? true : undefined,
      hasOffer: filter.collection === "offers" ? true : undefined,
      limit: 100,
    },
    tags: [TagTypes.products],
    revalidate: 300,
  });
  return res.data ?? [];
}

export async function getProductById(
  productId: string
): Promise<IProduct | undefined> {
  const res = await apiGet<IProduct>(`/products/${productId}`, {
    tags: [TagTypes.products, `product:${productId}`],
    revalidate: 300,
  });
  return res.data ?? undefined;
}

export async function getProductReviews(
  productId: string
): Promise<IProductReview[]> {
  const res = await apiGet<{ data: IProductReview[]; meta: IMeta }>("/reviews", {
    query: { productId, limit: 20, sort: "-createdAt" },
    tags: [TagTypes.products],
    revalidate: 300,
  });
  return res.data?.data ?? [];
}

/** Same category, current product excluded — the detail page's cross-sell row. */
export async function getRelatedProducts(
  product: IProduct,
  limit = 5
): Promise<IProduct[]> {
  const res = await apiGet<IProduct[]>(`/products/${product._id}/related`, {
    query: { limit },
    tags: [TagTypes.products],
    revalidate: 300,
  });
  return res.data ?? [];
}

export async function getCombos(): Promise<ICombo[]> {
  const res = await apiGet<ICombo[]>("/combos", {
    query: { limit: 50 },
    tags: [TagTypes.combos],
    revalidate: 60,
  });
  return res.data ?? [];
}

export async function getComboBySlug(slug: string): Promise<ICombo | undefined> {
  const res = await apiGet<ICombo>(`/combos/${slug}`, {
    tags: [TagTypes.combos],
    revalidate: 60,
  });
  return res.data ?? undefined;
}

export async function getBanners(options: { placement?: BannerPlacement; limit?: number } = {}): Promise<IBanner[]> {
  const res = await apiGet<IBanner[]>("/banners", {
    query: { limit: options.limit ?? 20, placement: options.placement },
    tags: [TagTypes.banners],
    revalidate: 60,
  });
  return res.data ?? [];
}
