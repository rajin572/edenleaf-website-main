"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type ParamValue = string | number | null | undefined;

/**
 * Filter/sort/view state lives in the URL so the server can render the result.
 * Client controls call `setParams` and the Server Component re-renders with
 * fresh data — no client-side data fetching, and the state is shareable.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildHref = useCallback(
    (updates: Record<string, ParamValue>, { keepPage = false } = {}) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      // Any filter change invalidates the current page number.
      if (!keepPage) params.delete("page");

      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [pathname, searchParams]
  );

  const setParams = useCallback(
    (updates: Record<string, ParamValue>, options?: { keepPage?: boolean }) => {
      router.replace(buildHref(updates, options), { scroll: false });
    },
    [router, buildHref]
  );

  return { searchParams, setParams, buildHref };
}
