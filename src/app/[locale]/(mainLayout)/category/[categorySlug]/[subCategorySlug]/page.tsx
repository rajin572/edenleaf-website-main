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
import type { ICategory, ISubCategory } from "@/types";

type SubCategoryParams = {
  params: Promise<{
    locale: string;
    categorySlug: string;
    subCategorySlug: string;
  }>;
};

/** A sub-category slug only resolves under its own parent — never cross-category. */
const resolve = async (
  categorySlug: string,
  subCategorySlug: string
): Promise<{ category: ICategory; subCategory: ISubCategory }> => {
  const category = await getCategoryBySlug(categorySlug);
  const subCategory = category?.subCategories.find(
    (sub) => sub.slug === subCategorySlug
  );

  if (!category || !subCategory) notFound();
  return { category, subCategory };
};

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.flatMap((category) =>
    category.subCategories.map((sub) => ({
      categorySlug: category.slug,
      subCategorySlug: sub.slug,
    }))
  );
}

export async function generateMetadata({
  params,
}: SubCategoryParams): Promise<Metadata> {
  const { locale, categorySlug, subCategorySlug } = await params;
  if (!isLocale(locale)) notFound();

  const { category, subCategory } = await resolve(categorySlug, subCategorySlug);

  return buildMetadata({
    // The root layout's title template appends the site name.
    title: `${subCategory.name} — ${category.name}`,
    description: subCategory.description,
    path: categoryHref(category.slug, subCategory.slug),
    locale,
    images: [category.image],
  });
}

export default async function SubCategoryPage({ params }: SubCategoryParams) {
  const { categorySlug, subCategorySlug } = await params;

  const { category, subCategory } = await resolve(categorySlug, subCategorySlug);

  const [t, locale, categories, products] = await Promise.all([
    getDictionary(),
    getLocale(),
    getCategories(),
    getProducts({
      categorySlug: category.slug,
      subCategorySlug: subCategory.slug,
    }),
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
        items={[
          { label: t.common.home, href: "/" },
          { label: category.name, href: categoryHref(category.slug) },
          { label: subCategory.name },
        ]}
      />

      <CatalogHeader
        title={subCategory.name}
        description={subCategory.description}
        image={category.image}
        countLabel={format(t.catalog.productCount, {
          count: formatCount(products.length, locale),
        })}
      />

      <div className="mt-6">
        <SubCategoryNav
          category={category}
          activeSubCategorySlug={subCategory.slug}
          allLabel={t.catalog.allProducts}
        />
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
            name: subCategory.name,
            description: subCategory.description,
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
