"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import LocaleLink from "@/components/i18n/LocaleLink";
import { ChevronDown, Filter, LayoutGrid, List, PackageSearch } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import { EmptyState } from "@/components/ui/CustomUi/EmptyState";
import ReusablePagination from "@/components/ui/CustomUi/ReusablePagination";
import { useDictionary } from "@/components/i18n/DictionaryProvider";
import { format } from "@/i18n/config";
import { productHref } from "@/service/CatalogService/catalog.constants";
import { formatCount, formatPriceFromPoisha, fromPoisha, toPoisha } from "@/utils/money";
import { useCartStore } from "@/store/cartStore";
import { useServerCartStore } from "@/store/serverCartStore";
import useAuthUser from "@/hooks/useAuthUser";
import type { IProduct, TAvailabilityFilter, TCatalogSort } from "@/types";

const PAGE_SIZE = 12;

const SORT_OPTIONS: TCatalogSort[] = [
  "default",
  "popularity",
  "latest",
  "priceAsc",
  "priceDesc",
];

interface CatalogBrowserProps {
  products: IProduct[];
  /** Sidebar route links (sub-categories, or sibling categories). Not filters. */
  navLinks?: { label: string; href: string; isActive?: boolean }[];
  /** Heading above `navLinks`. */
  navTitle?: string;
}

const sortProducts = (products: IProduct[], sort: TCatalogSort): IProduct[] => {
  if (sort === "default") return products;

  const sorted = [...products];
  switch (sort) {
    case "popularity":
      // `soldCount` is dummy-catalog-only — real products have none yet
      // (Part 13's sales aggregation), so this is a stable no-op for them
      // rather than a faked substitute metric.
      return sorted.sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0));
    case "latest":
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "priceAsc":
      return sorted.sort((a, b) => a.priceInPoisha - b.priceInPoisha);
    case "priceDesc":
      return sorted.sort((a, b) => b.priceInPoisha - a.priceInPoisha);
  }
};

/**
 * The body shared by `/collections/:slug`, `/category/:slug` and
 * `/category/:slug/:subSlug`, so the three route families behave identically.
 *
 * Sorting and the price/stock filters run on the client over the server-rendered
 * page of products. When `/products` lands they move into the query string so
 * each filtered view is its own indexable URL.
 */
