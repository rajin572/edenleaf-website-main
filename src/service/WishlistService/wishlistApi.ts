"use server";

import { fetchWithAuth } from "@/lib/fetchWraper";

type Req<T = Record<string, unknown>> = { body?: T; params?: Record<string, string> };

export const getWishlist = async () => {
  try {
    const res = await fetchWithAuth("/wishlist?limit=100", { method: "GET", cache: "no-store" });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

export const addToWishlist = async (req: Req<{ productId: string }> = {}) => {
  try {
    const res = await fetchWithAuth("/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};

export const removeFromWishlist = async (req: Req = {}) => {
  try {
    const res = await fetchWithAuth(`/wishlist/${req.params?.productId}`, { method: "DELETE" });
    return await res.json();
  } catch {
    return { success: false, message: "Could not reach the server. Please try again." };
  }
};
