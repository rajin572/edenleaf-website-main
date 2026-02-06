"use client";

import { clientFetch } from "@/lib/clientFetch";
import type { IServerCart } from "@/types";

type Req<T = Record<string, unknown>> = { body?: T; params?: Record<string, string> };
type ApiResult<T = unknown> =
  | { success: true; message: string; data?: T }
  | { success: false; message: string; data?: undefined };

const toResult = (res: Awaited<ReturnType<typeof clientFetch<IServerCart>>>): ApiResult<IServerCart> =>
  res.success
    ? { success: true, message: res.message ?? "OK", data: res.data ?? undefined }
    : { success: false, message: res.message ?? "Could not reach the server. Please try again." };

/** GET /cart */
export const getCart = async (): Promise<ApiResult<IServerCart>> =>
  toResult(await clientFetch<IServerCart>("/cart", { method: "GET" }));

/** POST /cart/items */
export const addCartItem = async (req: Req<{ variantId: string; quantity: number }> = {}): Promise<ApiResult<IServerCart>> =>
  toResult(await clientFetch<IServerCart>("/cart/items", { method: "POST", body: req.body }));

/** PATCH /cart/items/:itemId */
export const updateCartItem = async (req: Req<{ quantity: number }> = {}): Promise<ApiResult<IServerCart>> =>
  toResult(
    await clientFetch<IServerCart>(`/cart/items/${req.params?.itemId}`, { method: "PATCH", body: req.body })
  );

/** DELETE /cart/items/:itemId */
export const removeCartItem = async (req: Req = {}): Promise<ApiResult<IServerCart>> =>
  toResult(await clientFetch<IServerCart>(`/cart/items/${req.params?.itemId}`, { method: "DELETE" }));
