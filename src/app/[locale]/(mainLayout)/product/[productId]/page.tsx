import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import LocaleLink from "@/components/i18n/LocaleLink";
import Container from "@/components/ui/CustomUi/Container";
import { Breadcrumb, type IBreadcrumbItem } from "@/components/ui/CustomUi/Breadcrumb";
import { SocialShareBar } from "@/components/ui/CustomUi/SocialShareBar";
import ProductGallery from "@/components/product/ProductGallery";
import ProductBuyPanel from "@/components/product/ProductBuyPanel";
import ProductTabs from "@/components/product/ProductTabs";
import ProductSection from "@/components/home/ProductSection";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { format, isLocale, localizePath } from "@/i18n/config";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/helpers/config/envConfig";
import {
  categoryHref,
  productHref,
} from "@/service/CatalogService/catalog.constants";
import {
  getCategoryBySlug,
  getProductById,
  getProductReviews,
  getProducts,
  getRelatedProducts,
} from "@/service/CatalogService/catalogApi";
import { formatCount, formatPriceFromPoisha, fromPoisha } from "@/utils/money";

type ProductParams = {
  params: Promise<{ locale: string; productId: string }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ productId: product._id }));
}

export async function generateMetadata({
  params,
}: ProductParams): Promise<Metadata> {
  const { locale, productId } = await params;
  if (!isLocale(locale)) notFound();

  const product = await getProductById(productId);
  if (!product) notFound();

  return buildMetadata({
    // Catalog copy is Bengali in both locales by design (CODING_RULES §2.6).
    // The root layout's title template appends the site name.
    // The backend derives `openGraph` server-side once wired to real
    // products — prefer it so a future backend-side OG change (e.g. a
    // dedicated marketing description) doesn't require a website deploy.
    title: product.openGraph?.title ?? product.name,
    description: product.openGraph?.description ?? product.description,
    path: productHref(product._id),
    locale,
    images: product.openGraph?.image ? [product.openGraph.image] : product.images,
    type: "article",
  });
}

export default async function ProductDetailsPage({ params }: ProductParams) {
  const { productId } = await params;

  const product = await getProductById(productId);
  if (!product) notFound();

  const [t, locale, category, reviews, related] = await Promise.all([
    getDictionary(),
    getLocale(),
    getCategoryBySlug(product.categorySlug),
    getProductReviews(product._id),
    getRelatedProducts(product),
  ]);

  const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);
  const count = (value: number) => formatCount(value, locale);

  const subCategory = category?.subCategories.find(
    (sub) => sub.slug === product.subCategorySlug
  );

  const breadcrumb: IBreadcrumbItem[] = [
    { label: t.common.home, href: "/" },
    ...(category
      ? [{ label: category.name, href: categoryHref(category.slug) }]
      : []),
    ...(category && subCategory
      ? [
        {
          label: subCategory.name,
          href: categoryHref(category.slug, subCategory.slug),
        },
      ]
      : []),
    { label: product.name },
  ];

  const isOutOfStock = product.stock <= 0;
  const shareUrl = `${getSiteUrl()}${localizePath(productHref(product._id), locale)}`;

  return (
    <section>

      <Container className="py-6 md:py-10">
        <Breadcrumb label={t.common.breadcrumb} items={breadcrumb} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          <ProductGallery images={product.images} name={product.name} />

          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-0.5 text-warning">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    fill={index < Math.floor(product.avgRating) ? "currentColor" : "none"}
                  />
                ))}
              </div>
              <span className="text-sm text-text-secondary">
                {format(t.product.reviewCount, { count: count(product.reviewCount) })}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                {price(product.priceInPoisha)}
              </span>
              {!!product.comparePriceInPoisha && product.comparePriceInPoisha > product.priceInPoisha && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {price(product.comparePriceInPoisha)}
                  </span>
                  <span className="bg-success/10 text-success text-xs font-bold px-2 py-1 rounded">
                    {t.product.save} {price(product.comparePriceInPoisha - product.priceInPoisha)}
                  </span>
                </>
              )}
            </div>

            <p className="text-text-secondary mb-6 leading-relaxed">
              {product.description}
            </p>

            <ProductBuyPanel product={product} />

            <div className="border-t border-border mt-6 pt-6 flex flex-col gap-2 text-sm">
              <div className="flex gap-2">
                <span className="w-28 shrink-0 text-text-secondary">{t.product.sku}</span>
                <span className="font-medium">{product.sku}</span>
              </div>
              {category && (
                <div className="flex gap-2">
                  <span className="w-28 shrink-0 text-text-secondary">
                    {t.product.category}
                  </span>
                  <LocaleLink
                    href={categoryHref(category.slug)}
                    className="font-medium text-primary hover:underline"
                  >
                    {category.name}
                  </LocaleLink>
                </div>
              )}
              <div className="flex gap-2">
                <span className="w-28 shrink-0 text-text-secondary">
                  {t.product.availability}
                </span>
                <span
                  className={`font-medium ${isOutOfStock ? "text-destructive" : "text-success"}`}
                >
                  {isOutOfStock
                    ? t.common.outOfStock
                    : format(t.product.unitsInStock, { count: count(product.stock) })}
                </span>
              </div>

              <div className="mt-4">
                <SocialShareBar url={shareUrl} title={product.name} />
              </div>
            </div>
          </div>
        </div>

        <ProductTabs product={product} reviews={reviews} />
      </Container>

      {related.length > 0 && (
        <ProductSection title={t.product.relatedProducts} products={related} />
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.images,
            sku: product.sku,
            ...(category ? { category: category.name } : {}),
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.avgRating,
              reviewCount: product.reviewCount,
            },
            offers: {
              "@type": "Offer",
              price: fromPoisha(product.priceInPoisha),
              priceCurrency: "BDT",
              url: shareUrl,
              availability: isOutOfStock
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            },
          }),
        }}
      />
    </section>

  );
}
