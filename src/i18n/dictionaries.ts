/**
 * Dictionary loading for Server Components.
 *
 * The locale is read from `next/root-params` rather than drilled through props,
 * so any server component or server-side helper can call `getDictionary()` with
 * no arguments. Root params work in Server Components only — not in Client
 * Components, Server Actions or Route Handlers.
 *
 * Because this runs on the server, dictionary size never reaches the client
 * bundle: only the rendered HTML is sent.
 */

import { locale as localeParam } from "next/root-params";
import { notFound } from "next/navigation";
import { INTL_LOCALES, isLocale, type Locale } from "./config";

const dictionaries = {
  bn: () => import("./dictionaries/bn.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
};

/**
 * Bengali is the source of truth for the key set. If `en.json` drifts — a key
 * added to one file and not the other — this type makes `npm run build` fail
 * rather than rendering `undefined` in production.
 */
export type Dictionary = Awaited<ReturnType<typeof dictionaries.bn>>;

/** The active locale, 404-ing on an unsupported segment. */
export async function getLocale(): Promise<Locale> {
  const value = await localeParam();
  if (!isLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<Dictionary> {
  const locale = await getLocale();
  return dictionaries[locale]();
}

/**
 * Load a specific locale's dictionary. For `generateMetadata` and the root
 * layout, which already receive `params` and should not depend on root params.
 */
export async function getDictionaryFor(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}

/**
 * `format()` lives in `./config` so Client Components can import it too; it is
 * re-exported here because Server Components read everything else from this module.
 */
export { format } from "./config";

/** Locale-aware number formatting — Bengali renders its own digit glyphs. */
export async function formatNumber(value: number): Promise<string> {
  const locale = await getLocale();
  return new Intl.NumberFormat(INTL_LOCALES[locale]).format(value);
}