const CatalogBrowser = ({ products, navLinks, navTitle }: CatalogBrowserProps) => {
  const { dict: t, locale } = useDictionary();
  const user = useAuthUser();
  const addToCart = useCartStore((state) => state.addToCart);
  const addServerItem = useServerCartStore((s) => s.addItem);

  const priceCeiling = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.ceil(Math.max(...products.map((p) => fromPoisha(p.priceInPoisha))) / 100) * 100;
  }, [products]);

  const [sort, setSort] = useState<TCatalogSort>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [availability, setAvailability] = useState<TAvailabilityFilter>("all");
  const [page, setPage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);
  const count = (value: number) => formatCount(value, locale);

  const isFiltered = maxPrice < priceCeiling || availability !== "all";

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      if (fromPoisha(product.priceInPoisha) > maxPrice) return false;
      if (availability === "inStock" && product.stock <= 0) return false;
      if (availability === "outOfStock" && product.stock > 0) return false;
      return true;
    });

    return sortProducts(filtered, sort);
  }, [products, maxPrice, availability, sort]);

  const total = visibleProducts.length;
  const pageProducts = visibleProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /** Any filter or sort change invalidates the current page offset. */
  const resetPage = () => setPage(1);

  const clearFilters = () => {
    setMaxPrice(priceCeiling);
    setAvailability("all");
    setSort("default");
    resetPage();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <button
        type="button"
        onClick={() => setIsFilterOpen((open) => !open)}
        className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-card border border-border rounded-md font-semibold text-foreground"
      >
        <Filter size={18} /> {t.common.filters}
      </button>

      {/* Sidebar */}
      <aside
        className={`lg:w-1/4 shrink-0 ${isFilterOpen ? "block" : "hidden lg:block"}`}
      >
        <div className="bg-card border border-border rounded-lg p-5 lg:sticky lg:top-32.5">
          {navLinks && navLinks.length > 0 && (
            <div className="mb-8">
              <h2 className="font-bold text-foreground mb-4 pb-2 border-b border-border">
                {navTitle ?? t.catalog.categories}
              </h2>
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <LocaleLink
                      href={link.href}
                      aria-current={link.isActive ? "page" : undefined}
                      className={`block rounded px-2 py-1.5 text-sm transition-colors hover:bg-muted hover:text-primary ${
                        link.isActive
                          ? "bg-muted font-semibold text-primary"
                          : "text-text-secondary"
                      }`}
                    >
                      {link.label}
                    </LocaleLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-8">
            <h2 className="font-bold text-foreground mb-4 pb-2 border-b border-border">
              {t.catalog.filterByPrice}
            </h2>
            <input
              type="range"
              min={0}
              max={priceCeiling}
              step={50}
              value={maxPrice}
              aria-label={t.catalog.filterByPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value));
                resetPage();
              }}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="mt-3 text-sm text-text-secondary">
              {format(t.catalog.priceUpTo, { price: price(toPoisha(maxPrice)) })}
            </p>
          </div>

          <div>
            <h2 className="font-bold text-foreground mb-4 pb-2 border-b border-border">
              {t.catalog.availability}
            </h2>
            <ul className="space-y-3">
              {(
                [
                  ["all", t.catalog.allProducts],
                  ["inStock", t.common.inStock],
                  ["outOfStock", t.common.outOfStock],
                ] as [TAvailabilityFilter, string][]
              ).map(([value, label]) => (
                <li key={value}>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-text-secondary hover:text-primary transition-colors">
                    <input
                      type="radio"
                      name="availability"
                      className="accent-primary"
                      checked={availability === value}
                      onChange={() => {
                        setAvailability(value);
                        resetPage();
                      }}
                    />
                    {label}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 w-full rounded-md border border-border py-2 text-sm font-semibold text-primary transition-colors hover:bg-muted"
            >
              {t.catalog.clearFilters}
            </button>
          )}
        </div>
      </aside>

      {/* Results */}
      <div className="lg:w-3/4">
        <div className="flex flex-col sm:flex-row justify-between items-center bg-card border border-border rounded-lg p-3 mb-6 gap-4">
          <p className="text-sm text-text-secondary">
            {total === 0
              ? format(t.catalog.productCount, { count: count(0) })
              : format(t.catalog.showingResults, {
                  first: count((page - 1) * PAGE_SIZE + 1),
                  last: count(Math.min(page * PAGE_SIZE, total)),
                  total: count(total),
                })}
          </p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="catalog-sort" className="text-text-secondary">
                {t.catalog.sortBy}
              </label>
              <div className="relative">
                <select
                  id="catalog-sort"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as TCatalogSort);
                    resetPage();
                  }}
                  className="appearance-none bg-background border border-border rounded-md pl-3 pr-8 py-1.5 text-sm font-medium outline-none focus:border-primary"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {t.catalog.sort[option]}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary"
                />
              </div>
            </div>

            <div className="hidden sm:flex border border-border rounded-md overflow-hidden">
              <button
                type="button"
                aria-label={t.catalog.gridView}
                aria-pressed={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                className={`p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-text-secondary hover:text-primary"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                type="button"
                aria-label={t.catalog.listView}
                aria-pressed={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={`p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-text-secondary hover:text-primary"
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {total === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title={t.catalog.noProducts}
            description={t.catalog.noProductsHint}
            action={
              isFiltered
                ? { label: t.catalog.clearFilters, onClick: clearFilters }
                : undefined
            }
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
                : "flex flex-col gap-4"
            }
          >
            {pageProducts.map((product) =>
              viewMode === "grid" ? (
                <ProductCard key={product._id} product={product} showBadge />
              ) : (
                <article
                  key={product._id}
                  className="flex gap-4 border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow"
                >
                  <LocaleLink
                    href={productHref(product._id)}
                    className="w-32 md:w-48 aspect-square relative rounded-md overflow-hidden shrink-0"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 128px, 192px"
                      className="object-cover"
                    />
                  </LocaleLink>
                  <div className="flex flex-col justify-center grow min-w-0">
                    <LocaleLink
                      href={productHref(product._id)}
                      className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2 mb-2"
                    >
                      {product.name}
                    </LocaleLink>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xl font-bold text-primary">
                        {price(product.priceInPoisha)}
                      </span>
                      {!!product.comparePriceInPoisha && product.comparePriceInPoisha > product.priceInPoisha && (
                        <span className="text-sm text-muted-foreground line-through">
                          {price(product.comparePriceInPoisha)}
                        </span>
                      )}
                    </div>
                    <p className="hidden md:block text-sm text-text-secondary mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <button
                      type="button"
                      disabled={product.stock <= 0}
                      onClick={async () => {
                        const variant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
                        if (user) {
                          const ok = await addServerItem(variant._id, 1);
                          if (ok) toast.success(t.common.addedToCart);
                          else toast.error(t.common.addToCartFailed);
                          return;
                        }
                        addToCart({
                          productId: product._id,
                          variantId: variant._id,
                          variantName: variant.name,
                          name: product.name,
                          price: fromPoisha(product.priceInPoisha),
                          image: product.image,
                          quantity: 1,
                          stock: product.stock,
                        });
                        toast.success(t.common.addedToCart);
                      }}
                      className="w-max px-6 py-2 bg-primary hover:bg-primary-dark text-primary-foreground rounded font-medium transition-colors text-sm disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                    >
                      {product.stock > 0 ? t.common.addToCart : t.common.outOfStock}
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}

        {total > PAGE_SIZE && (
          <div className="mt-12">
            <ReusablePagination
              currentPage={page}
              setCurrentPage={setPage}
              limit={PAGE_SIZE}
              total={total}
              previousText={t.common.previous}
              nextText={t.common.next}
              formatNumber={count}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogBrowser;
