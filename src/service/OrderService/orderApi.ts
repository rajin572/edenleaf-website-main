"use server";

import { randomUUID } from "node:crypto";
import { fetchWithAuth } from "@/lib/fetchWraper";
import { apiGet, ApiRequestError } from "@/lib/serverFetch";
import type { ICheckoutPreview, IMeta, IOrder, IOrderCreatePayload, IOrderDetail, IPlaceOrderResponse } from "@/types";

type Req<T = Record<string, unknown>> = { body?: T; params?: Record<string, string> };
type ApiResult<T = unknown> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string; data?: undefined };

type CheckoutValidatePayload = {
  items: { variantId: string; quantity: number }[];
  shippingDistrict: string;
  paymentMethod: IOrderCreatePayload["paymentMethod"];
  couponCode?: string;
};

/** POST /checkout/validate — server-authoritative pricing preview, no order created.
 *  optionalAuth: works for guest and logged-in alike, fetchWithAuth only attaches
 *  a header when a session cookie actually exists. */
export const validateCheckout = async (req: Req<CheckoutValidatePayload> = {}): Promise<ApiResult<ICheckoutPreview>> => {
  try {
    const res = await fetchWithAuth("/checkout/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

/** POST /orders. The Idempotency-Key is generated client-side (see CheckoutClient)
 *  and threaded through so a retry of the SAME submit attempt reuses the same key —
 *  generating a fresh one per server-action invocation would defeat the whole point
 *  of idempotency (double-click / network-retry protection). */
export const placeOrder = async (
  req: Req<IOrderCreatePayload & { idempotencyKey: string }> = {},
): Promise<ApiResult<IPlaceOrderResponse>> => {
  try {
    const { idempotencyKey, ...body } = req.body ?? ({} as IOrderCreatePayload & { idempotencyKey: string });
    const res = await fetchWithAuth("/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

/** Exported so CheckoutClient can generate the key without importing "node:crypto"
 *  itself (client components can't). Called once per mount, held in a ref. */
export const newIdempotencyKey = async () => randomUUID();

/** GET /orders/mine — customer-scoped, owner-checked server-side. Always
 *  no-store: per-user data, never cached. */
export async function getMyOrders(query: Record<string, string | number | undefined> = {}) {
  const res = await apiGet<{ data: IOrder[]; meta: IMeta }>("/orders/mine", { query, auth: true });
  return res.data;
}

/** GET /orders/:id — 403s server-side if this isn't the caller's own order.
 *  Treated the same as "not found" here (not leaking that the order exists to
 *  someone who can't view it) so the page can call notFound() either way. */
export async function getOrderById(id: string) {
  try {
    const res = await apiGet<IOrderDetail>(`/orders/${id}`, { auth: true });
    return res.data;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 403) return null;
    throw error;
  }
}
