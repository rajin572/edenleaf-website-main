import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Container from "@/components/ui/CustomUi/Container";
import { Breadcrumb } from "@/components/ui/CustomUi/Breadcrumb";
import LocaleLink from "@/components/i18n/LocaleLink";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { isLocale } from "@/i18n/config";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/helpers/config/envConfig";
import { productHref, comboHref } from "@/service/CatalogService/catalog.constants";
import { getComboBySlug } from "@/service/CatalogService/catalogApi";
import { formatPriceFromPoisha } from "@/utils/money";

type ComboParams = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: ComboParams): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const combo = await getComboBySlug(slug);
  if (!combo) notFound();

  return buildMetadata({
    title: combo.name,
    description: combo.description,
    path: comboHref(combo.slug),
    locale,
    images: [combo.image],
    type: "article",
  });
}

export default async function ComboDetailPage({ params }: ComboParams) {
  const { slug } = await params;

  const combo = await getComboBySlug(slug);
  if (!combo) notFound();

  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);
  const shareUrl = `${getSiteUrl()}${comboHref(combo.slug)}`;

  return (
    <section>
      <Container className="py-6 md:py-10">
        <Breadcrumb
          label={t.common.breadcrumb}
          items={[
            { label: t.common.home, href: "/" },
            { label: t.catalog.collections.combos.title, href: "/collections/combos" },
            { label: combo.name },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-background border border-border">
            <Image src={combo.image} alt={combo.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            {!combo.available && (
              <span className="absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm bg-destructive">
                {t.combo.unavailable}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{combo.name}</h1>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-primary">{price(combo.comboPriceInPoisha)}</span>
              <span className="text-lg text-muted-foreground line-through">{price(combo.regularPriceInPoisha)}</span>
              <span className="bg-success/10 text-success text-xs font-bold px-2 py-1 rounded">
                {t.combo.youSave} {price(combo.savingsInPoisha)}
              </span>
            </div>

            {combo.description && (
              <p className="text-text-secondary mb-6 leading-relaxed">{combo.description}</p>
            )}

            <div className="border-t border-border pt-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">{t.combo.components}</h2>
              <div className="space-y-3">
                {combo.components.map((component) => (
                  <div
                    key={component.variantId}
                    className="flex items-center gap-4 border border-border rounded-lg p-3"
                  >
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-background shrink-0">
                      <Image src={component.product.image} alt={component.product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{component.product.name}</p>
                      <p className="text-xs text-text-secondary">
                        {component.variant.name !== "Default" ? `${component.variant.name} · ` : ""}
                        {t.product.quantity}: {component.quantity}
                      </p>
                    </div>
                    <LocaleLink
                      href={productHref(component.product._id)}
                      className="shrink-0 px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-md text-sm font-semibold transition-colors"
                    >
                      {t.combo.viewProduct}
                    </LocaleLink>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            name: combo.name,
            description: combo.description,
            image: [combo.image],
            offers: {
              "@type": "Offer",
              price: combo.comboPriceInPoisha / 100,
              priceCurrency: "BDT",
              url: shareUrl,
              availability: combo.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />
    </section>
  );
}
