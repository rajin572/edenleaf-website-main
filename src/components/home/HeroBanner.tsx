"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import LocaleLink from '@/components/i18n/LocaleLink';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Container from '@/components/ui/CustomUi/Container';
import type { IBanner } from '@/types';

const MIN_SWIPE_DISTANCE = 50;

interface HeroBannerProps {
    /** Active hero banners, ordered by the public banner endpoint. */
    slides: IBanner[];
    sideBanner?: IBanner;
}

const HeroBanner = ({ slides, sideBanner }: HeroBannerProps) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    // Signed 0..1 crossfade the drag has pulled through: < 0 heads to the next slide, > 0 to the previous one
    const [dragProgress, setDragProgress] = useState(0);

    const dragStartX = useRef<number | null>(null);
    const dragDistance = useRef(0);
    const suppressClick = useRef(false);
    const activeSlideIndex = slides.length > 0 ? currentSlide % slides.length : 0;

    const nextSlide = useCallback(() => {
        if (slides.length < 2) return;
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        if (slides.length < 2) return;
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        if (slides.length < 2 || isPaused || isFocused || isDragging) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused, isFocused, isDragging, nextSlide, slides.length]);

    // One handler for mouse, touch and pen
    const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        suppressClick.current = false;
        dragStartX.current = e.clientX;
        dragDistance.current = 0;
        setDragProgress(0);
        setIsDragging(true);
    };

    // Listen on window so the drag survives the pointer leaving the slider
    useEffect(() => {
        if (!isDragging) return;

        const handleDragMove = (e: PointerEvent) => {
            if (dragStartX.current === null) return;
            const distance = e.clientX - dragStartX.current;

            dragDistance.current = distance;
            // Fully crossfaded at twice the commit threshold, so the fade tracks the pull
            setDragProgress(Math.max(-1, Math.min(1, distance / (MIN_SWIPE_DISTANCE * 2))));
        };

        const handleDragEnd = () => {
            const distance = dragDistance.current;

            if (distance <= -MIN_SWIPE_DISTANCE) {
                nextSlide();
            } else if (distance >= MIN_SWIPE_DISTANCE) {
                prevSlide();
            }

            // A drag must not open the slide's link
            suppressClick.current = Math.abs(distance) > 5;
            dragStartX.current = null;
            dragDistance.current = 0;
            setDragProgress(0);
            setIsDragging(false);
        };

        window.addEventListener('pointermove', handleDragMove);
        window.addEventListener('pointerup', handleDragEnd);
        window.addEventListener('pointercancel', handleDragEnd);
        return () => {
            window.removeEventListener('pointermove', handleDragMove);
            window.removeEventListener('pointerup', handleDragEnd);
            window.removeEventListener('pointercancel', handleDragEnd);
        };
    }, [isDragging, nextSlide, prevSlide]);

    // Slide the drag is fading towards; it sits under the active one at full opacity
    const dragTarget =
        slides.length < 2 || dragProgress === 0
            ? -1
            : dragProgress < 0
                ? (activeSlideIndex + 1) % slides.length
                : (activeSlideIndex - 1 + slides.length) % slides.length;

    if (slides.length === 0 && !sideBanner) return null;

    return (
        <div className="pt-4 pb-6 lg:pt-6 lg:pb-8">
            <Container>
                <div className={`grid gap-4 lg:gap-5 ${slides.length > 0 && sideBanner ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : ''}`}>
                    {/* Left: Slider */}
                    {slides.length > 0 && (
                        <div
                            className="relative w-full aspect-video bg-muted overflow-hidden group rounded-xl shadow-sm"
                            role="region"
                            aria-roledescription="carousel"
                            aria-label="Homepage banners"
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            onFocusCapture={() => setIsFocused(true)}
                            onBlurCapture={(event) => {
                                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                    setIsFocused(false);
                                }
                            }}
                        >
                            {/* Carousel Tracks */}
                            <div
                                className={`relative z-0 w-full h-full touch-pan-y select-none ${slides.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                onPointerDown={slides.length > 1 ? handleDragStart : undefined}
                            >
                                {slides.map((slide, index) => {
                                    const isActive = index === activeSlideIndex;
                                    const isTarget = !isActive && index === dragTarget;
                                    // The outgoing slide holds its opacity (delay-700) until the incoming one has
                                    // finished fading in on top of it, so the background never shows through
                                    const transitionClass = isDragging
                                        ? ''
                                        : `transition-opacity duration-700 ease-in-out ${isActive ? '' : 'delay-700'}`;

                                    return (
                                        <LocaleLink
                                            key={slide._id}
                                            href={slide.destinationUrl}
                                            className={`absolute inset-0 block ${isActive ? '' : 'pointer-events-none'} ${transitionClass}`}
                                            style={{
                                                // The active slide fades out over the incoming one, which waits underneath at full opacity
                                                opacity: isActive ? 1 - Math.abs(dragProgress) : isTarget ? 1 : 0,
                                                zIndex: isActive ? 2 : isTarget ? 1 : 0,
                                            }}
                                            aria-hidden={!isActive}
                                            tabIndex={isActive ? undefined : -1}
                                            onClick={(e) => {
                                                // e.detail === 0 means keyboard, which is never a drag
                                                if (suppressClick.current && e.detail !== 0) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onDragStart={(e) => e.preventDefault()}
                                        >
                                            <Image
                                                src={slide.image}
                                                alt={slide.title}
                                                fill
                                                preload={index === 0}
                                                sizes={sideBanner ? '(max-width: 1023px) 90vw, 60vw' : '90vw'}
                                                className="object-cover pointer-events-none"
                                                draggable={false}
                                            />
                                        </LocaleLink>
                                    );
                                })}
                            </div>

                            {slides.length > 1 && (<>
                                {/* Navigation Arrows */}
                                <button
                                    onClick={(e) => { e.preventDefault(); prevSlide(); }}
                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white text-primary/80 hover:text-primary rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 backdrop-blur-sm shadow-md z-10"
                                    aria-label="Previous slide"
                                >
                                    <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); nextSlide(); }}
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white text-primary/80 hover:text-primary rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-300 backdrop-blur-sm shadow-md z-10"
                                    aria-label="Next slide"
                                >
                                    <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                                </button>

                                {/* Pagination Dots */}
                                <div className="absolute bottom-3 sm:bottom-6 right-10 flex gap-1.5 sm:gap-2 z-10">
                                    {slides.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
                                            className={`transition-all duration-300 rounded-full ${activeSlideIndex === index
                                                ? 'w-6 h-2 sm:w-8 sm:h-2.5 bg-primary'
                                                : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/50 hover:bg-white'
                                                }`}
                                            aria-label={`Go to slide ${index + 1}`}
                                            aria-current={activeSlideIndex === index ? 'true' : undefined}
                                        />
                                    ))}
                                </div>
                            </>)}
                        </div>
                    )}
                    {sideBanner && (
                        <LocaleLink
                            href={sideBanner.destinationUrl}
                            aria-label={`Open ${sideBanner.title}`}
                            className={`group relative block w-full overflow-hidden rounded-xl bg-[#f1f1e9] shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#355e40] ${slides.length > 0 ? 'aspect-square lg:aspect-auto' : 'mx-auto aspect-square max-w-[32rem]'}`}
                        >
                            <Image
                                src={sideBanner.image}
                                alt={sideBanner.title}
                                fill
                                sizes={slides.length > 0 ? '(max-width: 1023px) 90vw, 30vw' : '(max-width: 1023px) 90vw, 32rem'}
                                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            />
                            <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/40" />
                        </LocaleLink>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default HeroBanner;
