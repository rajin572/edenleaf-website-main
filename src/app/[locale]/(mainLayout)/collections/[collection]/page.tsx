import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/ui/CustomUi/Container";
import { Breadcrumb } from "@/components/ui/CustomUi/Breadcrumb";
import CatalogHeader from "@/components/catalog/CatalogHeader";
import CatalogBrowser from "@/components/catalog/CatalogBrowser";
import { getDictionary, getDictionaryFor, getLocale } from "@/i18n/dictionaries";
import { format, isLocale } from "@/i18n/config";
import { buildMetadata, jsonLd } from "@/lib/seo";
import {
  COLLECTIONS,
  collectionHref,
  comboHref,
  findCollection,
} from "@/service/CatalogService/catalog.constants";
import { getCombos, getProducts } from "@/service/CatalogService/catalogApi";
import { formatCount } from "@/utils/money";
import ComboCard from "@/components/shared/ComboCard";

type CollectionParams = {
  params: Promise<{ locale: string; collection: string }>;
};

/** The five collection slugs are fixed, so prerender all of them per locale. */
export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ collection: collection.slug }));
}

export async function generateMetadata({
  params,
}: CollectionParams): Promise<Metadata> {
  const { locale, collection: slug } = await params;
  if (!isLocale(locale)) notFound();

  const collection = findCollection(slug);
  if (!collection) notFound();

  const dict = await getDictionaryFor(locale);
  const copy = dict.catalog.collections[collection.titleKey];

  return buildMetadata({
    title: copy.title,
    description: copy.description,
    path: collectionHref(collection.slug),
    locale,
    images: [collection.image],
  });
}

export default async function CollectionPage({ params }: CollectionParams) {
  const { collection: slug } = await params;

  const collection = findCollection(slug);
  if (!collection) notFound();

  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const copy = t.catalog.collections[collection.titleKey];

  const navLinks = COLLECTIONS.map((entry) => ({
    label: t.catalog.collections[entry.titleKey].title,
    href: collectionHref(entry.slug),
    isActive: entry.slug === collection.slug,
  }));

  // Combos have no `stock`/single `priceInPoisha`/`variants` — ProductCard
  // hard-assumes those, so this is its own grid, not CatalogBrowser.
  if (collection.slug === "combos") {
    const combos = await getCombos();

    return (
      <Container className="py-6 md:py-10">
        <Breadcrumb
          label={t.common.breadcrumb}
          items={[{ label: t.common.home, href: "/" }, { label: copy.title }]}
        />

        <CatalogHeader
          title={copy.title}
          description={copy.description}
          image={collection.image}
          countLabel={format(t.catalog.productCount, {
            count: formatCount(combos.length, locale),
          })}
        />

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {combos.map((combo) => (
            <ComboCard key={combo._id} combo={combo} />
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLd({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: copy.title,
              description: copy.description,
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: combos.length,
                itemListElement: combos.map((combo, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: combo.name,
                  url: comboHref(combo.slug),
                })),
              },
            }),
          }}
        />
      </Container>
    );
  }

  const products = await getProducts({ collection: collection.slug });

  return (
    <Container className="py-6 md:py-10">
      <Breadcrumb
        label={t.common.breadcrumb}
        items={[{ label: t.common.home, href: "/" }, { label: copy.title }]}
      />

      <CatalogHeader
        title={copy.title}
        description={copy.description}
        image={collection.image}
        countLabel={format(t.catalog.productCount, {
          count: formatCount(products.length, locale),
        })}
      />

      <div className="mt-8">
        <CatalogBrowser
          products={products}
          navLinks={navLinks}
          navTitle={t.catalog.collectionsNav}
        />
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: copy.title,
            description: copy.description,
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
