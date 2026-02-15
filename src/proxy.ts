/**
 * Locale routing.
 *
 * `proxy.ts` is Next 16's replacement for `middleware.ts` — same position in
 * the request lifecycle, new file convention.
 *
 * Any request without a locale prefix is redirected to one, picked from the
 * visitor's saved choice and then their `Accept-Language` header. Both locales
 * are always in the URL (`/bn/shop`, `/en/shop`) so each language has its own
 * indexable address.
 */

import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES, LOCALE_COOKIE, isLocale, type Locale } from "@/i18n/config";

const detectLocale = (request: NextRequest): Locale => {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  // e.g. "bn-BD,bn;q=0.9,en-US;q=0.8" — first supported language wins.
  const header = request.headers.get("accept-language");
  if (header) {
    for (const part of header.split(",")) {
      const tag = part.split(";")[0].trim().toLowerCase();
      const base = tag.split("-")[0];
      if (isLocale(base)) return base;
    }
  }

  return DEFAULT_LOCALE;
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return NextResponse.next();

  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes and anything with a file extension
  // (favicon.ico, images, sitemap.xml, robots.txt).
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
