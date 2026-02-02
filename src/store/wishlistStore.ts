import { create } from "zustand";

/** Signed-in-only feature, server is the source of truth — no `persist`,
 *  unlike cartStore.ts (which must work for guests too). */
interface WishlistState {
  productIds: Set<string>;
  isLoaded: boolean;
  /** A load has been started for this session (success or failure) — stops every
   *  ProductCard re-requesting the list when it fails. */
  hasRequested: boolean;
  markRequested: () => void;
  setProductIds: (ids: string[]) => void;
  add: (id: string) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: new Set(),
  isLoaded: false,
  hasRequested: false,
  markRequested: () => set({ hasRequested: true }),
  setProductIds: (ids) => set({ productIds: new Set(ids), isLoaded: true }),
  add: (id) => set((state) => ({ productIds: new Set(state.productIds).add(id) })),
  remove: (id) => set((state) => {
    const next = new Set(state.productIds);
    next.delete(id);
    return { productIds: next };
  }),
  has: (id) => get().productIds.has(id),
  reset: () => set({ productIds: new Set(), isLoaded: false, hasRequested: false }),
}));
