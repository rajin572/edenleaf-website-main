import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/CustomUi/Container";
import { Breadcrumb } from "@/components/ui/CustomUi/Breadcrumb";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import CatalogBrowser from "@/components/catalog/CatalogBrowser";
import SubCategoryNav from "@/components/catalog/SubCategoryNav";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { format, isLocale } from "@/i18n/config";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { categoryHref } from "@/service/CatalogService/catalog.constants";
import {
  getCategories,
  getCategoryBySlug,
  getProducts,
} from "@/service/CatalogService/catalogApi";
import { formatCount } from "@/utils/money";

type CategoryParams = {
  params: Promise<{ locale: string; categorySlug: string }>;
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ categorySlug: category.slug }));
}

export async function generateMetadata({
  params,
}: CategoryParams): Promise<Metadata> {
  const { locale, categorySlug } = await params;
  if (!isLocale(locale)) notFound();

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  return buildMetadata({
    // Catalog names stay Bengali in both locales — only the chrome is
    // translated. The root layout's title template appends the site name.
    title: category.name,
    description: category.description,
    path: categoryHref(category.slug),
    locale,
    images: [category.image],
  });
}

export default async function CategoryPage({ params }: CategoryParams) {
  const { categorySlug } = await params;

  const category = await getCategoryBySlug(categorySlug);
  if (!category) notFound();

  const [t, locale, categories, products] = await Promise.all([
    getDictionary(),
    getLocale(),
    getCategories(),
    getProducts({ categorySlug: category.slug }),
  ]);

  const navLinks = categories.map((entry) => ({
    label: entry.name,
    href: categoryHref(entry.slug),
    isActive: entry.slug === category.slug,
  }));

  return (
    <Container className="py-6 md:py-10">
      <Breadcrumb
        label={t.common.breadcrumb}
        items={[{ label: t.common.home, href: "/" }, { label: category.name }]}
      />

      <CatalogHeader
        title={category.name}
        description={category.description}
        image={category.image}
        countLabel={format(t.catalog.productCount, {
          count: formatCount(products.length, locale),
        })}
      />

      <div className="mt-6">
        <SubCategoryNav category={category} allLabel={t.catalog.allProducts} />
      </div>

      <div className="mt-6">
        <CatalogBrowser
          products={products}
          navLinks={navLinks}
          navTitle={t.catalog.categories}
        />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: category.name,
            description: category.description,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: products.length,
              itemListElement: products.map((product, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: product.name,
                url: `/product/${product._id}`,
              })),
            },
          }),
        }}
      />
    </Container>
  );
}
