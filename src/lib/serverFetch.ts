/**
 * Server-side API access for Server Components, `generateMetadata`, route
 * handlers and Server Actions.
 *
 * SERVER ONLY — `fetchWithAuth` reads cookies through `next/headers`, which
 * throws in the browser. Client components must use `clientFetch` instead.
 *
 * Caching notes (Next 16, `cacheComponents` off):
 * - `fetch` is NOT cached by default, but a route with no request-time API is
 *   still prerendered at build, so an uncached fetch runs once at build time.
 *   Always pass `revalidate` for catalog data you want to stay fresh.
 * - Pass `tags` so the dashboard can call `revalidateTag()` after an edit.
 * - Authenticated requests are never cached: they vary per user.
 */

import { getBaseUrl } from "@/helpers/config/envConfig";
import { fetchWithAuth } from "./fetchWraper";
import type { IApiResponse } from "@/types";

export type QueryValue = string | number | boolean | undefined | null;

export interface ApiGetOptions {
  /** Appended as a query string; `undefined`, `null` and `""` entries are dropped. */
  query?: Record<string, QueryValue>;
  /** Cache tags for `revalidateTag()`. Ignored when `auth` is true. */
  tags?: string[];
  /**
   * Cache lifetime, per Next's `next.revalidate` (fetch docs): `false` caches
   * indefinitely (SSG), `0` never caches (SSR), a `number` is the ISR window
   * in seconds. Ignored when `auth` is true (always `no-store`).
   */
  revalidate?: number | false;
  /** Send the signed-in user's token and skip the cache entirely. */
  auth?: boolean;
}

/** Thrown for a non-2xx response so the nearest `error.tsx` can render. */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

const buildQuery = (query?: Record<string, QueryValue>) => {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

/**
 * GET a JSON envelope from the API.
 *
 * @throws {ApiRequestError} on a non-2xx response — except 404, which resolves
 * to `null` data so callers can decide between `notFound()` and a fallback.
 */
export async function apiGet<T>(
  path: string,
  options: ApiGetOptions = {}
): Promise<IApiResponse<T | null>> {
  const { query, tags, revalidate, auth = false } = options;
  const url = `${path}${buildQuery(query)}`;

  const init: RequestInit = auth
    ? { method: "GET", cache: "no-store" }
    : {
      method: "GET",
      next: {

        ...(tags?.length ? { tags } : {}),
        ...(revalidate !== undefined ? { revalidate } : {}),
      },
    };

  const res = auth
    ? await fetchWithAuth(url, init)
    : await fetch(`${getBaseUrl()}${url}`, init);

  if (res.status === 404) {
    return { statusCode: 404, success: false, message: "Not found", data: null };
  }

  if (!res.ok) {
    throw new ApiRequestError(
      `Request failed with ${res.status}`,
      res.status,
      url
    );
  }

  return (await res.json()) as IApiResponse<T>;
}
