import { INTL_LOCALES, type Locale } from "@/i18n/config";

export const toPoisha = (taka: number): number => {
  return Math.round(taka * 100);
};

export const fromPoisha = (poisha: number): number => {
  return poisha / 100;
};

export const formatMoney = (poisha: number): string => {
  const taka = fromPoisha(poisha);
  return `৳${taka.toLocaleString('en-BD')}`;
};

/**
 * Render a taka amount for the active locale — Bengali gets its own digits
 * (৳১,২৫০), English gets Latin ones (৳1,250).
 *
 * The symbol is passed in from `t.common.currency` rather than baked in, and
 * the number itself always goes through `Intl` (CODING_RULES §2.6). We prefix
 * it manually because CLDR suffixes the taka sign for `bn-BD` (`১,২৫০৳`),
 * which is not how Bangladeshi storefronts price things.
 */
export const formatPrice = (
  taka: number,
  locale: Locale,
  currency: string
): string => `${currency}${new Intl.NumberFormat(INTL_LOCALES[locale]).format(taka)}`;

/**
 * Same as `formatPrice`, but takes poisha — for the product catalog (Part 04),
 * which is now integer-poisha end to end. Cart/checkout still pass taka
 * straight to `formatPrice` (Part 06/08 haven't moved to poisha yet), so this
 * stays a separate function rather than changing `formatPrice`'s own contract
 * and silently corrupting every still-taka caller.
 */
export const formatPriceFromPoisha = (
  poisha: number,
  locale: Locale,
  currency: string
): string => formatPrice(fromPoisha(poisha), locale, currency);

/** Locale-aware plain number — result counts, review counts, stock. */
export const formatCount = (value: number, locale: Locale): string =>
  new Intl.NumberFormat(INTL_LOCALES[locale]).format(value);
