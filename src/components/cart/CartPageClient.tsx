"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import LocaleLink from "@/components/i18n/LocaleLink";
import Container from "@/components/ui/CustomUi/Container";
import { EmptyState } from "@/components/ui/CustomUi/EmptyState";
import { useDictionary } from "@/components/i18n/DictionaryProvider";
import { format } from "@/i18n/config";
import { formatPrice, formatPriceFromPoisha } from "@/utils/money";
import { useCartStore, type CartItem } from "@/store/cartStore";
import { useServerCartStore } from "@/store/serverCartStore";
import useAuthUser from "@/hooks/useAuthUser";

const lineKey = (item: CartItem) => `${item.productId}-${item.variantId ?? ""}`;

export default function CartPageClient() {
  const { dict: t, locale } = useDictionary();
  const user = useAuthUser();

  const localItems = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const serverCart = useServerCartStore((s) => s.cart);
  const updateServerItem = useServerCartStore((s) => s.updateItem);
  const removeServerItem = useServerCartStore((s) => s.removeItem);

  const price = (value: number) => formatPrice(value, locale, t.common.currency);
  const priceFromPoisha = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);

  if (!user && !hasHydrated) {
    return (
      <Container className="py-16 text-center text-text-secondary">
        {t.common.loading}
      </Container>
    );
  }

  const items = user ? serverCart?.items ?? [] : localItems;

  if (items.length === 0) {
    return (
      <Container className="py-8">
        <EmptyState
          icon={ShoppingCart}
          title={t.cart.empty}
          description={t.cart.emptyHint}
          children={
            <LocaleLink
              href="/"
              className="inline-flex mt-2 py-2.5 px-6 rounded-md bg-primary hover:bg-primary-dark text-white font-semibold transition-colors"
            >
              {t.cart.continueShopping}
            </LocaleLink>
          }
        />
      </Container>
    );
  }

  const totalItems = user
    ? serverCart?.itemCount ?? 0
    : localItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalLabel = user
    ? priceFromPoisha(serverCart?.subtotalInPoisha ?? 0)
    : price(localItems.reduce((sum, item) => sum + item.price * item.quantity, 0));

  return (
    <Container className="py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">{t.cart.title}</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-6 gap-4 p-4 border-b border-gray-100 bg-gray-50/50 text-sm font-semibold text-text-secondary">
              <div className="col-span-3">{t.cart.productHeader}</div>
              <div className="col-span-1 text-center">{t.cart.priceHeader}</div>
              <div className="col-span-1 text-center">{t.cart.quantityHeader}</div>
              <div className="col-span-1 text-right">{t.cart.totalHeader}</div>
            </div>

            {user
              ? (serverCart?.items ?? []).map((item) => {
                const canIncrease = item.quantity < item.stock;
                const variantLabel = item.variant?.name && item.variant.name !== "Default" ? item.variant.name : null;

                return (
                  <div
                    key={item._id}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border-b border-gray-100 last:border-b-0 items-center"
                  >
                    <div className="col-span-1 md:col-span-3 flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-md overflow-hidden relative shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-sm md:text-base font-semibold line-clamp-2 mb-1">
                          {item.name}
                        </span>
                        {variantLabel && (
                          <span className="text-xs text-text-secondary">
                            {t.product.weight}: {variantLabel}
                          </span>
                        )}
                        {!item.available && (
                          <span className="text-xs text-destructive font-medium mt-1">{t.common.outOfStock}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeServerItem(item._id)}
                          className="text-destructive text-sm flex items-center gap-1 mt-2 w-max hover:underline md:hidden"
                        >
                          <Trash2 size={14} /> {t.cart.remove}
                        </button>
                      </div>
                    </div>

                    <div className="hidden md:block col-span-1 text-center font-semibold text-text-secondary">
                      {priceFromPoisha(item.unitPriceInPoisha)}
                    </div>

                    <div className="col-span-1 flex items-center justify-between md:justify-center">
                      <div className="flex items-center border border-border rounded-md bg-white">
                        <button
                          type="button"
                          aria-label={t.product.decreaseQuantity}
                          onClick={() => updateServerItem(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-muted hover:text-primary transition-colors disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={t.product.increaseQuantity}
                          onClick={() => updateServerItem(item._id, item.quantity + 1)}
                          disabled={!canIncrease}
                          className="p-2 hover:bg-muted hover:text-primary transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="md:hidden font-bold text-primary">{priceFromPoisha(item.unitPriceInPoisha)}</span>
                    </div>

                    <div className="hidden md:flex col-span-1 items-center justify-end gap-4">
                      <span className="font-bold text-primary text-lg">
                        {priceFromPoisha(item.lineTotalInPoisha)}
                      </span>
                      <button
                        type="button"
                        aria-label={t.cart.remove}
                        onClick={() => removeServerItem(item._id)}
                        className="text-text-muted hover:text-destructive transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })
              : localItems.map((item) => {
                const canIncrease = item.quantity < item.stock;

                return (
                  <div
                    key={lineKey(item)}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border-b border-gray-100 last:border-b-0 items-center"
                  >
                    <div className="col-span-1 md:col-span-3 flex gap-4">
                      <div className="w-20 h-20 bg-muted rounded-md overflow-hidden relative shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <span className="text-sm md:text-base font-semibold line-clamp-2 mb-1">
                          {item.name}
                        </span>
                        {item.variantName && (
                          <span className="text-xs text-text-secondary">
                            {t.product.weight}: {item.variantName}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId, item.variantId)}
                          className="text-destructive text-sm flex items-center gap-1 mt-2 w-max hover:underline md:hidden"
                        >
                          <Trash2 size={14} /> {t.cart.remove}
                        </button>
                      </div>
                    </div>

                    <div className="hidden md:block col-span-1 text-center font-semibold text-text-secondary">
                      {price(item.price)}
                    </div>

                    <div className="col-span-1 flex items-center justify-between md:justify-center">
                      <div className="flex items-center border border-border rounded-md bg-white">
                        <button
                          type="button"
                          aria-label={t.product.decreaseQuantity}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                          disabled={item.quantity <= 1}
                          className="p-2 hover:bg-muted hover:text-primary transition-colors disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={t.product.increaseQuantity}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                          disabled={!canIncrease}
                          className="p-2 hover:bg-muted hover:text-primary transition-colors disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="md:hidden font-bold text-primary">{price(item.price)}</span>
                    </div>

                    <div className="hidden md:flex col-span-1 items-center justify-end gap-4">
                      <span className="font-bold text-primary text-lg">
                        {price(item.price * item.quantity)}
                      </span>
                      <button
                        type="button"
                        aria-label={t.cart.remove}
                        onClick={() => removeFromCart(item.productId, item.variantId)}
                        className="text-text-muted hover:text-destructive transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}

            <div className="p-4 flex justify-between items-center bg-gray-50/50">
              <LocaleLink href="/" className="text-primary font-semibold hover:underline text-sm">
                {t.cart.continueShopping}
              </LocaleLink>
              {!user && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  {t.cart.clearCart}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 p-6 sticky top-[130px]">
            <h3 className="text-lg font-bold text-foreground mb-4 pb-4 border-b border-gray-100">
              {t.cart.orderSummary}
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-text-secondary">
                <span>{format(t.cart.itemsSubtotal, { count: totalItems })}</span>
                <span>{subtotalLabel}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>{t.cart.shipping}</span>
                <span>{t.cart.shippingNote}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>{t.cart.discount}</span>
                <span>{price(0)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-lg font-bold text-foreground pt-4 border-t border-gray-100 mb-6">
              <span>{t.checkout.total}</span>
              <span className="text-primary text-2xl">{subtotalLabel}</span>
            </div>

            <LocaleLink
              href="/checkout"
              className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-md font-bold text-lg flex items-center justify-center gap-2 transition-colors mb-4"
            >
              {t.cart.proceedToCheckout}
            </LocaleLink>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm font-medium mb-2">{t.cart.haveCoupon}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.cart.couponPlaceholder}
                  className="flex-grow h-10 px-3 border border-border rounded-md outline-none focus:border-primary text-sm"
                />
                <button className="px-4 h-10 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-md text-sm font-medium transition-colors">
                  {t.cart.apply}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
