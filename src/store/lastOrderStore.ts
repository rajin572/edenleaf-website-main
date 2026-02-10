import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { IPlaceOrderResponse } from "@/types";

/** Stashes the just-created order so the success page can render real data
 *  without a re-fetch — GET /orders/:id requires auth, which a guest checkout
 *  doesn't have, so re-fetching on the success page isn't an option at all. */
interface LastOrderState {
  order: IPlaceOrderResponse | null;
  setLastOrder: (order: IPlaceOrderResponse) => void;
}

export const useLastOrderStore = create<LastOrderState>()(
  persist(
    (set) => ({ order: null, setLastOrder: (order) => set({ order }) }),
    {
      name: "ednleaf-last-order",
      storage: createJSONStorage(() => ({
        getItem: (name) => sessionStorage.getItem(name) ?? sessionStorage.getItem("e-commerce-last-order"),
        setItem: (name, value) => {
          sessionStorage.setItem(name, value);
          sessionStorage.removeItem("e-commerce-last-order");
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
          sessionStorage.removeItem("e-commerce-last-order");
        },
      })),
    },
  ),
);
