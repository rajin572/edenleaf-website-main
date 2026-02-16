"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import useAuthUser from "./useAuthUser";
import { useT } from "@/components/i18n/DictionaryProvider";
import { useWishlistStore } from "@/store/wishlistStore";
import { addToWishlist, getWishlist, removeFromWishlist } from "@/service/WishlistService/wishlistApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import type { IWishlistItem } from "@/types";

export const useWishlist = () => {
  const user = useAuthUser();
  const t = useT();
  const { productIds, add, remove, has } = useWishlistStore();
  const userId = user?.userId;

  useEffect(() => {
    if (!userId) return;
    // Read fresh state: every ProductCard mounts this hook, and they must share one request.
    const state = useWishlistStore.getState();
    if (state.hasRequested) return;
    state.markRequested();
    getWishlist().then((res) => {
      if (res?.success) state.setProductIds((res.data?.data ?? []).map((item: IWishlistItem) => item.product?._id).filter(Boolean));
    });
  }, [userId]);

  const toggle = async (productId: string) => {
    if (!user) {
      toast.error(t.product.wishlistSignInPrompt);
      return;
    }
    if (has(productId)) {
      remove(productId);
      const res = await tryCatchWrapper(removeFromWishlist, { params: { productId } }, { showToast: false });
      if (!res?.success) {
        add(productId); // rollback — the server never actually removed it
        toast.error(t.product.wishlistUpdateFailed);
      }
    } else {
      add(productId);
      const res = await tryCatchWrapper(addToWishlist, { body: { productId } }, { showToast: false });
      if (!res?.success) {
        remove(productId); // rollback — the server never actually added it
        toast.error(t.product.wishlistUpdateFailed);
      }
    }
  };

  return { isWishlisted: has, toggle, count: productIds.size };
};
