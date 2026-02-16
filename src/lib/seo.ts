/**
 * Metadata helpers. Every page's `metadata` / `generateMetadata` should go
 * through `buildMetadata` so canonicals, `hreflang` and Open Graph stay
 * consistent — `metadataBase` is set once in `src/app/[locale]/layout.tsx`.
 */

import type { Metadata } from "next";
import { LOCALES, OG_LOCALES, localizePath, type Locale } from "@/i18n/config";

interface BuildMetadataInput {
  title: string;
  description: string;
  /** Path WITHOUT the locale prefix, e.g. `/shop`. */
  path: string;
  locale: Locale;
  images?: string[];
  /** Keep the page out of search results — cart, checkout, account, auth. */
  noIndex?: boolean;
  type?: "website" | "article";
}

/**
 * Builds the alternates block: a canonical for this locale plus an `hreflang`
 * entry per language, which is how search engines learn that `/bn/shop` and
 * `/en/shop` are the same page in different languages.
 */
const alternatesFor = (path: string, locale: Locale) => ({
  canonical: localizePath(path, locale),
  languages: Object.fromEntries(
    LOCALES.map((code) => [code, localizePath(path, code)])
  ) as Record<Locale, string>,
});

export const buildMetadata = ({
  title,
  description,
  path,
  locale,
  images,
  noIndex = false,
  type = "website",
}: BuildMetadataInput): Metadata => ({
  title,
  description,
  alternates: alternatesFor(path, locale),
  ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  openGraph: {
    type,
    locale: OG_LOCALES[locale],
    url: localizePath(path, locale),
    title,
    description,
    ...(images?.length ? { images } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    ...(images?.length ? { images } : {}),
  },
});

/** Escapes a JSON-LD payload for safe embedding in a <script> tag. */
export const jsonLd = (data: Record<string, unknown>) =>
  JSON.stringify(data).replace(/</g, "\\u003c");
