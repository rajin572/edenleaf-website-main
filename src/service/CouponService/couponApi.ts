import { apiGet, ApiRequestError } from "@/lib/serverFetch";
import type { IMyCoupon } from "@/types";

/**
 * GET /coupons/mine — auth-only, no pagination (returns every public,
 * non-archived coupon annotated with this user's own usage).
 */
export async function getMyCoupons(): Promise<IMyCoupon[]> {
  try {
    const res = await apiGet<IMyCoupon[]>("/coupons/mine", { auth: true });
    return res.data ?? [];
  } catch (error) {
    // Not signed in, or the session expired between the layout check and
    // this call — treat as "no coupons" rather than throwing into the error
    // boundary; the (dashboardLayout) guard is the real gate.
    if (error instanceof ApiRequestError && error.status === 401) return [];
    throw error;
  }
}
