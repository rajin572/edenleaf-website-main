"use client";
import { useEffect } from "react";
import useAuthUser from "./useAuthUser";
import { useCartStore } from "@/store/cartStore";
import { useServerCartStore } from "@/store/serverCartStore";

/**
 * Number shown on the cart badge. Signed-in shoppers have a server cart, guests a local one.
 * The server cart is loaded here (once per session) so the badge and the cart drawer are
 * correct after a reload, not only after the first "add to cart".
 */
const useCartCount = () => {
  const user = useAuthUser();
  const userId = user?.userId;

  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const localCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const serverCount = useServerCartStore((state) => state.cart?.itemCount ?? 0);

  useEffect(() => {
    // Read fresh state: the badge is rendered in several components that mount together.
    const { hasFetched, fetchCart, reset } = useServerCartStore.getState();
    if (userId) {
      if (!hasFetched) void fetchCart();
    } else if (hasFetched) {
      reset();
    }
  }, [userId]);

  if (userId) return serverCount;
  return hasHydrated ? localCount : 0;
};

export default useCartCount;
