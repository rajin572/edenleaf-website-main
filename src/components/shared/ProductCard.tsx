"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import LocaleLink from '@/components/i18n/LocaleLink';
import { Heart, ShoppingCart, Star, Eye, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useDictionary } from '@/components/i18n/DictionaryProvider';
import { productHref } from '@/service/CatalogService/catalog.constants';
import { formatPriceFromPoisha, fromPoisha } from '@/utils/money';
import { useCartStore } from '@/store/cartStore';
import { useServerCartStore } from '@/store/serverCartStore';
import useAuthUser from '@/hooks/useAuthUser';
import { useWishlist } from '@/hooks/useWishlist';
import type { IProduct } from '@/types';

const ProductCard: React.FC<{ product: IProduct; showBadge?: boolean }> = ({ product, showBadge = false }) => {
    const { dict: t, locale } = useDictionary();
    const user = useAuthUser();
    const addToCart = useCartStore((state) => state.addToCart);
    const addServerItem = useServerCartStore((s) => s.addItem);
    const { isWishlisted, toggle } = useWishlist();
    const isOutOfStock = product.stock <= 0;
    const [quantity, setQuantity] = useState(1);
    const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];

    const handleAddToCart = async () => {
        if (user) {
            const ok = await addServerItem(defaultVariant._id, quantity);
            if (ok) toast.success(t.common.addedToCart);
            else toast.error(t.common.addToCartFailed);
            return;
        }
        addToCart({
            productId: product._id,
            variantId: defaultVariant._id,
            variantName: defaultVariant.name,
            name: product.name,
            price: fromPoisha(product.priceInPoisha),
            image: product.image,
            quantity,
            stock: product.stock,
        });
        toast.success(t.common.addedToCart);
    };

    const href = productHref(product._id);
    const price = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);

    const renderBadge = () => {
        if (!showBadge) return null;

        const baseBadgeClasses = "absolute top-2 left-2 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm z-10";

        if (isOutOfStock) return <span className={`${baseBadgeClasses} bg-destructive`}>{t.badge.outOfStock}</span>;

        // `badge` is dummy-catalog-only; real products derive from real fields instead.
        const badge = product.badge ??
            (product.isNewArrival ? 'new'
                : product.comparePriceInPoisha && product.comparePriceInPoisha > product.priceInPoisha ? 'sale'
                    : undefined);

        switch (badge) {
            case 'new':
                return <span className={`${baseBadgeClasses} bg-badge-new`}>{t.badge.new}</span>;
            case 'sale':
                return <span className={`${baseBadgeClasses} bg-badge-sale`}>{t.badge.sale}</span>;
            case 'bestsell':
                return <span className={`${baseBadgeClasses} bg-badge-bestsell`}>{t.badge.bestsell}</span>;
            case 'combo':
                return <span className={`${baseBadgeClasses} bg-badge-combo`}>{t.badge.combo}</span>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden group hover:shadow-md transition-shadow relative flex flex-col h-full">
            {renderBadge()}

            <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <LocaleLink
                    href={href}
                    aria-label={t.product.quickView}
                    className="p-2 bg-background border border-border hover:border-primary rounded-full text-text-secondary hover:text-primary transition-colors flex items-center justify-center shadow-sm"
                >
                    <Eye size={16} />
                </LocaleLink>
                <button
                    type="button"
                    aria-label={t.product.addToWishlist}
                    onClick={() => toggle(product._id)}
                    className={`p-2 bg-background border border-border hover:border-primary rounded-full transition-colors flex items-center justify-center shadow-sm ${isWishlisted(product._id) ? 'text-primary border-primary' : 'text-text-secondary hover:text-primary'}`}
                >
                    <Heart size={16} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
                </button>
            </div>

            <LocaleLink href={href} className="block relative aspect-square overflow-hidden bg-background">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className={`object-cover transition-all duration-500 ${product.secondaryImage ? 'group-hover:opacity-0 group-hover:scale-95' : 'group-hover:scale-105'} ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                />
                {product.secondaryImage && (
                    <Image
                        src={product.secondaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className={`object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                    />
                )}
            </LocaleLink>

            <div className="p-3 flex flex-col grow">
                <LocaleLink href={href} className="text-sm md:text-base font-medium text-foreground line-clamp-2 hover:text-primary transition-colors mb-1">
                    {product.name}
                </LocaleLink>

                <div className="flex items-center gap-1 mb-2 mt-auto">
                    <div className="flex text-warning">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} fill={i < Math.floor(product.avgRating) ? "currentColor" : "none"} />
                        ))}
                    </div>
                    <span className="text-[11px] text-text-secondary">({product.reviewCount})</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                    <span className="text-base md:text-lg font-bold text-primary">{price(product.priceInPoisha)}</span>
                    {!!product.comparePriceInPoisha && product.comparePriceInPoisha > product.priceInPoisha && (
                        <span className="text-xs md:text-sm text-muted-foreground line-through">{price(product.comparePriceInPoisha)}</span>
                    )}
                </div>

                {isOutOfStock ? (
                    <button
                        type="button"
                        disabled
                        className="w-full py-2 rounded-full font-semibold text-sm flex items-center justify-center gap-2 bg-muted text-muted-foreground cursor-not-allowed border border-border mt-3"
                    >
                        <ShoppingCart size={16} />
                        {t.common.outOfStock}
                    </button>
                ) : (
                    <div className="flex items-center gap-2 mt-3 w-full">
                        <div className="flex items-center justify-between border border-border rounded-full px-3 py-1.5 flex-1 max-w-[100px] bg-background h-9">
                            <button
                                type="button"
                                aria-label={t.product.decreaseQuantity}
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="text-foreground hover:text-primary transition-colors focus:outline-none"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="text-sm font-semibold">{quantity}</span>
                            <button
                                type="button"
                                aria-label={t.product.increaseQuantity}
                                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                className="text-foreground hover:text-primary transition-colors focus:outline-none"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        <button
                            type="button"
                            aria-label={t.common.addToCart}
                            onClick={handleAddToCart}
                            className="flex flex-1 items-center justify-center gap-1.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-4 py-1.5 h-9 transition-colors font-bold text-sm bg-transparent"
                        >
                            <ShoppingBag size={14} />
                            {t.common.add}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;
