"use client";

import React from 'react';
import LocaleLink from '@/components/i18n/LocaleLink';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import ReusableSheet from '@/components/ui/CustomUi/ReuseableSheet';
import { useDictionary } from '@/components/i18n/DictionaryProvider';
import { formatPrice, formatPriceFromPoisha } from '@/utils/money';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useServerCartStore } from '@/store/serverCartStore';
import useAuthUser from '@/hooks/useAuthUser';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const lineKey = (item: CartItem) => `${item.productId}-${item.variantId ?? ""}`;

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { dict: t, locale } = useDictionary();
    const user = useAuthUser();

    const localItems = useCartStore((state) => state.items);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);

    const serverCart = useServerCartStore((s) => s.cart);
    const updateServerItem = useServerCartStore((s) => s.updateItem);
    const removeServerItem = useServerCartStore((s) => s.removeItem);

    const price = (value: number) => formatPrice(value, locale, t.common.currency);
    const priceFromPoisha = (poisha: number) => formatPriceFromPoisha(poisha, locale, t.common.currency);

    if (user) {
        const items = serverCart?.items ?? [];
        const subtotal = serverCart?.subtotalInPoisha ?? 0;

        return (
            <ReusableSheet
                open={isOpen}
                onOpenChange={(open) => { if (!open) onClose(); }}
                side="right"
                width="w-[85vw] sm:max-w-md"
                title={
                    <div className="flex items-center gap-2 text-foreground">
                        <ShoppingCart size={20} className="text-primary" />
                        <span className="text-lg font-bold">{t.cart.title} ({items.length})</span>
                    </div>
                }
                footer={
                    items.length === 0 ? undefined : (
                        <div className="w-full flex flex-col pt-2">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-foreground font-medium">{t.cart.subtotal}:</span>
                                <span className="text-xl font-bold text-primary">{priceFromPoisha(subtotal)}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <LocaleLink
                                    href="/cart"
                                    onClick={onClose}
                                    className="w-full py-2.5 rounded-md border-2 border-primary text-primary font-semibold text-center hover:bg-primary/5 transition-colors"
                                >
                                    {t.cart.viewCart}
                                </LocaleLink>
                                <LocaleLink
                                    href="/checkout"
                                    onClick={onClose}
                                    className="w-full py-2.5 rounded-md bg-primary text-white font-semibold text-center hover:bg-primary-dark transition-colors"
                                >
                                    {t.cart.checkout}
                                </LocaleLink>
                            </div>
                        </div>
                    )
                }
            >
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-12 text-text-secondary">
                        <ShoppingCart size={40} className="mb-3 opacity-40" />
                        <p>{t.cart.empty}</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {items.map((item) => (
                            <div key={item._id} className="flex gap-4 border-b border-border pb-4 last:border-b-0">
                                <div className="w-20 h-20 bg-muted rounded-md overflow-hidden relative shrink-0">
                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                </div>
                                <div className="flex-grow flex flex-col justify-between min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="text-sm font-semibold line-clamp-2">
                                            {item.name}{item.variant?.name && item.variant.name !== "Default" ? ` (${item.variant.name})` : ""}
                                        </h3>
                                        <button
                                            onClick={() => removeServerItem(item._id)}
                                            className="text-text-muted hover:text-destructive transition-colors shrink-0"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    {!item.available && (
                                        <span className="text-xs text-destructive font-medium">{t.common.outOfStock}</span>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border border-border rounded-md bg-surface">
                                            <button
                                                onClick={() => updateServerItem(item._id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="p-1.5 hover:bg-muted hover:text-primary transition-colors disabled:opacity-40"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateServerItem(item._id, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                className="p-1.5 hover:bg-muted hover:text-primary transition-colors disabled:opacity-40"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <span className="font-bold text-primary">{priceFromPoisha(item.lineTotalInPoisha)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ReusableSheet>
        );
    }

    const subtotal = localItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <ReusableSheet
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            side="right"
            width="w-[85vw] sm:max-w-md"
            title={
                <div className="flex items-center gap-2 text-foreground">
                    <ShoppingCart size={20} className="text-primary" />
                    <span className="text-lg font-bold">{t.cart.title} ({localItems.length})</span>
                </div>
            }
            footer={
                localItems.length === 0 ? undefined : (
                    <div className="w-full flex flex-col pt-2">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-foreground font-medium">{t.cart.subtotal}:</span>
                            <span className="text-xl font-bold text-primary">{price(subtotal)}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <LocaleLink
                                href="/cart"
                                onClick={onClose}
                                className="w-full py-2.5 rounded-md border-2 border-primary text-primary font-semibold text-center hover:bg-primary/5 transition-colors"
                            >
                                {t.cart.viewCart}
                            </LocaleLink>
                            <LocaleLink
                                href="/checkout"
                                onClick={onClose}
                                className="w-full py-2.5 rounded-md bg-primary text-white font-semibold text-center hover:bg-primary-dark transition-colors"
                            >
                                {t.cart.checkout}
                            </LocaleLink>
                        </div>
                    </div>
                )
            }
        >
            {localItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 text-text-secondary">
                    <ShoppingCart size={40} className="mb-3 opacity-40" />
                    <p>{t.cart.empty}</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {localItems.map((item) => (
                        <div key={lineKey(item)} className="flex gap-4 border-b border-border pb-4 last:border-b-0">
                            <div className="w-20 h-20 bg-muted rounded-md overflow-hidden relative shrink-0">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div className="flex-grow flex flex-col justify-between min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="text-sm font-semibold line-clamp-2">
                                        {item.name}{item.variantName ? ` (${item.variantName})` : ""}
                                    </h3>
                                    <button
                                        onClick={() => removeFromCart(item.productId, item.variantId)}
                                        className="text-text-muted hover:text-destructive transition-colors shrink-0"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center border border-border rounded-md bg-surface">
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                                            disabled={item.quantity <= 1}
                                            className="p-1.5 hover:bg-muted hover:text-primary transition-colors disabled:opacity-40"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                                            disabled={item.quantity >= item.stock}
                                            className="p-1.5 hover:bg-muted hover:text-primary transition-colors disabled:opacity-40"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <span className="font-bold text-primary">{price(item.price * item.quantity)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </ReusableSheet>
    );
};

export default CartDrawer;
