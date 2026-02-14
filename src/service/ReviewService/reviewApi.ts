"use server";

import { fetchWithAuth } from "@/lib/fetchWraper";
import { getMyOrders } from "@/service/OrderService/orderApi";
import type { IGuestReviewSubmission, IMyReview, IReviewSubmission, IReviewableItem } from "@/types";

type Req<T = Record<string, unknown>> = { body?: T; params?: Record<string, string> };

export const submitReview = async (req: Req<IReviewSubmission> = {}) => {
  try {
    const res = await fetchWithAuth("/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

/** Public — no auth cookie exists for the guest reviewer. */
export const submitGuestReview = async (req: Req<IGuestReviewSubmission> = {}) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/reviews/guest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

export const getMyReviews = async () => {
  try {
    const res = await fetchWithAuth("/reviews/mine", { method: "GET", cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

/** Delivered order items the signed-in customer hasn't reviewed yet — optionally
 *  scoped to one product. Reuses Part 09's OrderService rather than duplicating
 *  a raw /orders/mine fetch, now that it exists. */
export const getReviewableItems = async (productId?: string): Promise<{ success: boolean; data?: IReviewableItem[] }> => {
  try {
    const [ordersRes, reviewsRes] = await Promise.all([
      getMyOrders({ status: "DELIVERED", limit: 100 }),
      getMyReviews(),
    ]);
    if (!ordersRes) return { success: false };
    const reviewedKeys = new Set(
      (reviewsRes?.data?.data ?? []).map((r: IMyReview) => `${r.orderId}:${r.variantId}`)
    );
    const items: IReviewableItem[] = [];
    for (const order of ordersRes.data ?? []) {
      for (const item of order.items) {
        const key = `${order._id}:${item.variant}`;
        if (reviewedKeys.has(key)) continue;
        if (productId && item.product !== productId) continue;
        items.push({
          orderId: order._id, orderNumber: order.orderNumber,
          productId: item.product, variantId: item.variant,
          productName: item.productName, variantName: item.variantName,
          deliveredAt: order.updatedAt,
        });
      }
    }
    return { success: true, data: items };
  } catch {
    return { success: false };
  }
};
