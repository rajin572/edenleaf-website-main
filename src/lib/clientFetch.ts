"use client";

/**
 * Browser-side API access, for the things a Server Component cannot do:
 * live search, filters that must not trigger a navigation, infinite scroll,
 * and anything reacting to a socket event.
 *
 * Prefer a Server Component with `apiGet` (`src/lib/serverFetch.ts`) for any
 * data that can be rendered on the server — Next's fetch cache and tags only
 * work there. In the browser the `cache` option is just the HTTP cache.
 */

import Cookies from "js-cookie";
import { getBaseUrl } from "@/helpers/config/envConfig";
import type { IApiResponse } from "@/types";
import { getNewToken } from "@/service/AuthService/AuthServiceAPi";
import { brandCookieName, legacyCookieName } from "./brandCookieNames";

/**
 * Dispatched client-side whenever the signed-in state changes outside a login/logout
 * action (e.g. the session could not be refreshed). `useAuthUser` subscribes to it.
 */
export const AUTH_UPDATED_EVENT = "ednleaf_auth_updated";

/** Same cookie the server reads in `src/lib/getAuthToken.tsx`. */
export const ACCESS_TOKEN_COOKIE = brandCookieName("access_token");

export const getClientToken = () => Cookies.get(ACCESS_TOKEN_COOKIE) ?? Cookies.get(legacyCookieName("access_token"));

// Access tokens are short-lived. On a 401 we trade the httpOnly refresh cookie for a new one (a
// server action, since the browser cannot read that cookie) and replay the request once. Shared
// so a burst of 401s triggers one refresh — the refresh token is single-use.
let inFlightRefresh: Promise<boolean> | null = null;

const refreshSession = () => {
  inFlightRefresh ??= getNewToken()
    .then((res) => res.success)
    .catch(() => false)
    .finally(() => {
      inFlightRefresh = null;
    });
  return inFlightRefresh;
};

export interface ClientFetchOptions extends Omit<RequestInit, "body"> {
  /** Serialised to JSON unless it is already a FormData/string body. */
  body?: unknown;
  /** Attach the access token. Defaults to true; harmless when signed out. */
  auth?: boolean;
}

/**
 * Fetch a JSON envelope from the API.
 *
 * Resolves with the parsed envelope for any HTTP status so callers can branch
 * on `success`; only a transport failure rejects.
 */
export async function clientFetch<T>(
  path: string,
  options: ClientFetchOptions = {}
): Promise<IApiResponse<T | null>> {
  const { body, auth = true, headers, ...rest } = options;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const send = () => {
    const token = auth ? getClientToken() : undefined;
    return fetch(`${getBaseUrl()}${path}`, {
      ...rest,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body !== undefined
        ? { body: isFormData ? (body as FormData) : JSON.stringify(body) }
        : {}),
    });
  };

  const hadToken = Boolean(auth && getClientToken());
  let res = await send();

  if (res.status === 401 && hadToken && !path.startsWith("/auth/")) {
    if (await refreshSession()) {
      res = await send();
    } else if (!getClientToken()) {
      // The refresh was rejected and the cookies are gone: the session has really ended.
      window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
    }
  }

  try {
    return (await res.json()) as IApiResponse<T>;
  } catch {
    return {
      statusCode: res.status,
      success: false,
      message: "The server returned an unreadable response.",
      data: null,
    };
  }
}
