"use client";

import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useDictionary } from '@/components/i18n/DictionaryProvider';
import { formatPrice, formatPriceFromPoisha } from '@/utils/money';
import { useCartStore } from '@/store/cartStore';
import { useServerCartStore } from '@/store/serverCartStore';
import useAuthUser from '@/hooks/useAuthUser';

const FloatingCart = ({ onClick }: { onClick: () => void }) => {
    const { dict: t, locale } = useDictionary();
    const user = useAuthUser();

    const hasHydrated = useCartStore((state) => state.hasHydrated);
    const localItems = useCartStore((state) => state.items);
    const serverCart = useServerCartStore((s) => s.cart);

    const totalItems = user
        ? serverCart?.itemCount ?? 0
        : localItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotalLabel = user
        ? formatPriceFromPoisha(serverCart?.subtotalInPoisha ?? 0, locale, t.common.currency)
        : formatPrice(localItems.reduce((sum, item) => sum + item.price * item.quantity, 0), locale, t.common.currency);

    if (!user && (!hasHydrated || totalItems === 0)) return null;
    if (user && totalItems === 0) return null;

    return (
        <button
            onClick={onClick}
            className="hidden md:flex fixed right-0 top-[40%] bg-primary text-primary-foreground shadow-lg rounded-l flex-col items-center justify-center p-2 z-40 hover:bg-primary-dark transition-colors border border-primary-dark border-r-0 cursor-pointer"
            style={{ width: '72px' }}
        >
            <ShoppingCart size={24} className="mb-1" />
            <span className="text-xs font-semibold">{totalItems} {t.cart.itemsSuffix}</span>
            <div className="bg-white/20 w-full h-[1px] my-1 rounded" />
            <span className="text-xs font-bold">{subtotalLabel}</span>
        </button>
    );
};

export default FloatingCart;
