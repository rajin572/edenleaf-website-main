"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Heart, MessageCircle, Minus, Plus, ShoppingCart } from "lucide-react";
import { useDictionary } from "@/components/i18n/DictionaryProvider";
import { format } from "@/i18n/config";
import { getWhatsappNumber } from "@/helpers/config/envConfig";
import { useRouter } from "next/navigation";
import { formatPriceFromPoisha, fromPoisha } from "@/utils/money";
import { useCartStore } from "@/store/cartStore";
import { useServerCartStore } from "@/store/serverCartStore";
import useAuthUser from "@/hooks/useAuthUser";
import { useWishlist } from "@/hooks/useWishlist";
import type { IProduct } from "@/types";

interface ProductBuyPanelProps {
  product: IProduct;
}

/**
 * The only interactive island in the right-hand column: variant, quantity and
 * the three order actions. The chosen variant feeds the WhatsApp message, so it
 * has to live in one component rather than three.
 */
const ProductBuyPanel = ({ product }: ProductBuyPanelProps) => {
  const { dict: t, locale } = useDictionary();
  const router = useRouter();
  const user = useAuthUser();
  const addToCart = useCartStore((state) => state.addToCart);
  const addServerItem = useServerCartStore((s) => s.addItem);
  const { isWishlisted, toggle } = useWishlist();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.find((v) => v.isDefault)?._id ?? product.variants[0]._id
  );
  const [quantity, setQuantity] = useState(1);

  const variant = product.variants.find((v) => v._id === selectedVariantId)!;
  const isOutOfStock = variant.stock <= 0;
  const price = formatPriceFromPoisha(variant.priceInPoisha, locale, t.common.currency);
  const variantLabel = variant.name || Object.values(variant.attributes).join(" / ") || variant.unit;

  /** Returns whether the item actually made it into a cart — callers that
   *  navigate afterward (Buy Now) should only do so on success. */
  const addCurrentSelectionToCart = async (): Promise<boolean> => {
    if (user) {
      const ok = await addServerItem(variant._id, quantity);
      if (!ok) toast.error(t.common.addToCartFailed);
      return ok;
    }
    addToCart({
      productId: product._id,
      variantId: variant._id,
      variantName: variantLabel,
      name: product.name,
      price: fromPoisha(variant.priceInPoisha),
      image: product.image,
      quantity,
      stock: variant.stock,
    });
    return true;
  };

  const whatsappHref = `https://wa.me/${getWhatsappNumber()}?text=${encodeURIComponent(
    format(t.product.whatsappMessage, {
      name: product.name,
      variant: variantLabel,
      price,
    })
  )}`;

  return (
    <div>
      {product.variants.length > 1 && (
        <fieldset className="mb-6">
          <legend className="text-sm font-semibold mb-3">{t.product.weight}</legend>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((option) => {
              const outOfStock = option.stock <= 0;
              const label = option.name || Object.values(option.attributes).join(" / ") || option.unit;
              return (
                <button
                  key={option._id}
                  type="button"
                  aria-pressed={selectedVariantId === option._id}
                  disabled={outOfStock}
                  onClick={() => {
                    setSelectedVariantId(option._id);
                    setQuantity(1);
                  }}
                  className={`px-4 py-2 border rounded-md text-sm font-medium leading-relaxed transition-colors ${
                    outOfStock
                      ? "border-border text-muted-foreground opacity-50 cursor-not-allowed line-through"
                      : selectedVariantId === option._id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:border-primary/50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center border border-border rounded-md bg-card h-12">
          <button
            type="button"
            aria-label={t.product.decreaseQuantity}
            disabled={isOutOfStock}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-full flex items-center justify-center hover:text-primary transition-colors disabled:opacity-40"
          >
            <Minus size={18} />
          </button>
          <span className="w-12 h-full flex items-center justify-center font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            aria-label={t.product.increaseQuantity}
            disabled={isOutOfStock}
            onClick={() => setQuantity(Math.min(variant.stock, quantity + 1))}
            className="w-10 h-full flex items-center justify-center hover:text-primary transition-colors disabled:opacity-40"
          >
            <Plus size={18} />
          </button>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={async () => {
            const ok = await addCurrentSelectionToCart();
            if (ok) toast.success(t.common.addedToCart);
          }}
          className="grow md:grow-0 md:w-48 h-12 bg-primary hover:bg-primary-dark text-primary-foreground rounded-md font-semibold flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingCart size={20} />
          {isOutOfStock ? t.common.outOfStock : t.common.addToCart}
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={async () => {
            const ok = await addCurrentSelectionToCart();
            if (ok) router.push(`/${locale}/checkout`);
          }}
          className="grow md:grow-0 md:w-40 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          {t.common.buyNow}
        </button>

        <button
          type="button"
          aria-label={t.product.addToWishlist}
          onClick={() => toggle(product._id)}
          className={`w-12 h-12 border rounded-md flex items-center justify-center transition-colors ${isWishlisted(product._id) ? 'text-primary border-primary' : 'text-text-secondary border-border hover:text-primary hover:border-primary'}`}
        >
          <Heart size={20} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full h-12 bg-success hover:opacity-90 text-primary-foreground rounded-md font-semibold flex items-center justify-center gap-2 transition-opacity"
      >
        <MessageCircle size={20} />
        {t.product.orderOnWhatsapp}
      </a>
    </div>
  );
};

export default ProductBuyPanel;
