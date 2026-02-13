"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Heart, ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react';
import LocaleLink from '@/components/i18n/LocaleLink';
import { useDictionary, useT } from '@/components/i18n/DictionaryProvider';
import { formatPriceFromPoisha } from '@/utils/money';
import { EmptyState } from '@/components/ui/CustomUi/EmptyState';
import { productHref } from '@/service/CatalogService/catalog.constants';
import { useServerCartStore } from '@/store/serverCartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { removeFromWishlist } from '@/service/WishlistService/wishlistApi';
import tryCatchWrapper from '@/utils/tryCatchWrapper';
import type { IWishlistItem } from '@/types';

interface WishlistClientProps {
    initialItems: IWishlistItem[];
}

// This page lives under (dashboardLayout), which redirects signed-out
// visitors before it ever renders — always a real logged-in user, so
// add-to-cart always goes to the real server cart, no guest branch needed.
export default function WishlistClient({ initialItems }: WishlistClientProps) {
    const { locale } = useDictionary();
    const t = useT();
    const addServerItem = useServerCartStore((s) => s.addItem);
    // ProductCard/ProductBuyPanel/TopBar all read wishlist membership from
    // this shared store, not from this page's own list — every mutation here
    // must also update it, or the heart icons and badge count elsewhere on
    // the site go stale until a hard reload.
    const removeFromStore = useWishlistStore((s) => s.remove);
    const [items, setItems] = useState<IWishlistItem[]>(initialItems);
    const [clearing, setClearing] = useState(false);

    const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);

    const handleRemove = async (productId: string) => {
        setItems((prev) => prev.filter((i) => i.product?._id !== productId));
        removeFromStore(productId);
        await tryCatchWrapper(removeFromWishlist, { params: { productId } }, { showToast: false });
    };

    // A row whose underlying product was hard-deleted has no product id to key
    // off — the backend also accepts the wishlist item's own _id on this route.
    const handleRemoveOrphan = async (itemId: string) => {
        setItems((prev) => prev.filter((i) => i._id !== itemId));
        await tryCatchWrapper(removeFromWishlist, { params: { productId: itemId } }, { showToast: false });
    };

    const handleClearAll = async () => {
        setClearing(true);
        const targets = items.filter((i) => i.product);
        const orphans = items.filter((i) => !i.product);
        setItems([]);
        targets.forEach((i) => removeFromStore(i.product!._id));
        await Promise.all([
            ...targets.map((i) => removeFromWishlist({ params: { productId: i.product!._id } })),
            ...orphans.map((i) => removeFromWishlist({ params: { productId: i._id } })),
        ]);
        setClearing(false);
    };

    const handleAddToCart = async (item: IWishlistItem) => {
        if (!item.product) return;
        const variant = item.product.variants.find((v) => v.isDefault) ?? item.product.variants[0];
        if (!variant) return;
        const ok = await addServerItem(variant._id, 1);
        if (ok) toast.success(t.common.addedToCart);
        else toast.error(t.common.addToCartFailed);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <EmptyState
                    icon={Heart}
                    title={t.product.wishlistEmpty || 'Your wishlist is empty'}
                    description={t.product.wishlistEmptyHint || 'Tap the heart on any product and it will show up here.'}
                />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg font-bold text-foreground">{t.nav.wishlist || 'Wishlist'} ({items.length})</h2>
                <button
                    onClick={handleClearAll}
                    disabled={clearing}
                    className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 disabled:opacity-60 px-3 py-1.5 rounded-full cursor-pointer"
                >
                    {t.product.wishlistClearAll}
                </button>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100">
                {items.map((item) => {
                    const product = item.product;

                    if (!product) {
                        return (
                            <div key={item._id} className="p-4 sm:p-6 flex items-center justify-between gap-4 text-text-secondary">
                                <span className="text-sm">{t.product.wishlistItemUnavailable}</span>
                                <button
                                    onClick={() => handleRemoveOrphan(item._id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        );
                    }

                    const isOutOfStock = !item.available;
                    const href = productHref(product._id);

                    return (
                        <div key={item._id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center hover:bg-gray-50/50 transition-colors group">
                            {/* Product Image */}
                            <LocaleLink href={href} className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl border border-gray-100 overflow-hidden bg-white shrink-0 shadow-sm block group-hover:border-primary/20 transition-colors">
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className={`object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                                />
                                {isOutOfStock && (
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                            {t.common.outOfStock}
                                        </span>
                                    </div>
                                )}
                            </LocaleLink>

                            {/* Product Details */}
                            <div className="flex-grow flex flex-col justify-center min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                    <LocaleLink href={href} className="block group/link">
                                        <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-2 group-hover/link:text-primary transition-colors leading-snug">
                                            {product.name}
                                        </h3>
                                    </LocaleLink>
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-lg sm:text-xl font-bold text-primary">{price(product.priceInPoisha)}</span>
                                    {!!product.comparePriceInPoisha && product.comparePriceInPoisha > product.priceInPoisha && (
                                        <span className="text-sm text-text-secondary line-through">{price(product.comparePriceInPoisha)}</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 text-xs font-semibold">
                                    {isOutOfStock ? (
                                        <span className="inline-flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-md">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                            {t.common.outOfStock}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                            <CheckCircle2 size={12} className="text-green-600" />
                                            {t.common.inStock}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0 shrink-0">
                                <button
                                    onClick={() => handleRemove(product._id)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm text-red-500 bg-red-50 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-100 hover:border-red-500 cursor-pointer"
                                >
                                    <Trash2 size={16} />
                                    <span className="sm:hidden xl:inline">{t.cart.remove}</span>
                                </button>

                                <button
                                    disabled={isOutOfStock}
                                    onClick={() => handleAddToCart(item)}
                                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                                        isOutOfStock
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 hover:-translate-y-0.5 cursor-pointer'
                                    }`}
                                >
                                    <ShoppingBag size={16} />
                                    {t.common.addToCart}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
