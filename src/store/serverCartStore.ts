import { create } from "zustand";
import { getCart, addCartItem, updateCartItem, removeCartItem } from "@/service/CartService/cartApi";
import { useCartStore } from "./cartStore";
import type { IServerCart } from "@/types";

/**
 * Logged-in users' cart, mirrored from the server — NOT persisted to
 * localStorage (the server is the only source of truth once signed in).
 *
 * Merge-on-login rule (chosen 2026-09, Part 06 W2): server wins, local is
 * discarded, never pushed up. Revisit "push local into server cart when the
 * server cart is empty" if ever needed — deferred for now since a guest
 * cart is expected to be small and checkout is available while signed out.
 */
interface ServerCartState {
  cart: IServerCart | null;
  isLoading: boolean;
  /** True once a fetch has been attempted for the current session (even a failed one),
   *  so a failing request is never retried on every render. */
  hasFetched: boolean;
  fetchCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<boolean>;
  updateItem: (itemId: string, quantity: number) => Promise<boolean>;
  removeItem: (itemId: string) => Promise<boolean>;
  reset: () => void;
}

export const useServerCartStore = create<ServerCartState>((set) => ({
  cart: null,
  isLoading: false,
  hasFetched: false,

  fetchCart: async () => {
    set({ isLoading: true, hasFetched: true });
    const res = await getCart();
    set({ cart: res.success ? res.data ?? null : null, isLoading: false });
    // Server wins: whatever the guest had locally is dropped once we know
    // this session is authenticated and the server cart has been read. A failed
    // read must not wipe it.
    if (res.success) useCartStore.getState().clearCart();
  },

  addItem: async (variantId, quantity) => {
    const res = await addCartItem({ body: { variantId, quantity } });
    if (res.success) set({ cart: res.data ?? null });
    return res.success;
  },

  updateItem: async (itemId, quantity) => {
    const res = await updateCartItem({ params: { itemId }, body: { quantity } });
    if (res.success) set({ cart: res.data ?? null });
    return res.success;
  },

  removeItem: async (itemId) => {
    const res = await removeCartItem({ params: { itemId } });
    if (res.success) set({ cart: res.data ?? null });
    return res.success;
  },

  reset: () => set({ cart: null, isLoading: false, hasFetched: false }),
}));
