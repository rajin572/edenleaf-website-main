import Image from "next/image";

interface CatalogHeaderProps {
  title: string;
  description?: string;
  /** Banner behind the title. Falls back to a flat tinted panel when absent. */
  image?: string;
  /** Pre-formatted, locale-aware — e.g. "১২ টি পণ্য" / "12 products". */
  countLabel: string;
}

/**
 * The band at the top of every collection, category and sub-category page.
 * Server-rendered so the heading and copy are in the first byte for crawlers.
 */
const CatalogHeader = ({
  title,
  description,
  image,
  countLabel,
}: CatalogHeaderProps) => (
  <section className="relative overflow-hidden rounded-xl border border-border bg-secondary">
    {image && (
      <>
        <Image
          src={image}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 1550px) 100vw, 1550px"
          className="object-cover opacity-35"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/85 to-secondary/40" />
      </>
    )}

    <div className="relative px-6 py-8 md:px-10 md:py-12">
      <h1 className="text-2xl md:text-4xl font-bold text-secondary-foreground">
        {title}
      </h1>

      {description && (
        <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-secondary-foreground/75">
          {description}
        </p>
      )}

      <span className="mt-5 inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-xs md:text-sm font-semibold text-primary-foreground">
        {countLabel}
      </span>
    </div>
  </section>
);

export default CatalogHeader;
