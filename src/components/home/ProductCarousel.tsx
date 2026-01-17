"use client";

import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useDictionary } from '@/components/i18n/DictionaryProvider';
import ProductCard from '@/components/shared/ProductCard';
import type { IProduct } from '@/types';

interface ProductCarouselProps {
    title: string;
    products: IProduct[];
    showBadge?: boolean;
}

const ProductCarousel = ({ title, products, showBadge = false }: ProductCarouselProps) => {
    const { dict: t } = useDictionary();
    const trackRef = useRef<HTMLDivElement>(null);
    const [canScrollBack, setCanScrollBack] = useState(false);
    const [canScrollForward, setCanScrollForward] = useState(false);

    const updateNavigation = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;

        const maxScroll = track.scrollWidth - track.clientWidth;
        setCanScrollBack(track.scrollLeft > 2);
        setCanScrollForward(maxScroll > 2 && track.scrollLeft < maxScroll - 2);
    }, []);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        updateNavigation();
        const resizeObserver = new ResizeObserver(updateNavigation);
        resizeObserver.observe(track);

        return () => resizeObserver.disconnect();
    }, [products, updateNavigation]);

    const move = useCallback((direction: -1 | 1) => {
        const track = trackRef.current;
        if (!track) return;

        const cards = track.children;
        const firstCard = cards.item(0) as HTMLElement | null;
        const secondCard = cards.item(1) as HTMLElement | null;
        const cardStep = firstCard && secondCard
            ? Math.abs(secondCard.offsetLeft - firstCard.offsetLeft)
            : track.clientWidth * 0.8;

        track.scrollBy({ left: cardStep * direction, behavior: 'smooth' });
    }, []);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            move(-1);
        }

        if (event.key === 'ArrowRight') {
            event.preventDefault();
            move(1);
        }
    };

    return (
        <div className="group/carousel relative">
            <div
                ref={trackRef}
                role="region"
                aria-label={title}
                tabIndex={0}
                onScroll={updateNavigation}
                onKeyDown={handleKeyDown}
                className="product-carousel-track scrollbar-none -mx-1 overflow-x-auto px-1 py-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
                {products.map((product) => (
                    <div key={product._id} className="snap-start">
                        <ProductCard product={product} showBadge={showBadge} />
                    </div>
                ))}
            </div>

            <button
                type="button"
                aria-label={`${t.common.previous}: ${title}`}
                onClick={() => move(-1)}
                disabled={!canScrollBack}
                className="absolute -left-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:scale-75 disabled:opacity-0 md:-left-5 md:size-11"
            >
                <ChevronLeft className="size-5" aria-hidden="true" />
            </button>

            <button
                type="button"
                aria-label={`${t.common.next}: ${title}`}
                onClick={() => move(1)}
                disabled={!canScrollForward}
                className="absolute -right-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:scale-75 disabled:opacity-0 md:-right-5 md:size-11"
            >
                <ChevronRight className="size-5" aria-hidden="true" />
            </button>
        </div>
    );
};

export default ProductCarousel;
