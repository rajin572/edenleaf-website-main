"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { DEFAULT_LOCALE, LOCALES, localizePath, type Locale } from "@/i18n/config";

/** The locale from the current URL. Client-side counterpart to `getLocale()`. */
export function useCurrentLocale(): Locale {
  const pathname = usePathname();
  const segment = pathname.split("/")[1];
  return (LOCALES as readonly string[]).includes(segment)
    ? (segment as Locale)
    : DEFAULT_LOCALE;
}

type LocaleLinkProps = React.ComponentProps<typeof Link>;

/**
 * `next/link` that keeps the visitor inside their language.
 *
 * Use it for every internal link: a bare `/shop` would bounce through the
 * proxy's redirect on each navigation, and could drop an English visitor back
 * into Bengali. External and hash links pass through untouched.
 */
const LocaleLink = ({ href, ...rest }: LocaleLinkProps) => {
  const locale = useCurrentLocale();

  const localizedHref =
    typeof href === "string" && href.startsWith("/")
      ? localizePath(href, locale)
      : href;

  return <Link href={localizedHref} {...rest} />;
};

export default LocaleLink;
