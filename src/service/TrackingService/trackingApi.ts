/**
 * Guest order tracking — a plain browser-side module, not "use server".
 * Neither call needs cookies or server-only APIs: both POST /guest-order-access
 * and GET /orders/track/:token are public and token-scoped, and both are
 * triggered by client-side form interaction, not first paint. This sidesteps
 * fetchWithAuth's next/headers requirement, which isn't relevant here anyway
 * (no auth token exists for a guest).
 */

import { clientFetch } from "@/lib/clientFetch";
import type { IGuestAccessToken, ITrackedOrder } from "@/types";

type Req<T = Record<string, unknown>> = { body?: T; params?: Record<string, string> };
type Result<T> =
  | { success: true; message: string; data?: T; statusCode?: number }
  | { success: false; message: string; statusCode?: number };

export const issueGuestOrderAccess = async (
  req: Req<{ orderNumber: string; phone?: string; email?: string }> = {},
): Promise<Result<IGuestAccessToken>> => {
  try {
    const res = await clientFetch<IGuestAccessToken>("/guest-order-access", {
      method: "POST",
      body: req.body,
      auth: false,
    });
    return res.success && res.data
      ? { success: true, message: res.message ?? "", data: res.data, statusCode: res.statusCode }
      : { success: false, message: res.message ?? "Order details did not match.", statusCode: res.statusCode };
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

/** Never throws — a transport failure (offline, DNS, etc.) resolves to a
 *  {success:false} result like any other failure, so every call site can
 *  treat this uniformly instead of needing its own try/catch. */
export const trackGuestOrder = async (req: Req<{ token: string }> = {}): Promise<Result<ITrackedOrder>> => {
  try {
    const res = await clientFetch<ITrackedOrder>(`/orders/track/${req.body?.token}`, { method: "GET", auth: false });
    return res.success && res.data
      ? { success: true, message: res.message ?? "", data: res.data, statusCode: res.statusCode }
      : { success: false, message: res.message ?? "Tracking link is invalid.", statusCode: res.statusCode };
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};
